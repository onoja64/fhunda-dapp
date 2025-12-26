/**
 * Relayer Diagnostics and Testing Utilities
 * Helps debug encryption and relayer issues
 */

import { Contract, BrowserProvider, Signer } from "ethers";
import { FHUNDA_ABI, FHE_USDT_ABI } from "./abis";
import { FHUNDA_CONTRACT_ADDRESS } from "./config";

export interface RelayerDiagnostics {
  isInitialized: boolean;
  hasCreateEncryptedInput: boolean;
  canCreateInput: boolean;
  canEncrypt: boolean;
  testEncryption?: {
    campaignIdHandle?: string;
    amountHandle?: string;
    error?: string;
  };
}

/**
 * Diagnose relayer status and capabilities
 */
export async function diagnoseRelayer(
  relayer: any
): Promise<RelayerDiagnostics> {
  const diagnostics: RelayerDiagnostics = {
    isInitialized: !!relayer,
    hasCreateEncryptedInput:
      relayer && typeof relayer.createEncryptedInput === "function",
    canCreateInput: false,
    canEncrypt: false,
  };

  if (!diagnostics.hasCreateEncryptedInput) {
    console.warn("❌ Relayer missing createEncryptedInput method");
    return diagnostics;
  }

  try {
    // Test creating an encrypted input
    const testInput = relayer.createEncryptedInput(
      FHUNDA_CONTRACT_ADDRESS,
      "0x0000000000000000000000000000000000000000"
    );
    diagnostics.canCreateInput = !!testInput;

    if (diagnostics.canCreateInput) {
      // Test adding data
      testInput.add32(0);
      testInput.add64(BigInt(1000000));

      // Test encryption
      try {
        const encrypted = await testInput.encrypt();
        diagnostics.canEncrypt = !!(encrypted && encrypted.handles);
        if (diagnostics.canEncrypt) {
          diagnostics.testEncryption = {
            campaignIdHandle: encrypted.handles[0]?.slice(0, 20),
          };
        }
      } catch (encErr) {
        diagnostics.testEncryption = {
          error: `Encryption failed: ${(encErr as Error).message}`,
        };
      }
    }
  } catch (err) {
    diagnostics.testEncryption = {
      error: `Input creation failed: ${(err as Error).message}`,
    };
  }

  return diagnostics;
}

/**
 * Verify contract setup for contributions
 */
export async function verifyContractSetup(
  provider: BrowserProvider,
  signer: Signer,
  userAddress: string
): Promise<{
  contractExists: boolean;
  campaignCount: number;
  hasOperator: boolean;
  errorDetails?: string;
}> {
  try {
    const contract = new Contract(
      FHUNDA_CONTRACT_ADDRESS,
      FHUNDA_ABI,
      provider
    );

    // Check if contract exists
    const code = await provider.getCode(FHUNDA_CONTRACT_ADDRESS);
    const contractExists = code !== "0x";

    if (!contractExists) {
      return {
        contractExists: false,
        campaignCount: 0,
        hasOperator: false,
        errorDetails: `Contract not found at ${FHUNDA_CONTRACT_ADDRESS}`,
      };
    }

    // Get campaign count
    let campaignCount = 0;
    try {
      const count = await contract.campaignCount();
      campaignCount = Number(count);
    } catch (err) {
      console.warn("Could not fetch campaign count:", err);
    }

    // Check operator status
    let hasOperator = false;
    try {
      const tokenAddress = await contract.token();
      const tokenContract = new Contract(tokenAddress, FHE_USDT_ABI, signer);
      hasOperator = await tokenContract.isOperator(
        userAddress,
        FHUNDA_CONTRACT_ADDRESS
      );
    } catch (err) {
      console.warn("Could not check operator status:", err);
    }

    return {
      contractExists,
      campaignCount,
      hasOperator,
    };
  } catch (err) {
    return {
      contractExists: false,
      campaignCount: 0,
      hasOperator: false,
      errorDetails: `Setup verification failed: ${(err as Error).message}`,
    };
  }
}

/**
 * Test contribution encryption end-to-end
 */
export async function testContributionEncryption(
  relayer: any,
  contractAddress: string,
  userAddress: string,
  campaignId: number,
  amount: string
): Promise<{
  success: boolean;
  campaignEncrypted: boolean;
  amountEncrypted: boolean;
  details?: Record<string, unknown>;
  error?: string;
}> {
  try {
    // Validate inputs
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return {
        success: false,
        campaignEncrypted: false,
        amountEncrypted: false,
        error: `Invalid amount: ${amount}`,
      };
    }

    // Test campaign ID encryption
    let campaignEncrypted = false;
    let campaignHandle = "";
    try {
      const inputCampaignId = relayer.createEncryptedInput(
        contractAddress,
        userAddress
      );
      inputCampaignId.add32(campaignId);
      const encryptedCampaign = await inputCampaignId.encrypt();
      campaignEncrypted = !!(
        encryptedCampaign &&
        encryptedCampaign.handles &&
        encryptedCampaign.handles[0]
      );
      campaignHandle = encryptedCampaign.handles[0]?.slice(0, 20) || "";
    } catch (err) {
      return {
        success: false,
        campaignEncrypted: false,
        amountEncrypted: false,
        error: `Campaign ID encryption failed: ${(err as Error).message}`,
      };
    }

    // Test amount encryption
    let amountEncrypted = false;
    let amountHandle = "";
    try {
      const inputAmount = relayer.createEncryptedInput(
        contractAddress,
        userAddress
      );
      const amountWei = BigInt(Math.floor(amountNum * 1e6));
      inputAmount.add64(amountWei);
      const encryptedAmount = await inputAmount.encrypt();
      amountEncrypted = !!(
        encryptedAmount &&
        encryptedAmount.handles &&
        encryptedAmount.handles[0]
      );
      amountHandle = encryptedAmount.handles[0]?.slice(0, 20) || "";
    } catch (err) {
      return {
        success: false,
        campaignEncrypted,
        amountEncrypted: false,
        error: `Amount encryption failed: ${(err as Error).message}`,
      };
    }

    return {
      success: campaignEncrypted && amountEncrypted,
      campaignEncrypted,
      amountEncrypted,
      details: {
        campaignIdEncrypted: campaignHandle,
        amountEncrypted: amountHandle,
        campaignIdValue: campaignId,
        amountValue: amountNum,
        amountWei: Math.floor(amountNum * 1e6),
      },
    };
  } catch (err) {
    return {
      success: false,
      campaignEncrypted: false,
      amountEncrypted: false,
      error: `Test failed: ${(err as Error).message}`,
    };
  }
}

/**
 * Run full diagnostics suite
 */
export async function runFullDiagnostics(
  relayer: any,
  provider: BrowserProvider,
  signer: Signer,
  userAddress: string,
  testCampaignId: number = 0,
  testAmount: string = "10"
): Promise<{
  timestamp: string;
  relayer: RelayerDiagnostics;
  contract: Awaited<ReturnType<typeof verifyContractSetup>>;
  encryption: Awaited<ReturnType<typeof testContributionEncryption>>;
  summary: string;
}> {
  const startTime = new Date().toISOString();

  console.log("🔍 Running full diagnostics suite...");

  const relayerDiag = await diagnoseRelayer(relayer);
  console.log("✓ Relayer diagnostics:", relayerDiag);

  const contractDiag = await verifyContractSetup(provider, signer, userAddress);
  console.log("✓ Contract setup:", contractDiag);

  let encryptionTest: Awaited<ReturnType<typeof testContributionEncryption>>;
  if (relayerDiag.canEncrypt) {
    encryptionTest = await testContributionEncryption(
      relayer,
      FHUNDA_CONTRACT_ADDRESS,
      userAddress,
      testCampaignId,
      testAmount
    );
    console.log("✓ Encryption test:", encryptionTest);
  } else {
    encryptionTest = {
      success: false,
      campaignEncrypted: false,
      amountEncrypted: false,
      error: "Relayer cannot encrypt",
    };
  }

  let summary = "";
  if (
    relayerDiag.canEncrypt &&
    contractDiag.contractExists &&
    encryptionTest.success
  ) {
    summary =
      "✅ All diagnostics passed. System should be ready for contributions.";
  } else {
    const issues = [];
    if (!relayerDiag.canEncrypt) issues.push("Relayer encryption failed");
    if (!contractDiag.contractExists) issues.push("Contract not found");
    if (!encryptionTest.success) issues.push("Encryption test failed");
    summary = `⚠️ Issues found: ${issues.join(", ")}`;
  }

  return {
    timestamp: startTime,
    relayer: relayerDiag,
    contract: contractDiag,
    encryption: encryptionTest,
    summary,
  };
}
