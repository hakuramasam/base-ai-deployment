import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Shield, AlertTriangle, CheckCircle2, XCircle,
  TrendingUp, Activity, Zap, Settings, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WalletButton from "@/components/WalletButton";

// ---------- Risk Rule Engine ----------
interface RiskRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: "low" | "medium" | "high" | "critical";
  parameter?: number;
  paramLabel?: string;
  paramUnit?: string;
  paramRange?: [number, number];
}

const defaultRules: RiskRule[] = [
  {
    id: "max-single-trade",
    name: "Max Single Trade",
    description: "Block trades exceeding a USDC threshold",
    enabled: true,
    severity: "high",
    parameter: 10000,
    paramLabel: "Max Amount",
    paramUnit: "USDC",
    paramRange: [100, 100000],
  },
  {
    id: "rapid-tx-detection",
    name: "Rapid Transaction Detection",
    description: "Flag wallets sending more than N transactions in 60s",
    enabled: true,
    severity: "critical",
    parameter: 10,
    paramLabel: "Max Txs / 60s",
    paramUnit: "txs",
    paramRange: [3, 50],
  },
  {
    id: "new-wallet-limit",
    name: "New Wallet Limit",
    description: "Restrict trade size for wallets younger than 24h",
    enabled: true,
    severity: "medium",
    parameter: 500,
    paramLabel: "Limit",
    paramUnit: "USDC",
    paramRange: [50, 5000],
  },
  {
    id: "slippage-guard",
    name: "Slippage Guard",
    description: "Reject swaps with price impact above threshold",
    enabled: false,
    severity: "high",
    parameter: 5,
    paramLabel: "Max Slippage",
    paramUnit: "%",
    paramRange: [1, 20],
  },
  {
    id: "blocklist-check",
    name: "Blocklist Check",
    description: "Block transactions involving known-malicious addresses",
    enabled: true,
    severity: "critical",
  },
  {
    id: "cross-chain-velocity",
    name: "Cross-Chain Velocity",
    description: "Flag rapid bridging between Base & BNB (potential laundering)",
    enabled: true,
    severity: "high",
    parameter: 3,
    paramLabel: "Max Bridges / 10min",
    paramUnit: "bridges",
    paramRange: [1, 20],
  },
];

// ---------- Anomaly Detection (simulated ML scoring) ----------
interface AnomalyEvent {
  id: string;
  timestamp: string;
  wallet: string;
  type: string;
  score: number; // 0-100
  details: string;
  chain: "Base" | "BNB";
  status: "flagged" | "cleared" | "blocked";
}

const sampleAnomalies: AnomalyEvent[] = [
  {
    id: "a1", timestamp: new Date(Date.now() - 120000).toISOString(),
    wallet: "0x7a3e...f1c2", type: "Rapid Transactions", score: 92,
    details: "14 txs in 45 seconds — exceeds velocity threshold", chain: "Base", status: "blocked",
  },
  {
    id: "a2", timestamp: new Date(Date.now() - 300000).toISOString(),
    wallet: "0x4b2d...a8e9", type: "Large Trade", score: 78,
    details: "$47,200 single swap on low-liquidity pair", chain: "BNB", status: "flagged",
  },
  {
    id: "a3", timestamp: new Date(Date.now() - 600000).toISOString(),
    wallet: "0x9f1c...3d7b", type: "Cross-Chain Bridge", score: 65,
    details: "4 bridge txs Base→BNB in 8 minutes", chain: "Base", status: "flagged",
  },
  {
    id: "a4", timestamp: new Date(Date.now() - 900000).toISOString(),
    wallet: "0x2e8a...c4f0", type: "New Wallet Activity", score: 45,
    details: "Wallet age 2h, attempted $2,100 trade", chain: "Base", status: "cleared",
  },
  {
    id: "a5", timestamp: new Date(Date.now() - 1800000).toISOString(),
    wallet: "0xd5f3...7a1e", type: "Blocklisted Address", score: 99,
    details: "OFAC-listed address attempted interaction", chain: "BNB", status: "blocked",
  },
];

const severityColor: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-accent/20 text-accent-foreground",
  high: "bg-destructive/20 text-destructive",
  critical: "bg-destructive text-destructive-foreground",
};

const statusIcon: Record<string, React.ReactNode> = {
  flagged: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  cleared: <CheckCircle2 className="w-4 h-4 text-green-500" />,
  blocked: <XCircle className="w-4 h-4 text-destructive" />,
};

const RiskSafety = () => {
  const navigate = useNavigate();
  const [rules, setRules] = useState<RiskRule[]>(defaultRules);
  const [anomalies] = useState<AnomalyEvent[]>(sampleAnomalies);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleRule = (id: string) =>
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));

  const updateParam = (id: string, value: number) =>
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, parameter: value } : r)));

  const filteredAnomalies = useMemo(
    () =>
      anomalies.filter(
        (a) =>
          a.wallet.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.type.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [anomalies, searchQuery]
  );

  const stats = useMemo(() => ({
    total: anomalies.length,
    blocked: anomalies.filter((a) => a.status === "blocked").length,
    flagged: anomalies.filter((a) => a.status === "flagged").length,
    avgScore: Math.round(anomalies.reduce((s, a) => s + a.score, 0) / anomalies.length),
  }), [anomalies]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h1 className="font-display text-lg tracking-wider text-foreground">Risk & Safety</h1>
            </div>
          </div>
          <WalletButton variant="hero" />
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Events Detected", value: stats.total, icon: <Activity className="w-4 h-4" /> },
            { label: "Blocked", value: stats.blocked, icon: <XCircle className="w-4 h-4" /> },
            { label: "Flagged", value: stats.flagged, icon: <AlertTriangle className="w-4 h-4" /> },
            { label: "Avg Risk Score", value: stats.avgScore, icon: <BarChart3 className="w-4 h-4" /> },
          ].map((s) => (
            <Card key={s.label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  {s.icon}
                  <span className="text-[10px] font-display tracking-widest uppercase">{s.label}</span>
                </div>
                <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <Tabs defaultValue="anomalies" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="anomalies" className="font-display text-xs tracking-wider">
              <Zap className="w-3.5 h-3.5 mr-1.5" />Anomaly Detection
            </TabsTrigger>
            <TabsTrigger value="rules" className="font-display text-xs tracking-wider">
              <Settings className="w-3.5 h-3.5 mr-1.5" />Rule Engine
            </TabsTrigger>
          </TabsList>

          {/* Anomaly Detection Tab */}
          <TabsContent value="anomalies">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-base tracking-wider">ML Anomaly Feed</CardTitle>
                    <Input
                      placeholder="Search wallet or type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-[200px] h-8 text-xs"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="font-display text-xs tracking-wider">Status</TableHead>
                        <TableHead className="font-display text-xs tracking-wider">Type</TableHead>
                        <TableHead className="font-display text-xs tracking-wider hidden sm:table-cell">Wallet</TableHead>
                        <TableHead className="font-display text-xs tracking-wider">Score</TableHead>
                        <TableHead className="font-display text-xs tracking-wider hidden sm:table-cell">Chain</TableHead>
                        <TableHead className="font-display text-xs tracking-wider hidden md:table-cell">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAnomalies.map((a) => (
                        <TableRow key={a.id} className="border-border">
                          <TableCell>{statusIcon[a.status]}</TableCell>
                          <TableCell className="text-xs font-display text-foreground">{a.type}</TableCell>
                          <TableCell className="hidden sm:table-cell font-mono text-xs text-muted-foreground">{a.wallet}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    a.score >= 80 ? "bg-destructive" : a.score >= 50 ? "bg-yellow-500" : "bg-green-500"
                                  }`}
                                  style={{ width: `${a.score}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono text-foreground">{a.score}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="outline" className="text-[10px] font-display">{a.chain}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[200px] truncate">
                            {a.details}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Rule Engine Tab */}
          <TabsContent value="rules">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {rules.map((rule) => (
                <Card key={rule.id} className={`bg-card border-border ${!rule.enabled ? "opacity-50" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-sm font-semibold text-foreground">{rule.name}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-display tracking-wider ${severityColor[rule.severity]}`}>
                            {rule.severity}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{rule.description}</p>
                        {rule.parameter !== undefined && rule.enabled && (
                          <div className="flex items-center gap-4 pt-2">
                            <Label className="text-xs text-muted-foreground whitespace-nowrap">{rule.paramLabel}</Label>
                            <Slider
                              value={[rule.parameter]}
                              onValueChange={([v]) => updateParam(rule.id, v)}
                              min={rule.paramRange?.[0] ?? 0}
                              max={rule.paramRange?.[1] ?? 100}
                              step={1}
                              className="flex-1 max-w-[200px]"
                            />
                            <span className="text-xs font-mono text-foreground min-w-[60px]">
                              {rule.parameter} {rule.paramUnit}
                            </span>
                          </div>
                        )}
                      </div>
                      <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RiskSafety;
