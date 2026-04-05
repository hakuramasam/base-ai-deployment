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
