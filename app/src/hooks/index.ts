/**
 * Hooks index - exports all custom hooks for the Fhunda dApp
 */

// Contract interaction hooks
export {
  useSigner,
  useCreateCampaign,
  useContribute,
  useWithdrawFunds,
  useRefund,
  useCloseCampaign,
  useCampaigns,
  useCampaignsByCreator,
  useCampaign,
  useContributionAmount,
  useBrowserProvider,
  useFheUsdtBalance,
  useMintFheUSDT,
} from "@/hooks/useContract";

// Relayer hooks
export { useRelayer } from "@/hooks/useRelayer";

// Wallet hooks
export { useWallet } from "@/hooks/useWallet";
