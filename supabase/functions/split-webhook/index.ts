import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * Split Webhook Listener
 *
 * Monitors split contract events on Base and triggers auto-swap
 * when new token distributions arrive. Called by:
 * 1. External webhook from 0xSplits / Alchemy / QuickNode
 * 2. Scheduled cron polling
 * 3. Manual trigger from dashboard
 *
 * POST body (webhook from indexer):
 *   event_type:       string — "distribution" | "deposit" | "withdrawal"
 *   contract_address: string — split contract address
 *   token_address:    string — ERC-20 token received
 *   amount:           string — amount in wei
 *   chain_id?:        number — default 8453
 *   tx_hash?:         string — on-chain tx hash of the event
 *   block_number?:    number
 *
 * GET (cron/manual poll):
 *   Checks all registered splits for pending distributions
 */

// Known stablecoins & tokens on Base to auto-swap
const SWAP_TOKENS: Record<string, string> = {
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": "USDC",
  "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb": "DAI",
  "0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA": "USDbC",
  "0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22": "cbETH",
};

// WETH — skip swap
const WETH_BASE = "0x4200000000000000000000000000000000000006";

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // --- Webhook mode (POST) ---
    if (req.method === "POST") {
      const body = await req.json();
      const {
        event_type,
        contract_address,
        token_address,
        amount,
        chain_id = 8453,
        tx_hash,
        block_number,
      } = body;

      if (!contract_address || !token_address || !amount) {
        return res(400, { error: "contract_address, token_address, and amount are required" });
      }

      console.log(`[webhook] ${event_type} on ${contract_address}: ${amount} of ${token_address}`);

      // Record the distribution event
      await supabase.from("payment_transactions").insert({
        from_address: contract_address,
        to_address: contract_address,
        amount: parseFloat(amount) / 1e18,
        chain_id,
        payment_type: "split_distribution",
        status: "received",
        tx_hash: tx_hash || null,
      });

      // Skip if already ETH/WETH
      if (token_address.toLowerCase() === WETH_BASE.toLowerCase()) {
        console.log("[webhook] Token is WETH, no swap needed");
        return res(200, {
          success: true,
          action: "no_swap_needed",
          reason: "Token is already WETH",
        });
      }

      // Trigger auto-swap to ETH
      const swapUrl = `${supabaseUrl}/functions/v1/auto-swap-eth`;
      const swapResponse = await fetch(swapUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          token_address,
          amount,
          chain_id,
          split_contract_address: contract_address,
        }),
      });

      const swapResult = await swapResponse.json();

      // Update the distribution record status
      if (swapResult.success) {
        console.log(`[webhook] Auto-swap triggered: ${swapResult.swap?.swap_tx_hash}`);
      } else {
        console.error(`[webhook] Auto-swap failed: ${swapResult.error}`);
      }

      return res(200, {
        success: true,
        event_type,
        contract_address,
        token: SWAP_TOKENS[token_address] || token_address,
        amount,
        swap_triggered: swapResult.success,
        swap_tx_hash: swapResult.swap?.swap_tx_hash || null,
      });
    }

    // --- Poll mode (GET) ---
    // Check all registered split contracts for pending distributions
    const { data: registeredSplits, error: fetchError } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("payment_type", "split_registered")
      .eq("status", "monitoring");

    if (fetchError) throw fetchError;

    const results = [];

    for (const split of registeredSplits || []) {
      const contractAddress = split.from_address;

      // Check for any unprocessed distributions
      const { data: pendingDistributions } = await supabase
        .from("payment_transactions")
        .select("*")
        .eq("from_address", contractAddress)
        .eq("payment_type", "split_distribution")
        .eq("status", "received")
        .order("created_at", { ascending: false })
        .limit(10);

      for (const dist of pendingDistributions || []) {
        // Trigger swap for each pending distribution
        const tokenAddress = dist.token_address || "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

        if (tokenAddress.toLowerCase() === WETH_BASE.toLowerCase()) {
          // Mark as processed — no swap needed
          await supabase
            .from("payment_transactions")
            .update({ status: "completed" })
            .eq("id", dist.id);
          continue;
        }

        const amountWei = (dist.amount * 1e18).toString();

        try {
          const swapUrl = `${supabaseUrl}/functions/v1/auto-swap-eth`;
          const swapResp = await fetch(swapUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseKey}`,
            },
            body: JSON.stringify({
              token_address: tokenAddress,
              amount: amountWei,
              chain_id: dist.chain_id,
              split_contract_address: contractAddress,
            }),
          });

          const swapData = await swapResp.json();

          await supabase
            .from("payment_transactions")
            .update({ status: swapData.success ? "swapped" : "swap_failed" })
            .eq("id", dist.id);

          results.push({
            contract: contractAddress,
            distribution_id: dist.id,
            swap_success: swapData.success,
            swap_tx: swapData.swap?.swap_tx_hash || null,
          });
        } catch (swapErr) {
          console.error(`[poll] Swap failed for ${dist.id}:`, swapErr);
          results.push({
            contract: contractAddress,
            distribution_id: dist.id,
            swap_success: false,
            error: swapErr instanceof Error ? swapErr.message : "Unknown",
          });
        }
      }
    }

    return res(200, {
      success: true,
      mode: "poll",
      registered_splits: (registeredSplits || []).length,
      processed: results.length,
      results,
    });
  } catch (e) {
    console.error("split-webhook error:", e);
    return res(500, { error: e instanceof Error ? e.message : "Unknown error" });
  }
});

function res(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
