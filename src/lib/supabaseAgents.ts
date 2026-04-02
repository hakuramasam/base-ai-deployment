import { supabase } from "@/integrations/supabase/client";

export interface Agent {
  id: string;
  wallet_address: string;
  name: string;
  description: string | null;
  agent_type: string;
  chain_id: number;
  skills: string[];
  price_per_call: number;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AgentMessage {
  id: string;
  from_agent_id: string;
  to_agent_id: string;
  message_type: string;
  content: string;
  status: string;
  created_at: string;
}

export interface TaskDelegation {
  id: string;
  requester_agent_id: string;
  executor_agent_id: string | null;
  task_description: string;
  status: string;
  result: string | null;
  payment_amount: number;
  payment_tx_hash: string | null;
  chain_id: number;
  created_at: string;
  completed_at: string | null;
}

export interface PaymentTransaction {
  id: string;
  from_address: string;
  to_address: string;
  amount: number;
  token_address: string | null;
  tx_hash: string | null;
  chain_id: number;
  payment_type: string;
  status: string;
  created_at: string;
}

export const fetchAgents = async (): Promise<Agent[]> => {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Agent[];
};

export const registerAgent = async (agent: Omit<Agent, "id" | "created_at" | "is_active" | "metadata">) => {
  const { data, error } = await supabase
    .from("agents")
    .insert(agent)
    .select()
    .single();
  if (error) throw error;
  return data as Agent;
};

export const fetchMessages = async (agentId: string): Promise<AgentMessage[]> => {
  const { data, error } = await supabase
    .from("agent_messages")
    .select("*")
    .or(`from_agent_id.eq.${agentId},to_agent_id.eq.${agentId}`)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as AgentMessage[];
};

export const sendMessage = async (msg: Omit<AgentMessage, "id" | "created_at" | "status">) => {
  const { data, error } = await supabase
    .from("agent_messages")
    .insert(msg)
    .select()
    .single();
  if (error) throw error;
  return data as AgentMessage;
};

export const fetchTasks = async (): Promise<TaskDelegation[]> => {
  const { data, error } = await supabase
    .from("task_delegations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []) as TaskDelegation[];
};

export const createTask = async (task: Pick<TaskDelegation, "requester_agent_id" | "task_description" | "payment_amount" | "chain_id">) => {
  const { data, error } = await supabase
    .from("task_delegations")
    .insert(task)
    .select()
    .single();
  if (error) throw error;
  return data as TaskDelegation;
};

export const fetchPayments = async (address?: string): Promise<PaymentTransaction[]> => {
  let query = supabase
    .from("payment_transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (address) {
    query = query.or(`from_address.ilike.${address},to_address.ilike.${address}`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as PaymentTransaction[];
};

export const recordPayment = async (payment: Omit<PaymentTransaction, "id" | "created_at" | "status">) => {
  const { data, error } = await supabase
    .from("payment_transactions")
    .insert(payment)
    .select()
    .single();
  if (error) throw error;
  return data as PaymentTransaction;
};
