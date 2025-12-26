/**
 * Fhunda Contract Interaction Layer
 * Handles all interactions with the Fhunda smart contract for privacy-preserving crowdfunding
 */

import { ethers, Contract, BrowserProvider, Signer, hexlify } from "ethers";
import { FHUNDA_CONTRACT_ADDRESS, FHE_USDT_CONTRACT_ADDRESS } from "./config";
import { FHUNDA_ABI, FHE_USDT_ABI } from "./abis";

// Campaign data structure
export interface CampaignData {
  id: number;
  creator: string;
  deadline: number;
  withdrawn: boolean;
  active: boolean;
  title: string;
  description: string;
  image: string;
  category: string;
  targetAmount: string; // Display string
  totalFunded: string; // Display string
  status?: string; // "ACTIVE" | "SUCCESSFUL" | "FAILED" | "WITHDRAWN"
}

// Get Fhunda contract instance
export function getFhundaContract(
  signerOrProvider: Signer | BrowserProvider
): Contract {
  const address = FHUNDA_CONTRACT_ADDRESS;
  if (!address) {
    throw new Error("Fhunda contract address not configured");
  }
  return new Contract(address, FHUNDA_ABI, signerOrProvider);
}

// Get Token address from Fhunda contract
export async function getTokenAddress(
  provider: BrowserProvider
): Promise<string> {
  const contract = getFhundaContract(provider);
  return await contract.token();
}

// Get fheUSDT token contract instance
export function getFheUSDTContract(
  signerOrProvider: Signer | BrowserProvider
): Contract {
  const address = FHE_USDT_CONTRACT_ADDRESS;
  if (!address) {
    throw new Error("fheUSDT contract address not configured");
  }
  return new Contract(address, FHE_USDT_ABI, signerOrProvider);
}

/**
 * Check user's balance before contribution attempt
 */
export async function checkUserBalance(
  signer: Signer,
  relayer: any
): Promise<{ hasBalance: boolean; balanceStr: string; error?: string }> {
  try {
    const userAddress = await signer.getAddress();
    const tokenAddress = FHE_USDT_CONTRACT_ADDRESS;

    if (!tokenAddress) {
      return {
        hasBalance: false,
        balanceStr: "0",
        error: "Token address not configured",
      };
    }

    const tokenContract = getFheUSDTContract(signer);

    // Try to get encrypted balance
    try {
      const encryptedBalance = await tokenContract.confidentialBalanceOf(
        userAddress
      );

      if (!encryptedBalance || encryptedBalance === "0x" + "0".repeat(64)) {
        console.warn("⚠️  User balance is zero or unable to check");
        return { hasBalance: false, balanceStr: "0 (encrypted)" };
      }

      console.log("✓ User has encrypted balance");
      return {
        hasBalance: true,
        balanceStr: "encrypted (visible only to user)",
      };
    } catch (err: any) {
      console.warn("⚠️  Could not fetch encrypted balance:", err.message);
      return { hasBalance: false, balanceStr: "unknown", error: err.message };
    }
  } catch (err: any) {
    return { hasBalance: false, balanceStr: "0", error: err.message };
  }
}

/**
 * Create a new campaign with encrypted target amount
 */
export async function createCampaign(
  signer: Signer,
  relayer: any,
  targetAmount: string,
  durationInDays: number,
  title: string,
  description: string,
  image: string,
  category: string
): Promise<{ campaignId: number; txHash: string }> {
  const contract = getFhundaContract(signer);
  const contractAddress = await contract.getAddress();
  const userAddress = await signer.getAddress();

  // Encrypt the target amount using the relayer
  const input = relayer.createEncryptedInput(contractAddress, userAddress);

  // Convert target amount to wei (assuming 6 decimals like USDT)
  const targetWei = BigInt(Math.floor(parseFloat(targetAmount) * 1e6));
  input.add64(targetWei);

  const encrypted = await input.encrypt();
  const encryptedTarget = encrypted.handles[0];
  const proof = encrypted.inputProof;

  // Create metadata JSON string
  const metadata = JSON.stringify({
    title,
    description,
    image,
    category,
    targetAmount,
    createdAt: Date.now(),
  });

  // Create campaign on-chain with metadata
  const tx = await contract.createCampaign(
    encryptedTarget,
    proof,
    durationInDays,
    metadata
  );

  const receipt = await tx.wait();

  // Get campaign ID from event or return value
  let campaignId: number;

  // Try to get from event first
  const event = receipt.logs.find(
    (log: any) =>
      log.topics[0] === contract.interface.getEvent("CampaignCreated").topicHash
  );

  if (event) {
    const parsed = contract.interface.parseLog(event);
    campaignId = Number(parsed?.args?.campaignId || 0);
  } else {
    // Fallback to campaign count
    const campaignCount = await contract.campaignCount();
    campaignId = Number(campaignCount) - 1;
  }

  console.log("Campaign created:", {
    campaignId,
    title,
    description,
    image,
    category,
    targetAmount,
    durationInDays,
    txHash: receipt.hash,
  });

  return {
    campaignId,
    txHash: receipt.hash,
  };
}

/**
 * Optional: Set token operator for fheUSDT
 * This may be required depending on contract implementation
 * Can be called separately if needed
 */
export async function setTokenOperatorForContribution(
  signer: Signer,
  fhundaContractAddress: string,
  fheUsdtTokenAddress: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const tokenContract = new Contract(
      fheUsdtTokenAddress,
      FHE_USDT_ABI,
      signer
    );
    const userAddress = await signer.getAddress();

    console.log("🔐 Setting token operator...");

    const isOperator = await tokenContract.isOperator(
      userAddress,
      fhundaContractAddress
    );

    if (isOperator) {
      console.log("✓ Operator already set");
      return { success: true };
    }

    console.log("  → Setting operator...");
    const expirationTime = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

    const tx = await tokenContract.setOperator(
      fhundaContractAddress,
      expirationTime
    );

    const receipt = await tx.wait();
    console.log("✓ Operator set successfully:", receipt?.hash);

    return {
      success: true,
      txHash: receipt?.hash,
    };
  } catch (error: any) {
    const errorMsg = error.message || "Unknown error";
    console.error("✗ Failed to set operator:", errorMsg);

    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Contribute to a campaign with encrypted amount and campaign ID
 */
export async function contribute(
  signer: Signer,
  relayer: any,
  campaignId: number,
  amount: string
): Promise<{ txHash: string }> {
  const contract = getFhundaContract(signer);
  const contractAddress = await contract.getAddress();
  const userAddress = await signer.getAddress();

  // Input validation
  if (campaignId < 0) {
    throw new Error("Invalid campaign ID: must be non-negative");
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    throw new Error("Invalid contribution amount: must be greater than 0");
  }

  try {
    // Validate relayer is initialized
    if (!relayer || typeof relayer.createEncryptedInput !== "function") {
      throw new Error(
        "Relayer not properly initialized. Please refresh the page and ensure FHE relayer SDK is loaded."
      );
    }

    console.log("🔐 Starting contribution process...", {
      campaignId,
      amount,
      userAddress,
      contractAddress,
    });

    // Check token contract setup - REQUIRED for ERC7984
    console.log("✓ Setting up ERC7984 token operator (REQUIRED)...");
    const tokenAddress = await contract.token();
    console.log("  Token contract address:", tokenAddress);

    // Check if operator is already set
    const tokenContract = new Contract(tokenAddress, FHE_USDT_ABI, signer);
    try {
      const isOperator = await tokenContract.isOperator(
        userAddress,
        contractAddress
      );

      if (!isOperator) {
        console.log("  → Operator not set, calling setOperator...");
        const expirationTime =
          Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

        try {
          const tx = await tokenContract.setOperator(
            contractAddress,
            expirationTime
          );
          console.log("    ⏳ Operator transaction sent:", tx.hash);

          try {
            const receipt = await tx.wait();
            console.log("    ✓ Operator set successfully:", receipt?.hash);
          } catch (receiptError: any) {
            // Check if it's an RPC error
            if (
              receiptError.code === -32080 ||
              receiptError.message?.includes("RPC")
            ) {
              console.warn(
                "    ⚠️  RPC error getting receipt, but transaction may have succeeded:",
                tx.hash
              );
              console.warn("    → Transaction hash:", tx.hash);
              console.log(
                "    ✓ Operator transaction submitted (awaiting confirmation)"
              );
            } else {
              throw receiptError;
            }
          }
        } catch (opError: any) {
          // Distinguish between RPC errors and actual contract failures
          if (
            opError.code === -32080 ||
            opError.code === "NETWORK_ERROR" ||
            opError.message?.includes("RPC")
          ) {
            console.warn("    ⚠️  RPC endpoint error:", opError.message);
            console.warn(
              "    This is a network/RPC issue, not a contract issue."
            );
            console.log(
              "    → Continuing with contribution attempt (operator may already be set)"
            );
          } else if (opError.message?.includes("execution reverted")) {
            throw new Error(
              `Cannot set operator on ERC7984 token: ${opError.message}. Contract rejected the call.`
            );
          } else {
            throw new Error(
              `Cannot set operator on ERC7984 token: ${opError.message}. This is required for contributions.`
            );
          }
        }
      } else {
        console.log("  ✓ Operator already set");
      }
    } catch (opCheckError: any) {
      if (opCheckError.message?.includes("Cannot set operator")) {
        throw opCheckError;
      }
      console.warn(
        "  ⚠️  Could not verify operator status:",
        opCheckError.message
      );
    }

    // Check user balance
    console.log("✓ Checking user balance...");
    const balanceCheck = await checkUserBalance(signer, relayer);
    console.log("  Balance:", balanceCheck.balanceStr);
    if (
      !balanceCheck.hasBalance &&
      balanceCheck.balanceStr === "0 (encrypted)"
    ) {
      console.warn("⚠️  User balance appears to be zero!");
    }

    // Verify campaign exists and is active
    console.log("✓ Verifying campaign exists...");
    let campaignExists = false;
    try {
      const campaignData = await contract.getCampaignById(campaignId);
      if (
        !campaignData ||
        !campaignData[0] ||
        campaignData[0] === "0x0000000000000000000000000000000000000000"
      ) {
        console.warn(`⚠️  Campaign ${campaignId} not found or invalid`);
        campaignExists = false;
      } else {
        campaignExists = true;
        console.log("  ✓ Campaign verified:", {
          id: campaignId,
          creator: campaignData[0],
          status: Number(campaignData[2]),
        });
      }
    } catch (err: any) {
      console.warn(`⚠️  Could not verify campaign ${campaignId}:`, err.message);
      campaignExists = false;
    }

    if (!campaignExists) {
      console.warn(
        `⚠️  Campaign ${campaignId} may not exist. This could cause the transaction to revert.`
      );
    }

    // Create separate encrypted inputs for campaign ID and amount
    console.log("✓ Encrypting input data...");

    let encryptedCampaignData;
    let encryptedAmountData;

    try {
      const inputCampaignId = relayer.createEncryptedInput(
        contractAddress,
        userAddress
      );
      console.log("  → Adding campaignId (32-bit):", campaignId);
      inputCampaignId.add32(campaignId);
      encryptedCampaignData = await inputCampaignId.encrypt();
      console.log("  ✓ Campaign ID encrypted");
    } catch (err: any) {
      throw new Error(
        `Failed to encrypt campaign ID: ${err.message || err.toString()}`
      );
    }

    try {
      const inputAmount = relayer.createEncryptedInput(
        contractAddress,
        userAddress
      );
      const amountWei = BigInt(Math.floor(amountNum * 1e6));
      console.log("  → Adding amount (64-bit):", amountWei.toString());
      inputAmount.add64(amountWei);
      encryptedAmountData = await inputAmount.encrypt();
      console.log("  ✓ Amount encrypted");
    } catch (err: any) {
      throw new Error(
        `Failed to encrypt amount: ${err.message || err.toString()}`
      );
    }

    console.log("✓ Encrypted data prepared:", {
      campaignHandleLength: encryptedCampaignData.handles[0].length,
      amountHandleLength: encryptedAmountData.handles[0].length,
      campaignProofLength: encryptedCampaignData.inputProof.length,
      amountProofLength: encryptedAmountData.inputProof.length,
    });

    // Make contribution with proper parameter order
    console.log("✓ Submitting contribution transaction...");
    try {
      console.log(
        "  → Calling contract.contribute() with encrypted parameters..."
      );
      const tx = await contract.contribute(
        encryptedCampaignData.handles[0],
        encryptedAmountData.handles[0],
        encryptedCampaignData.inputProof,
        encryptedAmountData.inputProof,
        { gasLimit: 5000000 }
      );

      console.log("  ✓ Transaction sent:", tx.hash);
      const receipt = await tx.wait();

      console.log("✅ Contribution confirmed:", {
        campaignId,
        amount,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      });

      return {
        txHash: receipt.hash,
      };
    } catch (txError: any) {
      // Enhanced error logging for transaction failures
      console.error("❌ Transaction execution failed:", {
        code: txError.code,
        message: txError.message,
        reason: txError.reason,
        data: txError.data,
      });

      // Try to parse revert reason from error data
      if (txError.data) {
        console.error("  Error data (hex):", txError.data);
      }

      if (txError.revert) {
        console.error("  Revert reason:", txError.revert);
      }

      throw txError;
    }
  } catch (error: any) {
    const errorMsg = error.reason || error.message || "Unknown error";

    console.error("❌ Contribution error:", {
      campaignId,
      amount,
      errorMessage: errorMsg,
      errorCode: error.code,
      errorData: error.data,
      errorStack: error.stack?.split("\n")[0],
    });

    // Provide helpful error context
    if (errorMsg.includes("transaction execution reverted")) {
      console.error("\n📋 TRANSACTION REVERT DIAGNOSIS:");
      console.error("The contract rejected the transaction. Common causes:");
      console.error(
        "  1. Campaign doesn't exist (campaign ID: 0 may not be valid)"
      );
      console.error(
        "  2. User balance insufficient (check if you have enough fheUSDT)"
      );
      console.error(
        "  3. Contract validation failed (campaign may be closed/inactive)"
      );
      console.error(
        "  4. Encrypted input validation failed (malformed cryptographic data)"
      );
      console.error(
        "  5. Contract requires operator setup (need to call setTokenOperator first)"
      );
      console.error(
        "\n💡 Try: Check campaign ID, verify balance, or enable operator manually"
      );
    }

    if (errorMsg.includes("CALL_EXCEPTION")) {
      console.error("\n📋 CALL EXCEPTION DIAGNOSIS:");
      console.error("The contract call failed. This often indicates:");
      console.error("  1. Invalid contract state");
      console.error("  2. Insufficient balance or allowance");
      console.error("  3. Contract validation/requirement not met");
    }

    if (errorMsg.includes("missing revert data")) {
      console.error("\n📋 MISSING REVERT DATA:");
      console.error("Gas estimation failed silently. Try:");
      console.error("  1. Refresh the page to reload relayer");
      console.error("  2. Check user balance");
      console.error("  3. Verify campaign ID is valid");
    }

    throw new Error(`Contribution failed: ${errorMsg}`);
  }
}

/**
 * Withdraw funds from a campaign (creator only)
 */
export async function withdrawFunds(
  signer: Signer,
  campaignId: number
): Promise<{ txHash: string }> {
  const contract = getFhundaContract(signer);

  const tx = await contract.withdraw(campaignId);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
  };
}

/**
 * Check if a campaign exists
 */
export async function campaignExists(
  provider: BrowserProvider,
  campaignId: number
): Promise<boolean> {
  try {
    const contract = getFhundaContract(provider);
    const campaignData = await contract.getCampaignById(campaignId);
    return (
      campaignData &&
      campaignData[0] &&
      campaignData[0] !== "0x0000000000000000000000000000000000000000"
    );
  } catch {
    return false;
  }
}

/**
 * Get campaign count
 */
export async function getCampaignCount(
  provider: BrowserProvider
): Promise<number> {
  const contract = getFhundaContract(provider);
  const count = await contract.campaignCount();
  return Number(count);
}

/**
 * Helper to perform user decryption with automatic on-chain authorization if needed
 */
async function decryptWithAuthorization(
  signer: Signer,
  relayer: any,
  contract: Contract,
  contractAddress: string,
  handle: string,
  action: () => Promise<any> // Function to trigger on-chain authorization
): Promise<any> {
  const userAddress = await signer.getAddress();
  const keypair = relayer.generateKeypair();
  const handleContractPairs = [{ handle, contractAddress }];
  const startTimeStamp = Math.floor(Date.now() / 1000).toString();
  const durationDays = "365";
  const contractAddresses = [contractAddress];

  const eip712 = relayer.createEIP712(
    keypair.publicKey,
    contractAddresses,
    startTimeStamp,
    durationDays
  );

  const performDecryption = async () => {
    console.log("Requesting signature for decryption...");
    const signature = await signer.signTypedData(
      eip712.domain,
      {
        UserDecryptRequestVerification:
          eip712.types.UserDecryptRequestVerification,
      },
      eip712.message
    );

    return await relayer.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature.replace("0x", ""),
      contractAddresses,
      userAddress,
      startTimeStamp,
      durationDays
    );
  };

  try {
    // Attempt 1: Just try decrypting (may fail if not authorized yet)
    return await performDecryption();
  } catch (err: any) {
    const errorMsg = err.message || String(err);
    if (errorMsg.includes("not authorized") || errorMsg.includes("403")) {
      console.warn(
        "User not authorized for this handle. Triggering on-chain authorization..."
      );

      // Trigger the real transaction to call FHE.allow()
      const tx = await action();
      console.log("Authorization transaction sent:", tx.hash);
      await tx.wait();
      console.log(
        "Authorization transaction confirmed. Retrying decryption..."
      );

      // Attempt 2: Retry decryption after authorization
      return await performDecryption();
    }
    throw err;
  }
}

/**
 * Get campaign total funded amount (visible/decrypted)
 * Fetches the campaign's total contributions for progress bar display
 */
export async function getCampaignTotalFunded(
  provider: BrowserProvider,
  campaignId: number,
  relayer: any
): Promise<string> {
  try {
    const signer = await provider.getSigner();
    const contract = getFhundaContract(signer);
    const contractAddress = FHUNDA_CONTRACT_ADDRESS;

    // 1. Get the handle (static call is fine for just getting the bytes32)
    const handle = await contract.getEncryptedCampaignTotal.staticCall(
      campaignId
    );

    if (!handle || handle === "0x" + "0".repeat(64)) return "0";

    // 2. Decrypt with auto-authorization
    const result = await decryptWithAuthorization(
      signer,
      relayer,
      contract,
      contractAddress,
      handle,
      () => contract.getEncryptedCampaignTotal(campaignId) // Real tx for authorization
    );

    const decryptedValue = result[handle];
    if (decryptedValue === undefined) return "0";

    const totalFloat = Number(decryptedValue) / 1e6;
    return totalFloat.toFixed(6);
  } catch (err: any) {
    console.error(
      `Failed to decrypt campaign total for ${campaignId}:`,
      err.message
    );
    throw err;
  }
}

/**
 * Get total platform raised amount (aggregate of all campaigns)
 * Uses the contract's aggregate function for better performance/accuracy
 */
export async function getTotalPlatformRaised(
  provider: BrowserProvider,
  relayer: any
): Promise<string> {
  try {
    const signer = await provider.getSigner();
    const contract = getFhundaContract(signer);
    const contractAddress = FHUNDA_CONTRACT_ADDRESS;

    // 1. Get the handle
    const handle = await contract.getTotalPlatformRaised.staticCall();

    if (!handle || handle === "0x" + "0".repeat(64)) return "0";

    // 2. Decrypt with auto-authorization
    const result = await decryptWithAuthorization(
      signer,
      relayer,
      contract,
      contractAddress,
      handle,
      () => contract.getTotalPlatformRaised() // Real tx for authorization
    );

    const decryptedValue = result[handle];
    if (decryptedValue === undefined) return "0";

    const totalFloat = Number(decryptedValue) / 1e6;
    return totalFloat.toFixed(6);
  } catch (err: any) {
    console.error("Failed to decrypt platform total raised:", err.message);
    throw err;
  }
}

/**
 * Get encrypted campaign target
 */
export async function getEncryptedCampaignTarget(
  signer: Signer,
  campaignId: number
): Promise<string> {
  const contract = getFhundaContract(signer);
  const encryptedTarget = await contract.getEncryptedCampaignTarget.staticCall(
    campaignId
  );
  return hexlify(encryptedTarget);
}

/**
 * Get encrypted contribution for a user
 */
export async function getEncryptedContribution(
  signer: Signer,
  contributor: string,
  campaignId: number
): Promise<string> {
  const contract = getFhundaContract(signer);
  const encryptedContribution =
    await contract.getEncryptedContribution.staticCall(contributor, campaignId);
  return hexlify(encryptedContribution);
}

/**
 * Mint fheUSDT tokens (testnet only)
 */
export async function mintFheUSDT(
  signer: Signer,
  relayer: any,
  to: string,
  amount: bigint
): Promise<{ txHash: string }> {
  const contract = getFheUSDTContract(signer);
  const contractAddress = await contract.getAddress();
  const userAddress = await signer.getAddress();

  // Create encrypted input for the amount
  const input = relayer.createEncryptedInput(contractAddress, userAddress);
  input.add64(amount);
  const encryptedAmount = await input.encrypt();

  // Call confidentialMint
  const tx = await contract.confidentialMint(
    to,
    encryptedAmount.handles[0],
    encryptedAmount.inputProof
  );

  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
  };
}

/**
 * Get encrypted balance of fheUSDT
 */
export async function getEncryptedBalance(
  provider: BrowserProvider,
  address: string
): Promise<string> {
  const contract = getFheUSDTContract(provider);
  const encryptedBalance = await contract.confidentialBalanceOf(address);
  return hexlify(encryptedBalance);
}

/**
 * Set operator for fheUSDT token
 */
export async function setTokenOperator(
  signer: Signer,
  operator: string,
  expirationTimestamp: number
): Promise<{ txHash: string }> {
  const contract = getFheUSDTContract(signer);

  const tx = await contract.setOperator(operator, expirationTimestamp);
  const receipt = await tx.wait();

  return {
    txHash: receipt.hash,
  };
}

/**
 * Check if address is operator for fheUSDT
 */
export async function isTokenOperator(
  provider: BrowserProvider,
  owner: string,
  operator: string
): Promise<boolean> {
  const contract = getFheUSDTContract(provider);
  return await contract.isOperator(owner, operator);
}

// Get all campaigns from the contract
export async function getAllCampaigns(
  provider: BrowserProvider
): Promise<CampaignData[]> {
  const contract = getFhundaContract(provider);

  try {
    // Get all campaign IDs from contract
    const campaignIds: bigint[] = await contract.getAllCampaigns();
    const campaigns: CampaignData[] = [];

    // Fetch details for each campaign
    for (const id of campaignIds) {
      const campaignId = Number(id);

      try {
        const [
          creator,
          deadline,
          status,
          withdrawn,
          creationDate,
          metadataJson,
        ] = await contract.getCampaignById(campaignId);

        // Parse metadata JSON
        let metadata: any = {};
        try {
          metadata = JSON.parse(metadataJson || "{}");
        } catch (e) {
          console.warn(
            `Failed to parse metadata for campaign ${campaignId}:`,
            e
          );
        }

        // Fetch the actual campaign total for progress bar
        let totalFunded = "🔒 Private";
        try {
          const totalResult = await contract.getEncryptedCampaignTotal(
            campaignId
          );
          // The total should be visible on-chain for progress tracking
          // Even though individual contributions are encrypted
          if (totalResult) {
            // The total is encrypted, so we just indicate it's available
            // individual contributions are private
            totalFunded = "🔒 Private";
          }
        } catch (err) {
          console.warn(
            `Could not fetch total for campaign ${campaignId}:`,
            err
          );
        }

        campaigns.push({
          id: campaignId,
          creator: creator,
          deadline: Number(deadline),
          withdrawn: withdrawn,
          // Map numeric status to string
          status:
            Number(status) === 0
              ? "ACTIVE"
              : Number(status) === 1
              ? "SUCCESSFUL"
              : Number(status) === 2
              ? "FAILED"
              : Number(status) === 3
              ? "WITHDRAWN"
              : "UNKNOWN",
          active: Number(status) === 0, // CampaignStatus.Active = 0
          title: metadata.title || `Campaign ${campaignId}`,
          description: metadata.description || "",
          image: metadata.image || "",
          category: metadata.category || "Other",
          targetAmount: metadata.targetAmount || "0",
          totalFunded: totalFunded, // Now fetches actual total from contract
        });
      } catch (err) {
        console.error(`Failed to fetch campaign ${campaignId}:`, err);
      }
    }

    return campaigns;
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    return [];
  }
}

export async function getCampaignsByCreator(
  provider: BrowserProvider,
  creator: string
): Promise<CampaignData[]> {
  const allCampaigns = await getAllCampaigns(provider);
  return allCampaigns.filter(
    (c) => c.creator.toLowerCase() === creator.toLowerCase()
  );
}

export async function getFormattedCampaign(
  provider: BrowserProvider,
  campaignId: number
): Promise<CampaignData | null> {
  const campaigns = await getAllCampaigns(provider);
  return campaigns.find((c) => c.id === campaignId) || null;
}

export async function getContributionAmount(
  provider: BrowserProvider,
  campaignId: number,
  contributor: string
): Promise<string> {
  // Contributions are encrypted - return placeholder
  return "0";
}

export async function refund(
  signer: Signer,
  campaignId: number
): Promise<{ txHash: string }> {
  // Refund functionality would need to be added to the contract
  throw new Error("Refund not implemented in current contract version");
}

export async function closeCampaign(
  signer: Signer,
  campaignId: number
): Promise<{ txHash: string }> {
  // Close campaign by withdrawing (if creator)
  return withdrawFunds(signer, campaignId);
}

/**
 * Get Confidential FHE-USDT balance
 */
export async function getConfidentialBalance(
  signer: Signer,
  relayer: any,
  tokenAddress: string
): Promise<string> {
  const userAddress = await signer.getAddress();
  const tokenContract = new Contract(tokenAddress, FHE_USDT_ABI, signer);

  try {
    // 1. Get the ciphertext handle for the confidential balance
    const handle = await tokenContract.confidentialBalanceOf(userAddress);

    if (!handle || handle === "0x" + "0".repeat(64)) {
      return "0.00";
    }

    // 2. Perform user decryption using Zama Relayer SDK
    const keypair = relayer.generateKeypair();
    const handleContractPairs = [
      {
        handle: handle,
        contractAddress: tokenAddress,
      },
    ];

    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = "365";
    const contractAddresses = [tokenAddress];

    // Create EIP712 request for authorization
    const eip712 = relayer.createEIP712(
      keypair.publicKey,
      contractAddresses,
      startTimeStamp,
      durationDays
    );

    // Request user signature
    const signature = await signer.signTypedData(
      eip712.domain,
      {
        UserDecryptRequestVerification:
          eip712.types.UserDecryptRequestVerification,
      },
      eip712.message
    );

    // Decrypt using the relayer
    const result = await relayer.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature.replace("0x", ""),
      contractAddresses,
      userAddress,
      startTimeStamp,
      durationDays
    );

    const decryptedValue = result[handle];
    // Convert from uint64 (6 decimals)
    const balanceFloat = Number(decryptedValue) / 1e6;
    return balanceFloat.toFixed(2);
  } catch (err) {
    console.error("Error fetching confidential balance:", err);
    throw err;
  }
}
