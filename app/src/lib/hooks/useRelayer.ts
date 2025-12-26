"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { BrowserProvider } from "ethers";
import { initializeFheInstance, getFheInstance } from "@/lib/relayer";

/**
 * Hook to manage FHEVM Relayer SDK initialization with WalletConnect
 * Automatically initializes when wallet is connected and ready
 */
export function useRelayer() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [relayerInstance, setRelayerInstance] = useState<any>(null);

  /**
   * Initialize the Relayer SDK with the current wallet provider
   */
  const initialize = useCallback(async () => {
    if (!isConnected || !walletClient) {
      return;
    }

    // Skip if already initialized or currently initializing
    if (isInitialized || isInitializing) {
      return;
    }

    try {
      setIsInitializing(true);
      setError(null);

      // Convert WalletClient to ethers BrowserProvider
      // WalletConnect uses viem's WalletClient, which needs to be wrapped
      const provider = new BrowserProvider(walletClient as any);

      console.log("[useRelayer] Initializing FHEVM Relayer SDK...");
      const instance = await initializeFheInstance(provider);

      setRelayerInstance(instance);
      setIsInitialized(true);
      console.log("[useRelayer] FHEVM Relayer SDK initialized successfully");
    } catch (err) {
      console.error("[useRelayer] Failed to initialize Relayer SDK:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsInitialized(false);
    } finally {
      setIsInitializing(false);
    }
  }, [isConnected, walletClient, isInitialized, isInitializing]);

  /**
   * Auto-initialize when wallet connects
   */
  useEffect(() => {
    if (isConnected && walletClient && !isInitialized && !isInitializing) {
      initialize();
    }
  }, [isConnected, walletClient, isInitialized, isInitializing, initialize]);

  /**
   * Reset when wallet disconnects or address changes
   */
  useEffect(() => {
    if (!isConnected || !address) {
      setIsInitialized(false);
      setRelayerInstance(null);
      setError(null);
    }
  }, [isConnected, address]);

  /**
   * Get the current relayer instance (from module state or local state)
   */
  const getInstance = useCallback(() => {
    return relayerInstance || getFheInstance();
  }, [relayerInstance]);

  return {
    instance: getInstance(),
    isInitialized,
    isInitializing,
    error,
    initialize,
  };
}
