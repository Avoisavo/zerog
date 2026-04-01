import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { defineChain } from "viem";

export const zgTestnet = defineChain({
  id: 16602,
  name: "0G-Galileo-Testnet",
  nativeCurrency: {
    name: "0G",
    symbol: "0G",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://evmrpc-testnet.0g.ai"],
    },
  },
  blockExplorers: {
    default: {
      name: "0G Explorer",
      url: "https://chainscan-galileo.0g.ai",
    },
  },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName: "ZeroG",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [zgTestnet],
  wallets: [
    {
      groupName: "Popular",
      wallets: [metaMaskWallet],
    },
  ],
  ssr: true,
});
