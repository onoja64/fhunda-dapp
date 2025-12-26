import { ethers, hexlify } from "ethers";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Type definitions for runtime SDK
type FhevmInstance = any;

// Lazy-loaded relayer SDK and instance
let fhevmInstance: FhevmInstance | null = null;

/**
 * Initialize the FHE instance from CDN - Uses pre-loaded SDK from Script tag
 * The SDK is loaded via Script tag in layout.tsx and accessed from window
 */
/**
 * Initialize the FHEVM v0.9 instance.
 * Flow:
 * 1. Try to find CDN-exposed global (`window.RelayerSDK` or `window.relayerSDK`).
 * 2. If not present, try to import the installed bundle `@zama-fhe/relayer-sdk/bundle` dynamically.
 * 3. If that fails, try dynamic ESM import from the CDN URL as a final fallback.
 *
 * Accepts an optional `provider` (ethers `BrowserProvider` or EIP-1193 provider).
 * If not provided, the function will use `window.ethereum`.
 */
export async function initializeFheInstance(
  provider?: any
): Promise<FhevmInstance> {
  if (fhevmInstance) return fhevmInstance;

  if (typeof window === "undefined") {
    throw new Error("initializeFheInstance must be called in the browser");
  }

  try {
    console.log("Initializing FHEVM v0.9 SDK (attempt)...");

    // 1) Prefer global installed by CDN UMD bundle
    let sdk: any =
      (window as any).RelayerSDK ||
      (window as any).relayerSDK ||
      (window as any).relayer ||
      (window as any).fhevm;

    // 2) Try local installed bundle (safe dynamic import to avoid SSR issues)
    if (!sdk) {
      try {
        const mod: any = await import("@zama-fhe/relayer-sdk/bundle");
        sdk = mod || (mod && (mod.default || mod));
        console.log("Loaded RelayerSDK from installed bundle");
      } catch (pkgErr: any) {
        console.warn(
          "RelayerSDK bundle import failed:",
          pkgErr?.message || pkgErr
        );
      }
    }

    // 3) CDN ESM fallback (runtime import). Use webpackIgnore so bundlers don't try to bundle it.
    if (!sdk) {
      try {
        const remote: any =
          (await (globalThis as any).import?.(
            "https://cdn.zama.ai/relayer-sdk-js/0.3.0-5/relayer-sdk-js.js"
          )) || {};
        sdk = remote || (remote && (remote.default || remote));
        console.log("Loaded RelayerSDK from CDN (dynamic import)");
      } catch (cdnErr: any) {
        console.warn("CDN dynamic import failed:", cdnErr?.message || cdnErr);
      }
    }

    if (!sdk) {
      throw new Error(
        "RelayerSDK not loaded. Please include the CDN script (UMD) or install @zama-fhe/relayer-sdk and ensure it's available in the browser."
      );
    }

    const { initSDK, createInstance, SepoliaConfig } = sdk;

    if (!initSDK || !createInstance) {
      throw new Error(
        "RelayerSDK appears malformed: missing initSDK/createInstance"
      );
    }

    // Initialize SDK (loads WASM, etc.)
    await initSDK();

    // Choose provider: supplied provider or window.ethereum fallback
    let network = provider;

    if (provider && typeof provider === "object") {
      console.log("[Relayer] Inspecting provider object:", {
        keys: Object.keys(provider),
        hasRequest: typeof provider.request === "function",
        isEthersProvider: provider._isProvider || !!provider.provider,
      });

      // 1. If it already looks like a raw EIP-1193 provider, use it directly
      if (typeof provider.request === "function") {
        network = provider;
        console.log("[Relayer] Using raw EIP-1193 provider directly");
      }
      // 2. If it's an ethers BrowserProvider (v6), extract .provider
      else if (
        provider.provider &&
        typeof provider.provider.request === "function"
      ) {
        network = provider.provider;
        console.log(
          "[Relayer] Extracted EIP-1193 provider from BrowserProvider (v6)"
        );
      }
      // 3. If it's an ethers Web3Provider (v5), extract ._getProvider() result
      else if (provider._getProvider) {
        try {
          const extracted = await provider._getProvider();
          if (extracted && typeof extracted.request === "function") {
            network = extracted;
            console.log(
              "[Relayer] Extracted EIP-1193 provider from BrowserProvider (v5)"
            );
          }
        } catch (e) {
          console.warn("[Relayer] Failed to extract v5 provider:", e);
        }
      }
    }

    // Fallback to window.ethereum if no provider
    if (!network) {
      network = (window as any).ethereum;
    }

    if (!network) {
      throw new Error(
        "Ethereum provider not found. Please provide a provider or connect a wallet."
      );
    }

    const config = { ...(SepoliaConfig || {}), network };
    fhevmInstance = await createInstance(config);

    console.log(
      "FHEVM instance initialized successfully (v0.3.0-5 compatible)"
    );
    return fhevmInstance;
  } catch (error) {
    console.error("Failed to initialize FHE instance:", error);
    throw error;
  }
}

/**
 * Get the initialized FHE instance
 */
export function getFheInstance(): FhevmInstance | null {
  return fhevmInstance;
}

/**
 * Encrypt a contribution amount for the smart contract
 * @param amount - The amount to encrypt (as string in wei)
 * @param contractAddress - The target contract address
 * @param userAddress - The user's address
 * @returns Object containing handles and proof for the encrypted input
 */
export async function encryptContributionAmount(
  amount: string,
  contractAddress: string,
  userAddress: string
): Promise<{
  handle: string;
  proof: string;
  amount: string;
}> {
  const fhe = getFheInstance();
  if (!fhe) {
    throw new Error(
      "FHE instance not initialized. Call initializeFheInstance() first."
    );
  }

  try {
    // Convert contract address to checksum format
    const contractAddressChecksum = ethers.getAddress(contractAddress);

    // Create encrypted input for euint32 (32-bit unsigned integer)
    const input = fhe.createEncryptedInput(
      contractAddressChecksum,
      userAddress
    );

    // Add the amount as euint32
    const amountNumber = BigInt(amount);

    if (amountNumber < 0n) {
      throw new Error("Amount must be non-negative");
    }

    // Use 64-bit encrypted integer for amounts to support wei-sized values
    // Clamp to euint64 max value (2^64 - 1) if needed
    const maxEuint64 = BigInt("0xffffffffffffffff");
    if (amountNumber > maxEuint64) {
      console.warn(
        `Amount ${amount} exceeds euint64 max value, it may be truncated or invalid`
      );
    }

    // Add as 64-bit unsigned integer to avoid truncation for typical wei amounts
    if (typeof input.add64 === "function") {
      input.add64(amountNumber);
    } else {
      // Fallback: if the runtime only supports add32, still attempt add32 but warn
      console.warn(
        "Relayer runtime does not support add64(), falling back to add32()"
      );
      input.add32(amountNumber);
    }

    // Encrypt the input
    const { handles, inputProof } = await input.encrypt();

    // Get the handle - it should be a bytes32 (32 bytes)
    const handleBytes = handles[0];
    if (!(handleBytes instanceof Uint8Array) || handleBytes.length !== 32) {
      throw new Error(
        `Invalid handle format: expected 32-byte Uint8Array, got ${
          handleBytes?.length || "unknown"
        } bytes`
      );
    }

    // Convert handle to hex string (0x-prefixed 64 hex chars for 32 bytes)
    const handleHex = hexlify(handleBytes);
    const proofHex = hexlify(inputProof);

    console.log("Encryption successful:", {
      handleLength: handleBytes.length,
      handleHex,
      proofLength: inputProof.length,
      amount,
    });

    return {
      handle: handleHex,
      proof: proofHex,
      amount: amount,
    };
  } catch (error) {
    console.error("Failed to encrypt contribution amount:", error);
    throw error;
  }
}

/**
 * Create encrypted input with multiple values
 * @param params - Object containing values to encrypt
 * @param contractAddress - The target contract address
 * @param userAddress - The user's address
 * @returns Object containing handles and proof
 */
export async function encryptMultipleInputs(
  params: {
    amount?: string;
    flag?: boolean;
    address?: string;
  },
  contractAddress: string,
  userAddress: string
): Promise<{
  handles: string[];
  proof: string;
}> {
  const fhe = getFheInstance();
  if (!fhe) {
    throw new Error(
      "FHE instance not initialized. Call initializeFheInstance() first."
    );
  }

  try {
    // Convert contract address to checksum format
    const contractAddressChecksum = ethers.getAddress(contractAddress);

    const input = fhe.createEncryptedInput(
      contractAddressChecksum,
      userAddress
    );

    // Add values in order
    if (params.amount !== undefined) {
      const amountVal = BigInt(params.amount);
      if (amountVal < 0n) {
        throw new Error("Amount must be non-negative");
      }
      if (typeof input.add64 === "function") {
        input.add64(amountVal);
      } else {
        console.warn(
          "Relayer runtime does not support add64(), falling back to add32() for params.amount"
        );
        input.add32(amountVal);
      }
    }
    if (params.flag !== undefined) {
      input.addBool(params.flag);
    }
    if (params.address !== undefined) {
      input.addAddress(params.address);
    }

    const { handles, inputProof } = await input.encrypt();

    // Convert all handles to hex strings
    const handlesHex = handles.map((h: Uint8Array) => hexlify(h));
    const proofHex = hexlify(inputProof);

    return {
      handles: handlesHex,
      proof: proofHex,
    };
  } catch (error) {
    console.error("Failed to encrypt multiple inputs:", error);
    throw error;
  }
}

/**
 * Decrypt a single encrypted value using the relayer
 * @param encryptedBytes - The encrypted handle as hex string
 * @returns The decrypted number value
 */
export async function decryptValue(encryptedBytes: string): Promise<number> {
  const fhe = getFheInstance();
  if (!fhe)
    throw new Error(
      "FHE instance not initialized. Call initializeFheInstance() first."
    );

  try {
    // Always pass an array of hex strings
    if (
      typeof encryptedBytes === "string" &&
      encryptedBytes.startsWith("0x") &&
      encryptedBytes.length === 66
    ) {
      const values = await fhe.publicDecrypt([encryptedBytes]);
      // values is an object: { [handle]: value }
      return Number(values[encryptedBytes]);
    } else {
      throw new Error("Invalid ciphertext handle for decryption");
    }
  } catch (error: any) {
    // Check for relayer/network error
    if (
      error?.message?.includes("Failed to fetch") ||
      error?.message?.includes("NetworkError")
    ) {
      throw new Error(
        "Decryption service is temporarily unavailable. Please try again later."
      );
    }
    throw error;
  }
}

async function decryptWithRetry(
  encryptedBytes: string,
  maxAttempts = 3
): Promise<number> {
  let lastErr: any;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await decryptValue(encryptedBytes);
    } catch (error: any) {
      lastErr = error;
      const msg = String(error?.message || "").toLowerCase();
      const isTransient =
        msg.includes("failed to fetch") ||
        msg.includes("temporarily unavailable") ||
        msg.includes("network");
      if (!isTransient) break;
      const backoffMs = 250 * Math.pow(2, i);
      await new Promise((res) => setTimeout(res, backoffMs));
    }
  }
  throw lastErr;
}

/**
 * Get decrypted stats (sum and count) and compute average
 * @param cardId - The card ID to get stats for
 * @param contract - The contract instance
 * @returns Object with sum, count, and average
 */
export async function getDecryptedStats(
  cardId: number,
  contract: any
): Promise<{ sum: number; count: number; average: number }> {
  try {
    const fhe = getFheInstance();
    if (!fhe)
      throw new Error(
        "FHE instance not initialized. Call initializeFheInstance() first."
      );

    // Get encrypted sum and count from the contract using getEncryptedStats
    const { sum: encryptedSum, count: encryptedCount } =
      await contract.getEncryptedStats(cardId);
    try {
      // Diagnostic log of ciphertexts used for decryption
      console.log("[FHE] getEncryptedStats", {
        cardId: String(cardId),
        encryptedSum,
        encryptedCount,
        ua: typeof navigator !== "undefined" ? navigator.userAgent : "node",
      });
    } catch {}

    // Decrypt both values with tiny spacing to avoid throttling
    const sum = await decryptWithRetry(encryptedSum, 4);
    await new Promise((res) => setTimeout(res, 150));
    const count = await decryptWithRetry(encryptedCount, 4);

    try {
      console.log("[FHE] decrypted", { cardId: String(cardId), sum, count });
    } catch {}

    // Calculate average
    const average = count > 0 ? sum / count : 0;

    return { sum, count, average };
  } catch (_error: any) {
    // Return fallback values if decryption fails
    return { sum: 0, count: 0, average: 0 };
  }
}

/**
 * Read getEncryptedStats until two consecutive reads agree (helps avoid transient RPC/skew issues)
 * @param cardId - The card ID
 * @param contract - The contract instance
 * @param maxAttempts - Maximum attempts to get stable stats
 * @returns Object with encryptedSum and encryptedCount
 */
export async function getStableEncryptedStats(
  cardId: number,
  contract: any,
  maxAttempts = 3
): Promise<{ encryptedSum: string; encryptedCount: string }> {
  let last: { s: string; c: string } | null = null;
  for (let i = 0; i < maxAttempts; i++) {
    const r = await contract.getEncryptedStats(cardId);
    const s = (r?.sum || r?.[0]) as string;
    const c = (r?.count || r?.[1]) as string;
    if (last && last.s === s && last.c === c) {
      return { encryptedSum: s, encryptedCount: c };
    }
    last = { s, c };
    // tiny delay before retry (avoid hammering)
    await new Promise((res) => setTimeout(res, 50));
  }
  // Return last seen if stability not achieved
  return { encryptedSum: last?.s || "0x", encryptedCount: last?.c || "0x" };
}

/**
 * Helper function to format average rating for display
 * @param average - The average rating
 * @param totalReviews - Optional total reviews count
 * @returns Formatted string
 */
export function formatAverageRating(
  average: number,
  totalReviews?: number
): string {
  if (totalReviews && totalReviews > 0 && average === 0) return "Encrypted"; // fallback if decryption fails
  if (average === 0) return "No ratings yet";
  return average.toFixed(1);
}

/**
 * Decrypt with a time budget: keep trying stable-reads + decrypt until deadline
 * @param cardId - The card ID
 * @param contract - The contract instance
 * @param deadlineMs - Time budget in milliseconds
 * @returns Decrypted stats or null if timeout
 */
export async function decryptStatsWithDeadline(
  cardId: number,
  contract: any,
  deadlineMs = 20000
): Promise<{ sum: number; count: number; average: number } | null> {
  const end = Date.now() + Math.max(2000, deadlineMs);
  let attempt = 0;
  while (Date.now() < end) {
    attempt++;
    try {
      const { encryptedSum, encryptedCount } = await getStableEncryptedStats(
        cardId,
        contract,
        3
      );
      console.log("[FHE] attempt stable stats", {
        cardId: String(cardId),
        encryptedSum,
        encryptedCount,
        attempt,
      });
      const sum = await decryptWithRetry(encryptedSum, 4);
      await new Promise((res) => setTimeout(res, 150));
      const count = await decryptWithRetry(encryptedCount, 4);
      const average = count > 0 ? sum / count : 0;
      console.log("[FHE] success decrypt", {
        cardId: String(cardId),
        sum,
        count,
        average,
        attempt,
      });
      return { sum, count, average };
    } catch (error: any) {
      const backoff = Math.min(2000, 250 * Math.pow(2, Math.min(4, attempt)));
      console.log("[FHE] decrypt retry", {
        cardId: String(cardId),
        attempt,
        backoff,
        error: String(error?.message || error),
      });
      await new Promise((res) => setTimeout(res, backoff));
    }
  }
  console.log("[FHE] decrypt timeout", {
    cardId: String(cardId),
    budgetMs: deadlineMs,
  });
  return null;
}

/**
 * Decrypt values from the smart contract (legacy function)
 * @param handles - Array of encrypted handles to decrypt
 * @returns Decrypted values and proof for verification
 */
export async function decryptValues(handles: (string | Uint8Array)[]): Promise<{
  clearValues: Record<string, bigint | boolean | string>;
  abiEncodedClearValues: string;
  decryptionProof: string;
}> {
  const fhe = getFheInstance();
  if (!fhe) {
    throw new Error(
      "FHE instance not initialized. Call initializeFheInstance() first."
    );
  }

  try {
    // Ensure handles are hex strings
    const stringHandles = handles.map((h) =>
      typeof h === "string" ? h : hexlify(h)
    );

    const result = await fhe.publicDecrypt(stringHandles);

    const decryptionProofHex =
      typeof result.decryptionProof === "string"
        ? result.decryptionProof
        : hexlify(result.decryptionProof as Uint8Array);

    const clearValues = result.clearValues as Record<
      string,
      bigint | boolean | string
    >;

    const abiEncodedClearValues = String(result.abiEncodedClearValues);

    return {
      clearValues,
      abiEncodedClearValues,
      decryptionProof: decryptionProofHex,
    };
  } catch (error) {
    console.error("Failed to decrypt values:", error);
    throw error;
  }
}

/**
 * Validate that the relayer is properly configured
 */
export async function validateRelayerConfiguration(): Promise<boolean> {
  try {
    if (!getFheInstance()) {
      await initializeFheInstance();
    }
    return getFheInstance() !== null;
  } catch (error) {
    console.error("Relayer configuration validation failed:", error);
    return false;
  }
}
