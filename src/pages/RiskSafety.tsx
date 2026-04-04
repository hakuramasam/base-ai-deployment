import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Shield, AlertTriangle, CheckCircle2, XCircle,
  Activity, Zap, Settings, BarChart3
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RiskRule {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  severity: string;
  parameter: number | null;
  param_label: string | null;
  param_unit: string | null;
  param_range_min: number | null;
  param_range_max: number | null;
}

interface RiskEvent {
  id: string;
  wallet: string;
  event_type: string;
  score: number;
  details: string | null;
  chain: string;
  status: string;
  rule_id: string | null;
  created_at: string;
}

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
  const [rules, setRules] = useState<RiskRule[]>([]);
  const [events, setEvents] = useState<RiskEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rulesRes, eventsRes] = await Promise.all([
          supabase.from("risk_rules").select("*").order("created_at"),
          supabase.from("risk_events").select("*").order("created_at", { ascending: false }).limit(100),
        ]);
        if (rulesRes.data) setRules(rulesRes.data as RiskRule[]);
        if (eventsRes.data) setEvents(eventsRes.data as RiskEvent[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    // Real-time subscription for new risk events
    const channel = supabase
      .channel("risk-events-realtime")
      .on("postgres_changes" as any, { event: "INSERT", schema: "public", table: "risk_events" }, (payload: any) => {
        setEvents(prev => [payload.new as RiskEvent, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const toggleRule = useCallback(async (id: string) => {
    const rule = rules.find(r => r.id === id);
    if (!rule) return;
    const newEnabled = !rule.enabled;
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: newEnabled } : r));
    const { error } = await supabase.from("risk_rules").update({ enabled: newEnabled }).eq("id", id);
    if (error) {
      toast.error("Failed to update rule");
      setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !newEnabled } : r));
    }
  }, [rules]);

  const updateParam = useCallback(async (id: string, value: number) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, parameter: value } : r));
    // Debounced save handled by onValueCommit
  }, []);

  const saveParam = useCallback(async (id: string, value: number) => {
    const { error } = await supabase.from("risk_rules").update({ parameter: value }).eq("id", id);
    if (error) toast.error("Failed to save parameter");
  }, []);

  const filteredEvents = useMemo(
    () => events.filter(a =>
      a.wallet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.event_type.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [events, searchQuery]
  );

  const stats = useMemo(() => ({
    total: events.length,
    blocked: events.filter(a => a.status === "blocked").length,
    flagged: events.filter(a => a.status === "flagged").length,
    avgScore: events.length ? Math.round(events.reduce((s, a) => s + a.score, 0) / events.length) : 0,
  }), [events]);

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Events Detected", value: stats.total, icon: <Activity className="w-4 h-4" /> },
            { label: "Blocked", value: stats.blocked, icon: <XCircle className="w-4 h-4" /> },
            { label: "Flagged", value: stats.flagged, icon: <AlertTriangle className="w-4 h-4" /> },
            { label: "Avg Risk Score", value: stats.avgScore, icon: <BarChart3 className="w-4 h-4" /> },
          ].map(s => (
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

          <TabsContent value="anomalies">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-base tracking-wider">ML Anomaly Feed</CardTitle>
                    <Input
                      placeholder="Search wallet or type..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="max-w-[200px] h-8 text-xs"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <Shield className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No anomaly events detected yet.</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Events will appear here when the ML engine flags suspicious activity.</p>
                    </div>
                  ) : (
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
                        {filteredEvents.map(a => (
                          <TableRow key={a.id} className="border-border">
                            <TableCell>{statusIcon[a.status] || statusIcon.flagged}</TableCell>
                            <TableCell className="text-xs font-display text-foreground">{a.event_type}</TableCell>
                            <TableCell className="hidden sm:table-cell font-mono text-xs text-muted-foreground">{a.wallet}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-2 rounded-full bg-muted overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${a.score >= 80 ? "bg-destructive" : a.score >= 50 ? "bg-yellow-500" : "bg-green-500"}`}
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
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="rules">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {rules.map(rule => (
                <Card key={rule.id} className={`bg-card border-border ${!rule.enabled ? "opacity-50" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-sm font-semibold text-foreground">{rule.name}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-display tracking-wider ${severityColor[rule.severity] || ""}`}>
                            {rule.severity}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{rule.description}</p>
                        {rule.parameter !== null && rule.enabled && (
                          <div className="flex items-center gap-4 pt-2">
                            <Label className="text-xs text-muted-foreground whitespace-nowrap">{rule.param_label}</Label>
                            <Slider
                              value={[rule.parameter]}
                              onValueChange={([v]) => updateParam(rule.id, v)}
                              onValueCommit={([v]) => saveParam(rule.id, v)}
                              min={rule.param_range_min ?? 0}
                              max={rule.param_range_max ?? 100}
                              step={1}
                              className="flex-1 max-w-[200px]"
                            />
                            <span className="text-xs font-mono text-foreground min-w-[60px]">
                              {rule.parameter} {rule.param_unit}
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
