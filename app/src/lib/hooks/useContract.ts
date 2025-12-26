"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount } from "wagmi";
import { BrowserProvider, Eip1193Provider } from "ethers";
import {
  getAllCampaigns,
  getCampaignsByCreator,
  getFormattedCampaign,
  createCampaign as createCampaignContract,
  contribute as contributeContract,
  withdrawFunds as withdrawFundsContract,
  refund as refundContract,
  closeCampaign as closeCampaignContract,
  getContributionAmount,
  mintFheUSDT,
  getConfidentialBalance,
  getTokenAddress,
  CampaignData,
} from "../contracts/fhunda";

// Hook for getting a signer
export function useSigner() {
  const { connector } = useAccount();

  return useCallback(async () => {
    if (!connector) {
      throw new Error("Wallet not connected");
    }
    const provider = await connector.getProvider();
    const ethersProvider = new BrowserProvider(provider as Eip1193Provider);
    return ethersProvider.getSigner();
  }, [connector]);
}

// Hook for creating campaigns
export function useCreateCampaign() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const getSignerFn = useSigner();

  const createCampaign = useCallback(
    async (
      targetAmount: string,
      durationInDays: number,
      title: string,
      description: string,
      image: string,
      category: string,
      relayer?: any
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!address) throw new Error("Wallet not connected");
        if (!relayer) throw new Error("Relayer not initialized");
        const signer = await getSignerFn();
        const result = await createCampaignContract(
          signer,
          relayer,
          targetAmount,
          durationInDays,
          title,
          description,
          image,
          category
        );
        return result;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create campaign";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [address, getSignerFn]
  );

  return { createCampaign, isLoading, error };
}

// Hook for contributing to campaigns
export function useContribute() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const getSignerFn = useSigner();

  const contribute = useCallback(
    async (campaignId: number, amount: string, relayer?: any) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!address) throw new Error("Wallet not connected");
        if (!relayer) throw new Error("Relayer not initialized");
        const signer = await getSignerFn();
        const result = await contributeContract(
          signer,
          relayer,
          campaignId,
          amount
        );
        return result;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to contribute";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [address, getSignerFn]
  );

  return { contribute, isLoading, error };
}

// Hook for withdrawing funds
export function useWithdrawFunds() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const getSignerFn = useSigner();

  const withdrawFunds = useCallback(
    async (campaignId: number) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!address) throw new Error("Wallet not connected");
        const signer = await getSignerFn();
        const result = await withdrawFundsContract(signer, campaignId);
        return result;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to withdraw funds";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [address, getSignerFn]
  );

  return { withdrawFunds, isLoading, error };
}

// Hook for requesting refund
export function useRefund() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const getSignerFn = useSigner();

  const refund = useCallback(
    async (campaignId: number) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!address) throw new Error("Wallet not connected");
        const signer = await getSignerFn();
        const result = await refundContract(signer, campaignId);
        return result;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to process refund";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [address, getSignerFn]
  );

  return { refund, isLoading, error };
}

// Hook for closing campaign
export function useCloseCampaign() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const getSignerFn = useSigner();

  const closeCampaign = useCallback(
    async (campaignId: number) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!address) throw new Error("Wallet not connected");
        const signer = await getSignerFn();
        const result = await closeCampaignContract(signer, campaignId);
        return result;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to close campaign";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [address, getSignerFn]
  );

  return { closeCampaign, isLoading, error };
}

// Hook for fetching campaigns
export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const provider = useBrowserProvider();

  const fetchCampaigns = useCallback(async () => {
    if (!provider) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getAllCampaigns(provider);
      console.log("useCampaigns: fetched data:", data);
      setCampaigns(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch campaigns";
      setError(errorMessage);
      console.error("Error fetching campaigns:", err);
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return { campaigns, isLoading, error, refetch: fetchCampaigns };
}

// Hook for fetching campaigns by creator
export function useCampaignsByCreator(creatorAddress: string | null) {
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const provider = useBrowserProvider();

  const fetchCampaigns = useCallback(async () => {
    if (!creatorAddress || !provider) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getCampaignsByCreator(provider, creatorAddress);
      console.log("useCampaignsByCreator: fetched data:", data);
      setCampaigns(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch campaigns";
      setError(errorMessage);
      console.error("Error fetching campaigns by creator:", err);
    } finally {
      setIsLoading(false);
    }
  }, [creatorAddress, provider]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return { campaigns, isLoading, error, refetch: fetchCampaigns };
}

// Hook for fetching single campaign
export function useCampaign(campaignId: number | null) {
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const provider = useBrowserProvider();

  const fetchCampaign = useCallback(async () => {
    if (campaignId === null || !provider) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getFormattedCampaign(provider, campaignId);
      setCampaign(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch campaign";
      setError(errorMessage);
      console.error("Error fetching campaign:", err);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, provider]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  return { campaign, isLoading, error, refetch: fetchCampaign };
}

// Hook for fetching contribution amount
export function useContributionAmount(campaignId: number | null) {
  const [contribution, setContribution] = useState<string>("0");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const provider = useBrowserProvider();

  const fetchContribution = useCallback(async () => {
    if (campaignId === null || !address || !provider) return;

    setIsLoading(true);
    setError(null);

    try {
      const amount = await getContributionAmount(provider, campaignId, address);
      setContribution(amount);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch contribution";
      setError(errorMessage);
      console.error("Error fetching contribution:", err);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, address, provider]);

  useEffect(() => {
    fetchContribution();
  }, [fetchContribution]);

  return { contribution, isLoading, error, refetch: fetchContribution };
}

// Hook for getting a BrowserProvider instance
export function useBrowserProvider(): BrowserProvider | null {
  const { connector } = useAccount();
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  useEffect(() => {
    async function initProvider() {
      if (!connector) {
        setProvider(null);
        return;
      }
      try {
        const walletProvider = await connector.getProvider();
        const ethersProvider = new BrowserProvider(
          walletProvider as Eip1193Provider
        );
        setProvider(ethersProvider);
      } catch (error) {
        console.error("Failed to get provider:", error);
        setProvider(null);
      }
    }
    initProvider();
  }, [connector]);

  return provider;
}

// Hook for minting FHE-USDT tokens (testnet)
export function useMintFheUSDT() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const getSignerFn = useSigner();

  const mintTokens = useCallback(
    async (amount: bigint, relayer: any) => {
      setIsLoading(true);
      setError(null);

      try {
        if (!address) throw new Error("Wallet not connected");
        if (!relayer) throw new Error("Relayer not initialized");
        const signer = await getSignerFn();
        const result = await mintFheUSDT(signer, relayer, address, amount);
        return result;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to mint tokens";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [address, getSignerFn]
  );

  return { mintTokens, isLoading, error };
}

// Hook for fetching FHE-USDT balance (confidential)
export function useFheUsdtBalance() {
  const [balance, setBalance] = useState<string>("0.00");
  const [isLoading, setIsLoading] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();
  const provider = useBrowserProvider();
  const getSignerFn = useSigner();

  const fetchBalance = useCallback(
    async (relayer?: any) => {
      if (!address || !provider) return;

      setIsLoading(true);
      setError(null);

      try {
        const tokenAddr = await getTokenAddress(provider);

        // If relayer is provided, we do a full decryption
        if (relayer) {
          setIsDecrypting(true);
          const signer = await getSignerFn();
          const bal = await getConfidentialBalance(signer, relayer, tokenAddr);
          setBalance(bal);
          setIsDecrypted(true);
          return bal;
        } else {
          return balance;
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch balance";
        setError(errorMessage);
        throw err; // Re-throw to allow caller to handle errors
      } finally {
        setIsLoading(false);
        setIsDecrypting(false);
      }
    },
    [address, provider, getSignerFn, balance]
  );

  // We don't auto-fetch with decryption because it requires a signature
  // The UI should call refetch(relayer) when user clicks "View Balance"

  return {
    balance,
    isLoading,
    isDecrypting,
    isDecrypted,
    error,
    refetch: fetchBalance,
  };
}
