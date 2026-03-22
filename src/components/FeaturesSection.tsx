import { motion } from "framer-motion";
import { CreditCard, Shield, Repeat, Globe } from "lucide-react";

const features = [
  {
    icon: CreditCard,
    title: "x402 Pay-per-API",
    description: "Agents pay for services on-demand using the x402 payment protocol. No subscriptions, no API keys — just crypto-native micropayments.",
  },
  {
    icon: Shield,
    title: "Secure by Design",
    description: "Non-custodial wallet integration with multi-sig support. All transactions are signed client-side and verified on-chain.",
  },
  {
    icon: Repeat,
    title: "Multi-Agent Orchestration",
    description: "Agents discover, negotiate, and delegate tasks to each other. Build swarms of specialized agents that collaborate autonomously.",
  },
  {
    icon: Globe,
    title: "Multi-Chain Ready",
    description: "Deploy on Base with cross-chain bridges to Ethereum, Arbitrum, and more. One agent, multiple blockchain ecosystems.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
            Built for <span className="text-gradient-accent">Autonomy</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Everything an agent needs to reason, act, and transact independently.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-8 hover:glow-box transition-shadow duration-500"
              >
                <div className="inline-flex p-3 rounded-lg bg-accent/10 border border-accent/20 mb-5">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
