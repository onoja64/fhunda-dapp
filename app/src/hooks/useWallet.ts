"use client";

import { useAccount } from "wagmi";

export function useWallet() {
  const { address, isConnected } = useAccount();

  return {
    address: address || null,
    isConnected,
    isConnecting: false,
    connect: async () => {
      // Connect is handled by RainbowKit ConnectButton
    },
  } as const;
}
