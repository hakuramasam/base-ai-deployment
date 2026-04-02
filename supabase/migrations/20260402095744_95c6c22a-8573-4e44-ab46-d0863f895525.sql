
-- Agents table: registered AI agents on the platform
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  agent_type TEXT NOT NULL DEFAULT 'general',
  chain_id INTEGER NOT NULL DEFAULT 8453,
  skills TEXT[] DEFAULT '{}',
  price_per_call NUMERIC DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents are viewable by everyone"
  ON public.agents FOR SELECT USING (true);
CREATE POLICY "Anyone can register agents"
  ON public.agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Owners can update their agents"
  ON public.agents FOR UPDATE USING (true);

-- Agent messages: A2A communication
CREATE TABLE public.agent_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  to_agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'task',
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages are viewable by everyone"
  ON public.agent_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can send messages"
  ON public.agent_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update message status"
  ON public.agent_messages FOR UPDATE USING (true);

-- Task delegations: tracks task assignments between agents
CREATE TABLE public.task_delegations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  executor_agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  task_description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  result TEXT,
  payment_amount NUMERIC DEFAULT 0,
  payment_tx_hash TEXT,
  chain_id INTEGER NOT NULL DEFAULT 8453,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.task_delegations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks are viewable by everyone"
  ON public.task_delegations FOR SELECT USING (true);
CREATE POLICY "Anyone can create tasks"
  ON public.task_delegations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update tasks"
  ON public.task_delegations FOR UPDATE USING (true);

-- Payment transactions: x402 payment tracking
CREATE TABLE public.payment_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  token_address TEXT,
  tx_hash TEXT,
  chain_id INTEGER NOT NULL DEFAULT 8453,
  payment_type TEXT NOT NULL DEFAULT 'api_call',
  task_delegation_id UUID REFERENCES public.task_delegations(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payments are viewable by everyone"
  ON public.payment_transactions FOR SELECT USING (true);
CREATE POLICY "Anyone can record payments"
  ON public.payment_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update payment status"
  ON public.payment_transactions FOR UPDATE USING (true);

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_agents_wallet ON public.agents(wallet_address);
CREATE INDEX idx_agents_chain ON public.agents(chain_id);
CREATE INDEX idx_messages_to ON public.agent_messages(to_agent_id);
CREATE INDEX idx_tasks_status ON public.task_delegations(status);
CREATE INDEX idx_payments_from ON public.payment_transactions(from_address);
