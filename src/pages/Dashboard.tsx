import { useAccount } from "wagmi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Copy, CheckCircle2, Boxes, CreditCard, Store, Wallet, Terminal, Bot, MessageSquare, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getContractsByDeployer, type DeployedContract } from "@/lib/deployedContracts";
import { useState, useMemo } from "react";
import WalletButton from "@/components/WalletButton";
import ContractInteractModal from "@/components/ContractInteractModal";

const categoryIcons: Record<string, React.ReactNode> = {
  Infrastructure: <Boxes className="w-4 h-4" />,
  Payments: <CreditCard className="w-4 h-4" />,
  Marketplace: <Store className="w-4 h-4" />,
};

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [interactContract, setInteractContract] = useState<DeployedContract | null>(null);

  const contracts = useMemo(
    () => (address ? getContractsByDeployer(address) : []),
    [address]
  );

  const handleCopy = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(addr);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const truncate = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <Wallet className="w-12 h-12 text-muted-foreground mx-auto" />
          <h2 className="font-display text-xl text-foreground">Connect Wallet</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            Connect your wallet to view your deployed contracts.
          </p>
          <WalletButton variant="hero" />
          <Button variant="ghost" onClick={() => navigate("/")} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display text-lg tracking-wider text-foreground">
              Deployed Contracts
            </h1>
          </div>
          <WalletButton variant="hero" />
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { label: "Total Deployed", value: contracts.length },
            { label: "Infrastructure", value: contracts.filter((c) => c.category === "Infrastructure").length },
            { label: "Tokens & Markets", value: contracts.filter((c) => c.category !== "Infrastructure").length },
          ].map((stat) => (
            <Card key={stat.label} className="bg-card border-border">
              <CardContent className="p-5">
                <p className="text-xs font-display tracking-widest uppercase text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-display font-bold text-foreground">
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Contracts Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-card border-border overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base tracking-wider">
                Your Contracts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {contracts.length === 0 ? (
                <div className="py-16 text-center">
                  <Boxes className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No contracts deployed yet.
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Deploy your first contract from the home page.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="font-display text-xs tracking-wider">Contract</TableHead>
                      <TableHead className="font-display text-xs tracking-wider hidden sm:table-cell">Category</TableHead>
                      <TableHead className="font-display text-xs tracking-wider">Address</TableHead>
                      <TableHead className="font-display text-xs tracking-wider hidden sm:table-cell">Deployed</TableHead>
                      <TableHead className="font-display text-xs tracking-wider text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.map((contract, i) => (
                      <TableRow key={`${contract.address}-${i}`} className="border-border">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                              {categoryIcons[contract.category] || <Boxes className="w-4 h-4" />}
                            </div>
                            <span className="font-display text-xs font-semibold text-foreground">
                              {contract.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-display tracking-wider">
                            {contract.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => handleCopy(contract.address)}
                            className="flex items-center gap-1.5 text-xs text-primary hover:underline font-mono"
                          >
                            {truncate(contract.address)}
                            {copiedAddress === contract.address ? (
                              <CheckCircle2 className="w-3 h-3 text-accent" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                          {new Date(contract.deployedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setInteractContract(contract)}
                              className="h-7 px-2 text-xs font-display tracking-wider text-primary hover:text-primary hover:bg-primary/10"
                            >
                              <Terminal className="w-3 h-3 mr-1" />
                              Interact
                            </Button>
                            <a
                              href={`https://basescan.org/address/${contract.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      {interactContract && (
        <ContractInteractModal
          open={!!interactContract}
          onOpenChange={(o) => !o && setInteractContract(null)}
          contract={interactContract}
        />
      )}
    </div>
  );
};

export default Dashboard;
