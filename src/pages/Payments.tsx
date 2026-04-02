import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, TrendingUp, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import WalletButton from "@/components/WalletButton";
import { fetchPayments, type PaymentTransaction } from "@/lib/supabaseAgents";

const chainNames: Record<number, string> = { 8453: "Base", 56: "BNB Chain" };

const Payments = () => {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments(address).then(setPayments).catch(console.error).finally(() => setLoading(false));
  }, [address]);

  const totalIn = payments.filter(p => p.to_address.toLowerCase() === address?.toLowerCase()).reduce((s, p) => s + p.amount, 0);
  const totalOut = payments.filter(p => p.from_address.toLowerCase() === address?.toLowerCase()).reduce((s, p) => s + p.amount, 0);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <CreditCard className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Connect wallet to view payments</p>
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
            <h1 className="font-display text-lg tracking-wider text-foreground">x402 Payments</h1>
          </div>
          <WalletButton variant="hero" />
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <p className="text-xs font-display tracking-widest uppercase text-muted-foreground mb-1">Total Received</p>
              <p className="text-3xl font-display font-bold text-accent">{totalIn.toFixed(2)} <span className="text-sm">USDC</span></p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <p className="text-xs font-display tracking-widest uppercase text-muted-foreground mb-1">Total Spent</p>
              <p className="text-3xl font-display font-bold text-destructive">{totalOut.toFixed(2)} <span className="text-sm">USDC</span></p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <p className="text-xs font-display tracking-widest uppercase text-muted-foreground mb-1">Transactions</p>
              <p className="text-3xl font-display font-bold text-foreground">{payments.length}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="font-display text-sm tracking-wider">Payment History</CardTitle></CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Payments will appear here when agents interact via x402.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map(p => {
                    const isIncoming = p.to_address.toLowerCase() === address?.toLowerCase();
                    return (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${isIncoming ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"}`}>
                            {isIncoming ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-foreground">{isIncoming ? "Received" : "Sent"} · {p.payment_type}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{isIncoming ? p.from_address.slice(0, 10) : p.to_address.slice(0, 10)}...</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-display font-bold ${isIncoming ? "text-accent" : "text-destructive"}`}>
                            {isIncoming ? "+" : "-"}{p.amount} USDC
                          </p>
                          <div className="flex items-center gap-2 justify-end">
                            <Badge variant="outline" className="text-[10px]">{chainNames[p.chain_id] || `${p.chain_id}`}</Badge>
                            <Badge variant={p.status === "completed" ? "default" : "secondary"} className="text-[10px]">{p.status}</Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Payments;
