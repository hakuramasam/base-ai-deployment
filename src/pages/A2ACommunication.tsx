import { useState, useEffect, useCallback } from "react";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { useAccount } from "wagmi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MessageSquare, Send, ListChecks, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import WalletButton from "@/components/WalletButton";
import { fetchAgents, fetchTasks, fetchMessages, createTask, sendMessage, completeTask, type Agent, type TaskDelegation, type AgentMessage } from "@/lib/supabaseAgents";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  open: "bg-primary/20 text-primary",
  assigned: "bg-accent/20 text-accent",
  completed: "bg-accent/20 text-accent",
  failed: "bg-destructive/20 text-destructive",
};

const A2ACommunication = () => {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedAgent = searchParams.get("agent");

  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<TaskDelegation[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [selectedAgent, setSelectedAgent] = useState(preselectedAgent || "");
  const [taskDesc, setTaskDesc] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("0.1");
  const [chainId, setChainId] = useState("8453");
  const [messageContent, setMessageContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAgents(), fetchTasks()])
      .then(([a, t]) => { setAgents(a); setTasks(t); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useRealtimeSubscription<TaskDelegation>({
    table: "task_delegations",
    onInsert: useCallback((t: TaskDelegation) => setTasks(prev => [t, ...prev]), []),
    onUpdate: useCallback((t: TaskDelegation) => setTasks(prev => prev.map(x => x.id === t.id ? t : x)), []),
    enabled: isConnected,
  });

  useRealtimeSubscription<AgentMessage>({
    table: "agent_messages",
    onInsert: useCallback((m: AgentMessage) => setMessages(prev => [m, ...prev]), []),
    onUpdate: useCallback((m: AgentMessage) => setMessages(prev => prev.map(x => x.id === m.id ? m : x)), []),
    enabled: isConnected,
  });

  const myAgents = agents.filter(a => a.wallet_address.toLowerCase() === address?.toLowerCase());
  const myAgentIds = new Set(myAgents.map(a => a.id));

  // Fetch messages when myAgents are available
  useEffect(() => {
    if (myAgents.length > 0) {
      fetchMessages(myAgents[0].id).then(setMessages).catch(console.error);
    }
  }, [agents, address]);
  const relevantTasks = tasks.filter(t => myAgentIds.has(t.requester_agent_id) || (t.executor_agent_id && myAgentIds.has(t.executor_agent_id)));

  const handleCreateTask = async () => {
    if (!myAgents.length) return toast.error("Register an agent first in the Marketplace");
    try {
      const task = await createTask({
        requester_agent_id: myAgents[0].id,
        task_description: taskDesc,
        payment_amount: parseFloat(paymentAmount),
        chain_id: parseInt(chainId),
      });
      setTasks(prev => [task, ...prev]);
      setTaskDesc("");
      toast.success("Task delegated!");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleSendMessage = async () => {
    if (!myAgents.length || !selectedAgent) return toast.error("Select agents first");
    try {
      await sendMessage({
        from_agent_id: myAgents[0].id,
        to_agent_id: selectedAgent,
        message_type: "task",
        content: messageContent,
        metadata: {},
      });
      setMessageContent("");
      toast.success("Message sent!");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Connect wallet to access A2A Communication</p>
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
            <h1 className="font-display text-lg tracking-wider text-foreground">A2A Communication</h1>
          </div>
          <WalletButton variant="hero" />
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="delegate" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="delegate" className="font-display text-xs tracking-wider">
              <ListChecks className="w-4 h-4 mr-1.5" />Task Delegation
            </TabsTrigger>
            <TabsTrigger value="message" className="font-display text-xs tracking-wider">
              <MessageSquare className="w-4 h-4 mr-1.5" />Agent Messaging
            </TabsTrigger>
          </TabsList>

          <TabsContent value="delegate" className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="font-display text-sm tracking-wider">Delegate a Task</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Task Description</Label><Textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="Analyze risk exposure for ETH/USDC pair..." /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Payment (USDC)</Label><Input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} /></div>
                    <div><Label>Chain</Label>
                      <Select value={chainId} onValueChange={setChainId}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="8453">Base</SelectItem>
                          <SelectItem value="56">BNB Chain</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleCreateTask} className="font-display tracking-wider"><Send className="w-4 h-4 mr-2" />Delegate Task</Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-card border-border">
                <CardHeader><CardTitle className="font-display text-sm tracking-wider">Task Board</CardTitle></CardHeader>
                <CardContent>
                  {relevantTasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No tasks yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {relevantTasks.map(task => {
                        const canComplete = task.status === "open" || task.status === "assigned";
                        const isRequester = myAgentIds.has(task.requester_agent_id);
                        return (
                        <div key={task.id} className="p-3 rounded-lg bg-muted/50 border border-border space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-foreground font-medium line-clamp-1">{task.task_description}</p>
                            <Badge className={`text-[10px] ${statusColors[task.status] || ""}`}>{task.status}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                              <span>{task.payment_amount} USDC</span>
                              <span>{new Date(task.created_at).toLocaleDateString()}</span>
                              {task.payment_tx_hash && (
                                <a href={`https://basescan.org/tx/${task.payment_tx_hash}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Paid ✓</a>
                              )}
                            </div>
                            {canComplete && !isRequester && myAgents.length > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-[10px] h-6 px-2 border-accent/30 text-accent hover:bg-accent/10"
                                onClick={async () => {
                                  try {
                                    const { task: updated, payment } = await completeTask(task.id, "Task completed successfully", myAgents[0].id);
                                    setTasks(prev => prev.map(t => t.id === updated.id ? { ...updated, payment_tx_hash: payment.tx_hash } : t));
                                    toast.success(`Task completed! Payment of ${task.payment_amount} USDC sent.`);
                                  } catch (e: any) {
                                    toast.error(e.message);
                                  }
                                }}
                              >
                                Complete & Pay
                              </Button>
                            )}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="message" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="font-display text-sm tracking-wider">Send Message to Agent</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Target Agent</Label>
                  <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                    <SelectTrigger><SelectValue placeholder="Select agent..." /></SelectTrigger>
                    <SelectContent>
                      {agents.filter(a => !myAgentIds.has(a.id)).map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          <div className="flex items-center gap-2">
                            <Bot className="w-3 h-3" />{a.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Message</Label><Textarea value={messageContent} onChange={e => setMessageContent(e.target.value)} placeholder="Request analysis of..." /></div>
                <Button onClick={handleSendMessage} className="font-display tracking-wider"><Send className="w-4 h-4 mr-2" />Send</Button>
              </CardContent>
            </Card>

            {/* Message History */}
            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="font-display text-sm tracking-wider">Message History</CardTitle></CardHeader>
              <CardContent>
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No messages yet.</p>
                ) : (
                  <div className="space-y-3">
                    {messages.map(msg => {
                      const isSent = myAgentIds.has(msg.from_agent_id);
                      const otherAgent = agents.find(a => a.id === (isSent ? msg.to_agent_id : msg.from_agent_id));
                      return (
                        <div key={msg.id} className={`p-3 rounded-lg border border-border space-y-1 ${isSent ? "bg-primary/5 ml-4" : "bg-muted/50 mr-4"}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Bot className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] font-display text-muted-foreground">
                                {isSent ? `To: ${otherAgent?.name || "Unknown"}` : `From: ${otherAgent?.name || "Unknown"}`}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-[10px]">{msg.status}</Badge>
                          </div>
                          <p className="text-xs text-foreground">{msg.content}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default A2ACommunication;
