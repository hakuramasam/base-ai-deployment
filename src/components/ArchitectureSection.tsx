import { motion } from "framer-motion";
import { Brain, Plug, Boxes, MessageSquare, Wallet } from "lucide-react";

const layers = [
  {
    title: "Agent Brain Layer",
    subtitle: "Reasoning & Tools",
    icon: Brain,
    color: "layer-brain",
    items: ["LLM & Memory", "Task Planner"],
    description: "Core reasoning engine with long-term memory and autonomous task planning.",
  },
  {
    title: "MCP Integration",
    subtitle: "Tool Access",
    icon: Plug,
    color: "layer-mcp",
    items: ["MCP Client", "Tool Servers", "Web · Code · DB · Blockchain"],
    description: "Connect to any external tool via Model Context Protocol for real-world actions.",
  },
  {
    title: "Skill System",
    subtitle: "Reusable Skills",
    icon: Boxes,
    color: "layer-skill",
    items: ["Skill Registry", "Create & Discover", "Execute & Improve"],
    description: "Composable skill library — agents learn, share, and improve capabilities.",
  },
  {
    title: "A2A Communication",
    subtitle: "Agent Communication",
    icon: MessageSquare,
    color: "layer-a2a",
    items: ["Agent Messaging", "Task Delegation", "Negotiation"],
    description: "Multi-agent coordination with messaging, delegation, and negotiation protocols.",
  },
  {
    title: "Wallet & Blockchain",
    subtitle: "Blockchain Services",
    icon: Wallet,
    color: "layer-wallet",
    items: ["Crypto Wallet", "Multi-Chain Support", "Smart Contracts"],
    description: "Native on-chain execution with multi-chain wallets and smart contract interactions.",
  },
];

const colorMap: Record<string, string> = {
  "layer-brain": "bg-layer-brain/10 border-layer-brain/30 text-layer-brain",
  "layer-mcp": "bg-layer-mcp/10 border-layer-mcp/30 text-layer-mcp",
  "layer-skill": "bg-layer-skill/10 border-layer-skill/30 text-layer-skill",
  "layer-a2a": "bg-layer-a2a/10 border-layer-a2a/30 text-layer-a2a",
  "layer-wallet": "bg-layer-wallet/10 border-layer-wallet/30 text-layer-wallet",
};

const iconColorMap: Record<string, string> = {
  "layer-brain": "text-layer-brain",
  "layer-mcp": "text-layer-mcp",
  "layer-skill": "text-layer-skill",
  "layer-a2a": "text-layer-a2a",
  "layer-wallet": "text-layer-wallet",
};

const ArchitectureSection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="relative z-10 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            System <span className="text-gradient-primary">Architecture</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Five modular layers powering autonomous agent capabilities on Base.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {layers.map((layer, i) => {
            const Icon = layer.icon;
            return (
              <motion.div
                key={layer.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all duration-300"
              >
                <div className={`inline-flex p-2.5 rounded-lg border mb-4 ${colorMap[layer.color]}`}>
                  <Icon className={`w-5 h-5 ${iconColorMap[layer.color]}`} />
                </div>
                <h3 className="font-display text-sm font-semibold mb-1 text-foreground">
                  {layer.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">{layer.description}</p>
                <div className="space-y-1.5">
                  {layer.items.map((item) => (
                    <div
                      key={item}
                      className="text-xs px-2.5 py-1.5 rounded-md bg-secondary text-secondary-foreground font-body"
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <span className="text-[10px] font-display tracking-widest uppercase text-muted-foreground">
                    {layer.subtitle}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ArchitectureSection;
