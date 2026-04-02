import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, bsc } from 'wagmi/chains';

export const supportedChains = [base, bsc] as const;

export const config = getDefaultConfig({
  appName: 'KAI Agent Platform',
  projectId: 'ai-agent-platform',
  chains: supportedChains,
  ssr: false,
});
