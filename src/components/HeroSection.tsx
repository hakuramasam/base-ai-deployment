import { motion } from "framer-motion";
import { Bot, ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import WalletButton from "@/components/WalletButton";

const HeroSection = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-40" />
      
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[120px]" />
      
      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 glow-box">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <span className="font-display text-sm tracking-[0.3em] uppercase text-muted-foreground">
            Autonomous AI Agent Platform
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-display text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight"
        >
          Deploy AI Agents
          <br />
          <span className="text-gradient-primary">on Base Network</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Reason. Interact. Pay. Transact. — A full-stack agent framework with 
          MCP tools, A2A communication, x402 payments, and on-chain execution.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <WalletButton variant="hero" />
          {isConnected && (
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="font-display text-sm tracking-wider border-border hover:bg-secondary text-foreground px-8 py-6"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          )}
          <Button size="lg" variant="outline" className="font-display text-sm tracking-wider border-border hover:bg-secondary text-foreground px-8 py-6">
            Read Docs
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>

        {/* Pipeline badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-3"
        >
          {["Reason", "Interact", "Pay", "Transact"].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-full text-xs font-display tracking-wider bg-secondary border border-border text-secondary-foreground">
                {step}
              </span>
              {i < 3 && <span className="text-primary text-lg">▸</span>}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
