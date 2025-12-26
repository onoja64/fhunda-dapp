/**
 * Contract configuration for Fhunda dApp
 * Supports Zama fhEVM on Sepolia testnet
 */

// Contract addresses
export const FHUNDA_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_FHUNDA_CONTRACT_ADDRESS || "";
export const FHE_USDT_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_FHE_USDT_CONTRACT_ADDRESS || "";

// Chain configuration for Sepolia with Zama fhEVM
export const SEPOLIA_CHAIN_ID = 11155111;
export const GATEWAY_CHAIN_ID = 55815;

// Zama FHE contract addresses (Sepolia Testnet)
export const ZAMA_CONFIG = {
  aclContractAddress:
    process.env.NEXT_PUBLIC_ACL_CONTRACT ||
    "0x687820221192C5B662b25367F70076A37bc79b6c",
  kmsContractAddress:
    process.env.NEXT_PUBLIC_KMS_VERIFIER_CONTRACT ||
    "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
  inputVerifierContractAddress:
    process.env.NEXT_PUBLIC_INPUT_VERIFIER_CONTRACT ||
    "0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4",
  verifyingContractAddressDecryption:
    process.env.NEXT_PUBLIC_DECRYPTION_ADDRESS ||
    "0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1",
  verifyingContractAddressInputVerification:
    process.env.NEXT_PUBLIC_INPUT_VERIFICATION_ADDRESS ||
    "0x7048C39f048125eDa9d678AEbaDfB22F7900a29F",
  chainId: SEPOLIA_CHAIN_ID,
  gatewayChainId: GATEWAY_CHAIN_ID,
  relayerUrl:
    process.env.NEXT_PUBLIC_RELAYER_URL || "https://relayer.testnet.zama.cloud",
};

// RPC URLs
export const RPC_URLS = {
  sepolia:
    process.env.NEXT_PUBLIC_RPC_URL || "https://eth-sepolia.public.blastapi.io",
};

// WalletConnect configuration
export const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "";

// App metadata for WalletConnect
export const APP_METADATA = {
  name: "Fhunda",
  description: "Privacy-Preserving Crowdfunding with FHE",
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : "https://fhunda.vercel.app",
  icons: ["/favicon.ico"],
};

// Legacy export for backward compatibility
export const CONTRACT_ADDRESSES = {
  fhunda: FHUNDA_CONTRACT_ADDRESS,
  fheUSDT: FHE_USDT_CONTRACT_ADDRESS,
};
