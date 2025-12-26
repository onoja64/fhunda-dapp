"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultConfig,
  RainbowKitProvider,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { sepolia } from "viem/chains";
import React, { useState, useEffect, createContext, useContext } from "react";

// WalletConnect Project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

// Configure wagmi with WalletConnect-focused wallet options
const config = getDefaultConfig({
  appName: "Fhunda",
  projectId,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_RPC_URL ||
        "https://eth-sepolia.public.blastapi.io"
    ),
  },
  ssr: true,
});

// Query client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Wallet connection state context
interface WalletConnectionState {
  isConnecting: boolean;
  connectionError: string | null;
  setIsConnecting: (value: boolean) => void;
  setConnectionError: (error: string | null) => void;
}

const WalletConnectionContext = createContext<WalletConnectionState>({
  isConnecting: false,
  connectionError: null,
  setIsConnecting: () => {},
  setConnectionError: () => {},
});

export const useWalletConnection = () => useContext(WalletConnectionContext);

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-purple-200 rounded-full"></div>
          <div className="h-4 w-32 bg-purple-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: "#7c3aed",
            accentColorForeground: "white",
            borderRadius: "medium",
            fontStack: "system",
          })}
          modalSize="compact"
          showRecentTransactions={true}
          appInfo={{
            appName: "Fhunda",
            learnMoreUrl: "https://fhunda.vercel.app/about",
          }}
        >
          <WalletConnectionContext.Provider
            value={{
              isConnecting,
              connectionError,
              setIsConnecting,
              setConnectionError,
            }}
          >
            {children}
          </WalletConnectionContext.Provider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
