import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, bsc } from 'wagmi/chains';

export const supportedChains = [base, bsc] as const;

export const config = getDefaultConfig({
  appName: 'KAI Agent Platform',
  projectId: '701902d4a59820e8d163a82ce3510e4c',
  chains: supportedChains,
  ssr: false,
});
