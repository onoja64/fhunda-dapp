"use client";

import { useEffect, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { initializeFheInstance, getFheInstance } from "@/lib/relayer";

/**
 * Hook to manage FHEVM Relayer SDK initialization with Wagmi/WalletConnect
 * Automatically initializes when wallet is connected and ready
 */
export function useRelayer() {
  const { address, isConnected, connector } = useAccount();

  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [relayerInstance, setRelayerInstance] = useState<any>(null);

  /**
   * Initialize the Relayer SDK with the current wallet provider
   */
  const initialize = useCallback(async () => {
    if (!isConnected || !connector) {
      return;
    }

    // Skip if already initialized or currently initializing
    if (isInitialized || isInitializing) {
      return;
    }

    try {
      setIsInitializing(true);
      setError(null);

      // Get the raw EIP-1193 provider from the connector
      const walletProvider = await connector.getProvider();

      console.log(
        "[useRelayer] Initializing FHEVM Relayer SDK with raw provider..."
      );
      const instance = await initializeFheInstance(walletProvider);

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
  }, [isConnected, connector, isInitialized, isInitializing]);

  /**
   * Auto-initialize when wallet connects
   */
  useEffect(() => {
    if (isConnected && connector && !isInitialized && !isInitializing) {
      initialize();
    }
  }, [isConnected, connector, isInitialized, isInitializing, initialize]);

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
    isLoading: isInitializing, // For compatibility with older hooks
    error,
    initialize,
  };
}
