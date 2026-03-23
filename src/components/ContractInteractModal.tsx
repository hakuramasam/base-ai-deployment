import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePublicClient, useWalletClient, useAccount } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { contractTemplates } from "@/lib/contracts";
import type { DeployedContract } from "@/lib/deployedContracts";
import type { Abi, AbiFunction } from "viem";

interface ContractInteractModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: DeployedContract;
}

type CallStatus = "idle" | "calling" | "success" | "error";

const ContractInteractModal = ({
  open,
  onOpenChange,
  contract,
}: ContractInteractModalProps) => {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();

  const [selectedFn, setSelectedFn] = useState<AbiFunction | null>(null);
  const [args, setArgs] = useState<Record<string, string>>({});
  const [ethValue, setEthValue] = useState("");
  const [result, setResult] = useState<string>("");
  const [status, setStatus] = useState<CallStatus>("idle");
  const [error, setError] = useState("");

  const template = contractTemplates.find((t) => t.name === contract.name);
  const abi = (template?.abi ?? []) as Abi;

  const functions = abi.filter(
    (item): item is AbiFunction => item.type === "function"
  );

  const readFns = functions.filter(
    (fn) => fn.stateMutability === "view" || fn.stateMutability === "pure"
  );
  const writeFns = functions.filter(
    (fn) => fn.stateMutability !== "view" && fn.stateMutability !== "pure"
  );

  const resetFnState = () => {
    setSelectedFn(null);
    setArgs({});
    setEthValue("");
    setResult("");
    setStatus("idle");
    setError("");
  };

  const handleSelectFn = (fn: AbiFunction) => {
    setSelectedFn(fn);
    setStatus("idle");
    setResult("");
    setError("");
    const defaultArgs: Record<string, string> = {};
    fn.inputs.forEach((input) => {
      defaultArgs[input.name || `arg_${fn.inputs.indexOf(input)}`] = "";
    });
    setArgs(defaultArgs);
    setEthValue("");
  };

  const parseArg = (value: string, type: string) => {
    if (type === "uint256" || type.startsWith("uint") || type.startsWith("int"))
      return BigInt(value);
    if (type === "bool") return value.toLowerCase() === "true";
    if (type === "bytes32")
      return value.startsWith("0x") ? value : `0x${value}`;
    return value;
  };

  const handleCall = async () => {
    if (!selectedFn || !publicClient) return;

    setStatus("calling");
    setError("");
    setResult("");

    try {
      const fnArgs = selectedFn.inputs.map((input, i) => {
        const key = input.name || `arg_${i}`;
        return parseArg(args[key] || "", input.type);
      });

      const isRead =
        selectedFn.stateMutability === "view" ||
        selectedFn.stateMutability === "pure";

      if (isRead) {
        const data = await publicClient.readContract({
          address: contract.address as `0x${string}`,
          abi,
          functionName: selectedFn.name,
          args: fnArgs.length > 0 ? fnArgs : undefined,
        } as any);

        setResult(formatResult(data));
        setStatus("success");
      } else {
        if (!walletClient || !address) {
          setError("Wallet not connected");
          setStatus("error");
          return;
        }

        const txHash = await walletClient.writeContract({
          address: contract.address as `0x${string}`,
          abi,
          functionName: selectedFn.name,
          args: fnArgs.length > 0 ? fnArgs : undefined,
          account: address,
          chain: walletClient.chain,
          ...(selectedFn.stateMutability === "payable" && ethValue
            ? { value: BigInt(Math.floor(parseFloat(ethValue) * 1e18)) }
            : {}),
        });

        await publicClient.waitForTransactionReceipt({ hash: txHash });
        setResult(`Transaction confirmed: ${txHash}`);
        setStatus("success");
      }
    } catch (err: any) {
      console.error("Contract call error:", err);
      setError(err?.shortMessage || err?.message || "Call failed");
      setStatus("error");
    }
  };

  const formatResult = (data: unknown): string => {
    if (data === undefined || data === null) return "void";
    if (typeof data === "bigint") return data.toString();
    if (Array.isArray(data))
      return data.map((d) => formatResult(d)).join(", ");
    if (typeof data === "object") return JSON.stringify(data, null, 2);
    return String(data);
  };

  const isRead = selectedFn
    ? selectedFn.stateMutability === "view" ||
      selectedFn.stateMutability === "pure"
    : false;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetFnState();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-lg bg-card border-border font-body max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl tracking-wide">
            {selectedFn ? selectedFn.name : contract.name}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Function list */}
          {!selectedFn && (
            <motion.div
              key="fn-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <p className="text-xs text-muted-foreground font-mono break-all">
                {contract.address}
              </p>

              {readFns.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-display tracking-widest uppercase text-muted-foreground">
                    Read Functions
                  </p>
                  {readFns.map((fn) => (
                    <FunctionButton
                      key={fn.name}
                      fn={fn}
                      type="read"
                      onClick={() => handleSelectFn(fn)}
                    />
                  ))}
                </div>
              )}

              {writeFns.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-display tracking-widest uppercase text-muted-foreground">
                    Write Functions
                  </p>
                  {writeFns.map((fn) => (
                    <FunctionButton
                      key={fn.name}
                      fn={fn}
                      type="write"
                      onClick={() => handleSelectFn(fn)}
                    />
                  ))}
                </div>
              )}

              {functions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No ABI found for this contract.
                </p>
              )}
            </motion.div>
          )}

          {/* Function call form */}
          {selectedFn && status !== "success" && status !== "error" && (
            <motion.div
              key="fn-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-display tracking-wider ${
                    isRead
                      ? "bg-accent/10 text-accent"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {isRead ? "READ" : "WRITE"}
                </span>
                <span className="font-mono">
                  {selectedFn.inputs.length > 0
                    ? `(${selectedFn.inputs.map((i) => `${i.type} ${i.name}`).join(", ")})`
                    : "()"}
                </span>
              </div>

              {selectedFn.inputs.map((input, i) => {
                const key = input.name || `arg_${i}`;
                return (
                  <div key={key} className="space-y-1.5">
                    <label className="text-xs font-display tracking-wider text-muted-foreground uppercase">
                      {input.name || `Arg ${i}`}
                      <span className="ml-2 text-[10px] text-muted-foreground/60 normal-case tracking-normal font-body">
                        ({input.type})
                      </span>
                    </label>
                    <Input
                      placeholder={`Enter ${input.type}`}
                      value={args[key] || ""}
                      onChange={(e) =>
                        setArgs({ ...args, [key]: e.target.value })
                      }
                      className="bg-muted border-border text-foreground placeholder:text-muted-foreground/40 font-mono text-sm"
                    />
                  </div>
                );
              })}

              {selectedFn.stateMutability === "payable" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-display tracking-wider text-muted-foreground uppercase">
                    ETH Value
                    <span className="ml-2 text-[10px] text-muted-foreground/60 normal-case tracking-normal font-body">
                      (in ETH)
                    </span>
                  </label>
                  <Input
                    placeholder="0.01"
                    value={ethValue}
                    onChange={(e) => setEthValue(e.target.value)}
                    className="bg-muted border-border text-foreground placeholder:text-muted-foreground/40 font-mono text-sm"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={resetFnState}
                  className="flex-1 border-border text-foreground hover:bg-secondary"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleCall}
                  disabled={status === "calling"}
                  className={`flex-1 font-display text-sm tracking-wider ${
                    isRead
                      ? "bg-accent hover:bg-accent/90 text-accent-foreground glow-box-accent"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground glow-box"
                  }`}
                >
                  {status === "calling" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : isRead ? (
                    <Eye className="w-4 h-4 mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {status === "calling"
                    ? "Calling..."
                    : isRead
                      ? "Read"
                      : "Write"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Success */}
          {selectedFn && status === "success" && (
            <motion.div
              key="fn-success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                <span className="text-sm font-display text-foreground">
                  {isRead ? "Result" : "Transaction Confirmed"}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-muted border border-border font-mono text-sm text-foreground break-all whitespace-pre-wrap">
                {result}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={resetFnState}
                  className="flex-1 border-border text-foreground hover:bg-secondary"
                >
                  All Functions
                </Button>
                <Button
                  onClick={() => {
                    setStatus("idle");
                    setResult("");
                    setError("");
                  }}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-display text-sm tracking-wider"
                >
                  Call Again
                </Button>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {selectedFn && status === "error" && (
            <motion.div
              key="fn-error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <span className="text-sm font-display text-foreground">
                  Call Failed
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{error}</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={resetFnState}
                  className="flex-1 border-border text-foreground hover:bg-secondary"
                >
                  All Functions
                </Button>
                <Button
                  onClick={handleCall}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-display text-sm tracking-wider"
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

const FunctionButton = ({
  fn,
  type,
  onClick,
}: {
  fn: AbiFunction;
  type: "read" | "write";
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full text-left p-3 rounded-lg border border-border bg-secondary/50 hover:border-primary/40 hover:bg-secondary transition-all duration-200 flex items-center justify-between group"
  >
    <div className="flex items-center gap-2.5 min-w-0">
      <div
        className={`p-1.5 rounded-md ${
          type === "read"
            ? "bg-accent/10 text-accent"
            : "bg-primary/10 text-primary"
        }`}
      >
        {type === "read" ? (
          <Eye className="w-3.5 h-3.5" />
        ) : (
          <Send className="w-3.5 h-3.5" />
        )}
      </div>
      <div className="min-w-0">
        <span className="font-display text-xs font-semibold text-foreground">
          {fn.name}
        </span>
        {fn.inputs.length > 0 && (
          <p className="text-[10px] text-muted-foreground font-mono truncate">
            ({fn.inputs.map((i) => i.type).join(", ")})
          </p>
        )}
      </div>
    </div>
    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
  </button>
);

export default ContractInteractModal;
