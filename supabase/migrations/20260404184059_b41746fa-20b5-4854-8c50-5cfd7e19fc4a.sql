
-- Risk rules configuration table
CREATE TABLE public.risk_rules (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text,
  enabled boolean NOT NULL DEFAULT true,
  severity text NOT NULL DEFAULT 'medium',
  parameter numeric,
  param_label text,
  param_unit text,
  param_range_min numeric,
  param_range_max numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Risk/anomaly events table
CREATE TABLE public.risk_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet text NOT NULL,
  event_type text NOT NULL,
  score integer NOT NULL DEFAULT 0,
  details text,
  chain text NOT NULL DEFAULT 'Base',
  status text NOT NULL DEFAULT 'flagged',
  rule_id text REFERENCES public.risk_rules(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS policies for risk_rules (public read, public write for now)
ALTER TABLE public.risk_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Risk rules are viewable by everyone" ON public.risk_rules FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert risk rules" ON public.risk_rules FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update risk rules" ON public.risk_rules FOR UPDATE TO public USING (true);

-- RLS policies for risk_events
ALTER TABLE public.risk_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Risk events are viewable by everyone" ON public.risk_events FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert risk events" ON public.risk_events FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update risk events" ON public.risk_events FOR UPDATE TO public USING (true);

-- Trigger for updated_at on risk_rules
CREATE TRIGGER update_risk_rules_updated_at
  BEFORE UPDATE ON public.risk_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed default risk rules
INSERT INTO public.risk_rules (id, name, description, enabled, severity, parameter, param_label, param_unit, param_range_min, param_range_max) VALUES
  ('max-single-trade', 'Max Single Trade', 'Block trades exceeding a USDC threshold', true, 'high', 10000, 'Max Amount', 'USDC', 100, 100000),
  ('rapid-tx-detection', 'Rapid Transaction Detection', 'Flag wallets sending more than N transactions in 60s', true, 'critical', 10, 'Max Txs / 60s', 'txs', 3, 50),
  ('new-wallet-limit', 'New Wallet Limit', 'Restrict trade size for wallets younger than 24h', true, 'medium', 500, 'Limit', 'USDC', 50, 5000),
  ('slippage-guard', 'Slippage Guard', 'Reject swaps with price impact above threshold', false, 'high', 5, 'Max Slippage', '%', 1, 20),
  ('blocklist-check', 'Blocklist Check', 'Block transactions involving known-malicious addresses', true, 'critical', NULL, NULL, NULL, NULL, NULL),
  ('cross-chain-velocity', 'Cross-Chain Velocity', 'Flag rapid bridging between Base & BNB (potential laundering)', true, 'high', 3, 'Max Bridges / 10min', 'bridges', 1, 20);
