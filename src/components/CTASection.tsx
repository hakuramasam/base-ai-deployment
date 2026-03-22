import { motion } from "framer-motion";
import WalletButton from "@/components/WalletButton";

const CTASection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl border border-primary/20 bg-card p-12 md:p-16 text-center overflow-hidden"
        >
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary/5 blur-[100px] rounded-full" />
          
          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Ready to Deploy?
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-8">
              Launch your autonomous AI agent on Base Network today. 
              Full-stack infrastructure, zero configuration.
            </p>
            <WalletButton variant="cta" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
