import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bot, Zap, Plus, Search, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WalletButton from "@/components/WalletButton";
import { fetchAgents, registerAgent, type Agent } from "@/lib/supabaseAgents";
import { toast } from "sonner";

const chainNames: Record<number, string> = { 8453: "Base", 56: "BNB Chain" };

const AgentMarketplace = () => {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", agent_type: "general", skills: "", price_per_call: "0.1", chain_id: "8453" });

  useEffect(() => {
    fetchAgents().then(setAgents).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = agents.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const handleRegister = async () => {
    if (!address) return toast.error("Connect wallet first");
    try {
      const newAgent = await registerAgent({
        wallet_address: address,
        name: form.name,
        description: form.description,
        agent_type: form.agent_type,
        chain_id: parseInt(form.chain_id),
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
        price_per_call: parseFloat(form.price_per_call),
      });
      setAgents(prev => [newAgent, ...prev]);
      setRegisterOpen(false);
      toast.success("Agent registered!");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display text-lg tracking-wider text-foreground">Agent Marketplace</h1>
          </div>
          <WalletButton variant="hero" />
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search agents or skills..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
            <DialogTrigger asChild>
              <Button className="font-display tracking-wider"><Plus className="w-4 h-4 mr-2" />Register Agent</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle className="font-display tracking-wider">Register New Agent</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Agent Name</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Risk Agent" /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What does this agent do?" /></div>
                <div><Label>Type</Label>
                  <Select value={form.agent_type} onValueChange={v => setForm(p => ({ ...p, agent_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="trader">Trader</SelectItem>
                      <SelectItem value="risk">Risk Analyst</SelectItem>
                      <SelectItem value="data">Data Provider</SelectItem>
                      <SelectItem value="planner">Planner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Skills (comma-separated)</Label><Input value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} placeholder="swap, analysis, reporting" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Price per Call (USDC)</Label><Input type="number" value={form.price_per_call} onChange={e => setForm(p => ({ ...p, price_per_call: e.target.value }))} /></div>
                  <div><Label>Chain</Label>
                    <Select value={form.chain_id} onValueChange={v => setForm(p => ({ ...p, chain_id: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8453">Base</SelectItem>
                        <SelectItem value="56">BNB Chain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleRegister} className="w-full font-display tracking-wider">Register Agent</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading agents...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bot className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No agents found. Be the first to register!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((agent, i) => (
              <motion.div key={agent.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="bg-card border-border hover:border-primary/30 transition-colors h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-display text-sm tracking-wider">{agent.name}</CardTitle>
                      <Badge variant="outline" className="text-[10px] font-display">
                        <Globe className="w-3 h-3 mr-1" />{chainNames[agent.chain_id] || `Chain ${agent.chain_id}`}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">{agent.description || "No description"}</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.skills.slice(0, 4).map(s => (
                        <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground font-display">{agent.price_per_call} USDC/call</span>
                      <Button size="sm" variant="outline" className="h-7 text-xs font-display tracking-wider" onClick={() => navigate(`/a2a?agent=${agent.id}`)}>
                        <Zap className="w-3 h-3 mr-1" />Hire
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentMarketplace;
