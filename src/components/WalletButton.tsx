import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Wallet, Zap, Rocket } from "lucide-react";

interface WalletButtonProps {
  variant?: "hero" | "cta";
}

const WalletButton = ({ variant = "hero" }: WalletButtonProps) => {
  const { isConnected } = useAccount();

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <div {...(!mounted && { "aria-hidden": true, style: { opacity: 0, pointerEvents: "none" } })}>
            {connected ? (
              <Button
                size="lg"
                onClick={openAccountModal}
                className="font-display text-sm tracking-wider bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 glow-box-accent"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {account.displayName}
                {chain.name && ` · ${chain.name}`}
              </Button>
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
  );
};

export default WalletButton;
