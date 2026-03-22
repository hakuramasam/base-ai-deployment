import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Autonomous AI Agent Platform',
  projectId: 'ai-agent-platform',
  chains: [base],
  ssr: false,
});
