import { supabase } from "@/integrations/supabase/client";

/**
 * Call the x402-pay edge function to sign & record a payment
 * using the platform's default wallet (server-side signing).
 */
export async function sendX402Payment(params: {
  to_address: string;
  amount: number;
  payment_type?: string;
  chain_id?: number;
  task_id?: string;
}) {
  const { data, error } = await supabase.functions.invoke("x402-pay", {
    body: params,
  });
  if (error) throw error;
  return data as {
    success: boolean;
    payment: Record<string, unknown>;
    tx_hash: string;
    from_address: string;
  };
}

/**
 * Call the deploy-contract edge function to deploy a contract
 * using the platform's default wallet for gas fees (server-side signing).
 */
export async function deployContractViaWallet(params: {
  contract_name: string;
  bytecode: string;
  constructor_args?: unknown[];
  category?: string;
  chain_id?: number;
}) {
  const { data, error } = await supabase.functions.invoke("deploy-contract", {
    body: params,
  });
  if (error) throw error;
  return data as {
    success: boolean;
    contract_address: string;
    deployer: string;
    tx_hash: string;
    contract_name: string;
    category: string;
    chain_id: number;
  };
}

/**
 * Create an immutable split contract with 0.05% platform fee.
 * All received tokens auto-swap to ETH on Base.
 */
export async function createSplitContract(params: {
  recipients: { address: string; percentAllocation: number }[];
  distributor_fee?: number;
  chain_id?: number;
  contract_name?: string;
}) {
  const { data, error } = await supabase.functions.invoke("create-split", {
    body: params,
  });
  if (error) throw error;
  return data as {
    success: boolean;
    split: {
      contract_address: string;
      controller: string;
      immutable: boolean;
      platform_fee_bps: number;
      platform_wallet: string;
      recipients: { address: string; percentAllocation: number; role: string }[];
      auto_swap: {
        enabled: boolean;
        target_token: string;
        target_chain: string;
        recipient: string;
        purpose: string;
      };
      chain_id: number;
      tx_hash: string;
    };
    contract_name: string;
    message: string;
  };
}

/**
 * Auto-swap received tokens to ETH on Base via Uniswap V3.
 */
export async function autoSwapToEth(params: {
  token_address: string;
  amount: string;
  recipient?: string;
  slippage_bps?: number;
  chain_id?: number;
  split_contract_address?: string;
}) {
  const { data, error } = await supabase.functions.invoke("auto-swap-eth", {
    body: params,
  });
  if (error) throw error;
  return data as {
    success: boolean;
    swap: {
      token_in: string;
      token_out: string;
      amount_in: string;
      fee_tier: number;
      recipient: string;
      router: string;
      approve_tx_hash: string;
      swap_tx_hash: string;
      chain_id: number;
      slippage_bps: number;
      deadline: number;
    };
    message: string;
  };
}

/**
 * Trigger the split webhook listener to check for pending distributions
 * and auto-swap tokens to ETH.
 */
export async function pollSplitWebhook() {
  const { data, error } = await supabase.functions.invoke("split-webhook", {
    method: "GET",
  } as any);
  if (error) throw error;
  return data as {
    success: boolean;
    mode: string;
    registered_splits: number;
    processed: number;
    results: Array<{
      contract: string;
      distribution_id: string;
      swap_success: boolean;
      swap_tx?: string;
    }>;
  };
}

/**
 * Send a webhook event for a split contract distribution.
 */
export async function notifySplitDistribution(params: {
  event_type: string;
  contract_address: string;
  token_address: string;
  amount: string;
  chain_id?: number;
  tx_hash?: string;
}) {
  const { data, error } = await supabase.functions.invoke("split-webhook", {
    body: params,
  });
  if (error) throw error;
  return data;
}
