export interface DeployedContract {
  name: string;
  category: string;
  address: string;
  txHash: string;
  deployedAt: string;
  chainId: number;
  deployer: string;
}

const STORAGE_KEY = "deployed-contracts";

export const saveDeployedContract = (contract: DeployedContract) => {
  const existing = getDeployedContracts();
  existing.unshift(contract);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};

export const getDeployedContracts = (): DeployedContract[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getContractsByDeployer = (address: string): DeployedContract[] => {
  return getDeployedContracts().filter(
    (c) => c.deployer.toLowerCase() === address.toLowerCase()
  );
};
