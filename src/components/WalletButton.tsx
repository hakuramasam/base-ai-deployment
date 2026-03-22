import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Wallet, Zap, Rocket } from "lucide-react";
import DeployModal from "@/components/DeployModal";

interface WalletButtonProps {
  variant?: "hero" | "cta";
}

const WalletButton = ({ variant = "hero" }: WalletButtonProps) => {
  const { isConnected } = useAccount();
  const [deployOpen, setDeployOpen] = useState(false);

  return (
    <>
      <ConnectButton.Custom>
        {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
          const connected = mounted && account && chain;

          return (
            <div {...(!mounted && { "aria-hidden": true, style: { opacity: 0, pointerEvents: "none" } })}>
              {connected ? (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    size="lg"
                    onClick={() => setDeployOpen(true)}
                    className="font-display text-sm tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 glow-box"
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Deploy Contract
                  </Button>
                  <Button
                    size="lg"
                    onClick={openAccountModal}
                    variant="outline"
                    className="font-display text-sm tracking-wider border-border hover:bg-secondary text-foreground px-6 py-6"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {account.displayName}
                  </Button>
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={openConnectModal}
                  className="font-display text-sm tracking-wider bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 glow-box"
                >
                  {variant === "hero" ? (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Launch Agent
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      Deploy Now
                    </>
                  )}
                </Button>
              )}
            </div>
          );
        }}
      </ConnectButton.Custom>
      <DeployModal open={deployOpen} onOpenChange={setDeployOpen} />
    </>
  );
};

export default WalletButton;
