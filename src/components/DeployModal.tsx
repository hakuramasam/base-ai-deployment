import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { deployContractViaWallet, createSplitContract } from "@/lib/edgeFunctions";
import { saveDeployedContract } from "@/lib/deployedContracts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Boxes,
  CreditCard,
  Store,
  Loader2,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Rocket,
} from "lucide-react";
import { contractTemplates, type ContractTemplate } from "@/lib/contracts";

const categoryIcons: Record<string, React.ReactNode> = {
  Infrastructure: <Boxes className="w-5 h-5" />,
  Payments: <CreditCard className="w-5 h-5" />,
  Marketplace: <Store className="w-5 h-5" />,
};

type DeployStatus = "idle" | "configuring" | "deploying" | "success" | "error";

interface DeployModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeployModal = ({ open, onOpenChange }: DeployModalProps) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [selected, setSelected] = useState<ContractTemplate | null>(null);
  const [args, setArgs] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<DeployStatus>("idle");
  const [txHash, setTxHash] = useState<string>("");
  const [contractAddress, setContractAddress] = useState<string>("");
  const [error, setError] = useState<string>("");

  const resetState = () => {
    setSelected(null);
    setArgs({});
    setStatus("idle");
    setTxHash("");
    setContractAddress("");
    setError("");
  };

  const handleSelect = (template: ContractTemplate) => {
    setSelected(template);
    setStatus("configuring");
    const defaultArgs: Record<string, string> = {};
    template.constructorArgs?.forEach((arg) => {
      defaultArgs[arg.name] = "";
    });
    setArgs(defaultArgs);
  };

  const handleDeploy = async () => {
    if (!selected || !walletClient || !publicClient || !address) return;

    setStatus("deploying");
    setError("");

    try {
      const constructorArgs = selected.constructorArgs?.map((arg) => {
        const val = args[arg.name] || arg.placeholder;
        if (arg.type === "uint256") return BigInt(val);
        return val;
      }) || [];

      const hash = await walletClient.deployContract({
        abi: selected.abi as any,
        bytecode: selected.bytecode,
        args: constructorArgs,
        account: address,
        chain: walletClient.chain,
      });

      setTxHash(hash);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.contractAddress) {
        setContractAddress(receipt.contractAddress);
        saveDeployedContract({
          name: selected.name,
          category: selected.category,
          address: receipt.contractAddress,
          txHash: hash,
          deployedAt: new Date().toISOString(),
          chainId: walletClient.chain?.id ?? 8453,
          deployer: address,
        });
      }
      setStatus("success");
    } catch (err: any) {
      console.error("Deployment error:", err);
      setError(err?.shortMessage || err?.message || "Deployment failed");
      setStatus("error");
    }
  };

  const allArgsFilled = selected?.constructorArgs?.every(
    (arg) => (args[arg.name] || "").trim() !== ""
  ) ?? true;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetState();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-lg bg-card border-border font-body">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-wide">
            {status === "idle" && "Deploy Smart Contract"}
            {status === "configuring" && selected?.name}
            {status === "deploying" && "Deploying..."}
            {status === "success" && "Deployed!"}
            {status === "error" && "Deployment Failed"}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Step 1: Contract Selection */}
          {status === "idle" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <p className="text-sm text-muted-foreground">
                Choose a contract template to deploy on Base Network.
              </p>
              {contractTemplates.map((template) => (
                <button
                  key={template.name}
                  onClick={() => handleSelect(template)}
                  className="w-full text-left p-4 rounded-lg border border-border bg-secondary/50 hover:border-primary/40 hover:bg-secondary transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-primary/10 text-primary mt-0.5">
                      {categoryIcons[template.category]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display text-sm font-semibold text-foreground">
                          {template.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-display tracking-wider">
                          {template.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {/* Step 2: Configure Args */}
          {status === "configuring" && selected && (
            <motion.div
              key="configure"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                {selected.description}
              </p>
              {selected.constructorArgs?.map((arg) => (
                <div key={arg.name} className="space-y-1.5">
                  <label className="text-xs font-display tracking-wider text-muted-foreground uppercase">
                    {arg.name}
                    <span className="ml-2 text-[10px] text-muted-foreground/60 normal-case tracking-normal font-body">
                      ({arg.type})
                    </span>
                  </label>
                  <Input
                    placeholder={arg.placeholder}
                    value={args[arg.name] || ""}
                    onChange={(e) =>
                      setArgs({ ...args, [arg.name]: e.target.value })
                    }
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground/40"
                  />
                </div>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={resetState}
                    className="flex-1 border-border text-foreground hover:bg-secondary"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleDeploy}
                    disabled={!allArgsFilled}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-display text-sm tracking-wider glow-box"
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Deploy (Wallet)
                  </Button>
                </div>
                <Button
                  onClick={async () => {
                    if (!selected) return;
                    setStatus("deploying");
                    setError("");
                    try {
                      const constructorArgs = selected.constructorArgs?.map((arg) => {
                        const val = args[arg.name] || arg.placeholder;
                        if (arg.type === "uint256") return val;
                        return val;
                      }) || [];
                      const result = await deployContractViaWallet({
                        contract_name: selected.name,
                        bytecode: selected.bytecode,
                        constructor_args: constructorArgs,
                        category: selected.category,
                      });
                      setTxHash(result.tx_hash);
                      setContractAddress(result.contract_address);
                      saveDeployedContract({
                        name: selected.name,
                        category: selected.category,
                        address: result.contract_address,
                        txHash: result.tx_hash,
                        deployedAt: new Date().toISOString(),
                        chainId: result.chain_id,
                        deployer: result.deployer,
                      });
                      setStatus("success");
                    } catch (err: any) {
                      setError(err?.message || "Server-side deployment failed");
                      setStatus("error");
                    }
                  }}
                  disabled={!allArgsFilled}
                  variant="outline"
                  className="w-full border-accent/30 text-accent hover:bg-accent/10 font-display text-sm tracking-wider"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Deploy via Platform Wallet (No Gas)
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Deploying */}
          {status === "deploying" && (
            <motion.div
              key="deploying"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center py-8 gap-4"
            >
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground text-center">
                Confirm the transaction in your wallet...
              </p>
              {txHash && (
                <a
                  href={`https://basescan.org/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  View on BaseScan
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </motion.div>
          )}

          {/* Step 4: Success */}
          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center py-6 gap-4"
            >
              <div className="p-3 rounded-full bg-accent/10 border border-accent/20">
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-display text-sm font-semibold text-foreground">
                  {selected?.name} deployed successfully!
                </p>
                {contractAddress && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-display tracking-widest uppercase text-muted-foreground">
                      Contract Address
                    </p>
                    <a
                      href={`https://basescan.org/address/${contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary break-all hover:underline flex items-center justify-center gap-1"
                    >
                      {contractAddress}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                )}
                {txHash && (
                  <a
                    href={`https://basescan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-primary flex items-center justify-center gap-1"
                  >
                    Transaction
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <Button
                onClick={() => {
                  resetState();
                  onOpenChange(false);
                }}
                className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-display text-sm tracking-wider"
              >
                Done
              </Button>
            </motion.div>
          )}

          {/* Error State */}
          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center py-6 gap-4"
            >
              <div className="p-3 rounded-full bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                {error}
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={resetState}
                  className="border-border text-foreground hover:bg-secondary"
                >
                  Start Over
                </Button>
                <Button
                  onClick={handleDeploy}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-display text-sm tracking-wider"
                >
                  Retry
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default DeployModal;
