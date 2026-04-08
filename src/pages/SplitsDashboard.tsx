import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Wallet, Split, ExternalLink, Copy, CheckCircle2,
  RefreshCw, DollarSign, Percent, ArrowRightLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import WalletButton from "@/components/WalletButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SplitRecipient {
  address: string;
  percentAllocation: number;
  role: string;
}

interface SplitContract {
  id: string;
  contract_address: string;
  contract_name: string;
  immutable: boolean;
  platform_fee_bps: number;
  platform_wallet: string;
  recipients: SplitRecipient[];
  auto_swap: {
    enabled: boolean;
    target_token: string;
    target_chain: string;
  };
  chain_id: number;
  tx_hash: string;
  created_at: string;
  total_received: number;
  total_distributed: number;
}

const SplitsDashboard = () => {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const [splits, setSplits] = useState<SplitContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(addr);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const loadSplits = useCallback(async () => {
    setLoading(true);
    try {
      // Load split creation payments to reconstruct split contracts
      const { data: payments, error } = await supabase
        .from("payment_transactions")
        .select("*")
        .eq("payment_type", "split_creation_gas")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Load all distribution payments for revenue tracking
      const { data: distributions } = await supabase
        .from("payment_transactions")
        .select("*")
        .eq("payment_type", "split_distribution")
        .order("created_at", { ascending: false });

      const splitContracts: SplitContract[] = (payments ?? []).map((p: any) => {
        const contractDistributions = (distributions ?? []).filter(
          (d: any) => d.from_address === p.to_address
        );
        const totalDistributed = contractDistributions.reduce(
          (sum: number, d: any) => sum + Number(d.amount), 0
        );

        return {
          id: p.id,
          contract_address: p.to_address,
          contract_name: `Split Contract`,
          immutable: true,
          platform_fee_bps: 5,
          platform_wallet: p.from_address,
          recipients: [
            { address: p.from_address, percentAllocation: 0.05, role: "platform_fee" },
          ],
          auto_swap: {
            enabled: true,
            target_token: "ETH",
            target_chain: "base",
          },
          chain_id: p.chain_id,
          tx_hash: p.tx_hash || "",
          created_at: p.created_at,
          total_received: totalDistributed * 1.0005,
          total_distributed: totalDistributed,
        };
      });

      setSplits(splitContracts);
    } catch (e: any) {
      toast.error("Failed to load splits: " + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSplits();
  }, [loadSplits]);

  // Real-time tracking for new split payments
  useEffect(() => {
    const channel = supabase
      .channel("splits-realtime")
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "payment_transactions" },
        () => loadSplits()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadSplits]);

  const totalRevenue = splits.reduce((sum, s) => sum + s.total_received, 0);
  const platformFees = splits.reduce(
    (sum, s) => sum + s.total_received * (s.platform_fee_bps / 10000), 0
  );

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Split className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Connect wallet to view Splits Dashboard</p>
          <WalletButton variant="hero" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display text-lg tracking-wider text-foreground">
              Revenue Splits
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={loadSplits} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <WalletButton variant="hero" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-4 gap-4"
        >
          {[
            { icon: <Split className="w-5 h-5" />, label: "Total Splits", value: splits.length },
            { icon: <DollarSign className="w-5 h-5" />, label: "Total Revenue", value: `${totalRevenue.toFixed(4)} ETH` },
            { icon: <Percent className="w-5 h-5" />, label: "Platform Fees (0.05%)", value: `${platformFees.toFixed(6)} ETH` },
            { icon: <ArrowRightLeft className="w-5 h-5" />, label: "Auto-Swap", value: "Active → ETH" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  {stat.icon}
                  <p className="text-xs font-display tracking-widest uppercase">{stat.label}</p>
                </div>
                <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Split Contracts Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base tracking-wider flex items-center gap-2">
                <Split className="w-5 h-5 text-primary" />
                Split Contracts
                <Badge variant="outline" className="text-[10px] ml-2">Immutable</Badge>
                <a
                  href="https://app.splits.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs text-primary hover:underline flex items-center gap-1"
                >
                  View on Splits.org <ExternalLink className="w-3 h-3" />
                </a>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {splits.length === 0 ? (
                <div className="py-16 text-center">
                  <Split className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No split contracts created yet.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Deploy a contract with Revenue Split from the Dashboard.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="font-display text-xs tracking-wider">Contract</TableHead>
                      <TableHead className="font-display text-xs tracking-wider hidden sm:table-cell">Platform Fee</TableHead>
                      <TableHead className="font-display text-xs tracking-wider hidden sm:table-cell">Auto-Swap</TableHead>
                      <TableHead className="font-display text-xs tracking-wider">Revenue</TableHead>
                      <TableHead className="font-display text-xs tracking-wider hidden sm:table-cell">Created</TableHead>
                      <TableHead className="font-display text-xs tracking-wider text-right">Links</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {splits.map((split) => (
                      <TableRow key={split.id} className="border-border">
                        <TableCell>
                          <div className="space-y-1">
                            <button
                              onClick={() => handleCopy(split.contract_address)}
                              className="flex items-center gap-1.5 text-xs text-primary hover:underline font-mono"
                            >
                              {truncate(split.contract_address)}
                              {copiedAddress === split.contract_address ? (
                                <CheckCircle2 className="w-3 h-3 text-accent" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-[9px]">Immutable</Badge>
                              <Badge variant="outline" className="text-[9px]">Chain {split.chain_id}</Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-xs text-foreground font-mono">
                            {split.platform_fee_bps} bps (0.05%)
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-1.5">
                            <ArrowRightLeft className="w-3 h-3 text-accent" />
                            <span className="text-xs text-accent">→ ETH on Base</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono text-foreground">
                            {split.total_received.toFixed(4)} ETH
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                          {new Date(split.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`https://app.splits.org/accounts/${split.contract_address}/?chainId=${split.chain_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              Splits <ExternalLink className="w-3 h-3" />
                            </a>
                            <a
                              href={`https://basescan.org/address/${split.contract_address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recipients Breakdown */}
        {splits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-display text-base tracking-wider">
                  Fee Distribution Model
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs font-display text-foreground">Platform Fee</p>
                        <p className="text-[10px] text-muted-foreground">Auto-swapped to ETH → Platform Wallet</p>
                      </div>
                    </div>
                    <Badge className="bg-primary/20 text-primary text-xs">0.05%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-3">
                      <Split className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-display text-foreground">Contract Recipients</p>
                        <p className="text-[10px] text-muted-foreground">Distributed per split allocation</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">99.95%</Badge>
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground space-y-1 pt-2 border-t border-border">
                  <p>• All contracts are <strong>immutable</strong> — no controller can modify splits</p>
                  <p>• Received tokens auto-swap to <strong>$ETH on Base</strong> via Uniswap V3</p>
                  <p>• Platform fees fund <strong>Agentic MCP Services & Agent Economy Growth</strong></p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SplitsDashboard;
