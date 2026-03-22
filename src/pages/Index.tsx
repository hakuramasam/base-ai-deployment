import HeroSection from "@/components/HeroSection";
import ArchitectureSection from "@/components/ArchitectureSection";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <ArchitectureSection />
      <FeaturesSection />
      <CTASection />
      <footer className="border-t border-border py-8 text-center">
        <p className="text-xs text-muted-foreground font-display tracking-wider">
          © 2026 Autonomous AI Agent Platform · Built on Base Network
        </p>
      </footer>
    </main>
  );
};

export default Index;
