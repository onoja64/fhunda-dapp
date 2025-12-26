/**
 * IPFS Integration proxy-safe copy
 * This file mirrors src/lib/ipfs.ts but routes Pinata uploads via the server proxy
 */

// Pinata configuration - client still can read gateway
const PINATA_GATEWAY = "https://gateway.pinata.cloud";

// Web3.Storage alternative - can be used instead of Pinata
const WEB3_STORAGE_TOKEN = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN || "";

// Nft.storage alternative - free IPFS pinning service
const NFT_STORAGE_TOKEN = process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN || "";

// Multiple gateway fallbacks for better reliability
const IPFS_GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://dweb.link/ipfs/",
];

export async function uploadImageToPinata(
  file: File
): Promise<{ hash: string; url: string }> {
  // Client-side should call the server-side proxy route which holds Pinata secrets.
  // This avoids exposing Pinata API keys/JWT to the browser.
  try {
    const formData = new FormData();
    formData.append("file", file);

    // Add metadata
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploaded_by: "fhunda",
        campaign_image: "true",
      },
    });
    formData.append("pinataMetadata", metadata);

    // Pinata options
    const options = JSON.stringify({ cidVersion: 1 });
    formData.append("pinataOptions", options);

    // Call the server-side proxy route at /api/pinata/upload
    const response = await fetch("/api/pinata/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Pinata proxy upload failed: ${response.status} ${response.statusText} - ${text}`
      );
    }

    const data = await response.json();
    // Pinata returns IpfsHash on success
    const ipfsHash =
      data?.IpfsHash || (data?.value && data.value.cid) || data?.cid;
    const ipfsUrl = `ipfs://${ipfsHash}`;

    return {
      hash: ipfsHash,
      url: ipfsUrl,
    };
  } catch (error) {
    console.error("Error uploading image to Pinata proxy:", error);
    throw error;
  }
}

export async function uploadImageToNFTStorage(
  file: File
): Promise<{ hash: string; url: string }> {
  if (!NFT_STORAGE_TOKEN) {
    throw new Error(
      "NFT.Storage token not configured. Set NEXT_PUBLIC_NFT_STORAGE_TOKEN"
    );
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("https://api.nft.storage/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NFT_STORAGE_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`NFT.Storage upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    const ipfsHash = data.value.cid;
    const ipfsUrl = `ipfs://${ipfsHash}`;

    return {
      hash: ipfsHash,
      url: ipfsUrl,
    };
  } catch (error) {
    console.error("Error uploading image to NFT.Storage:", error);
    throw error;
  }
}

export async function uploadImageToWeb3Storage(
  file: File
): Promise<{ hash: string; url: string }> {
  if (!WEB3_STORAGE_TOKEN) {
    throw new Error(
      "Web3.Storage token not configured. Set NEXT_PUBLIC_WEB3_STORAGE_TOKEN"
    );
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("https://api.web3.storage/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WEB3_STORAGE_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Web3.Storage upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    const ipfsHash = data.cid;
    const ipfsUrl = `ipfs://${ipfsHash}`;

    return {
      hash: ipfsHash,
      url: ipfsUrl,
    };
  } catch (error) {
    console.error("Error uploading image to Web3.Storage:", error);
    throw error;
  }
}

export async function uploadImageToIPFS(
  file: File
): Promise<{ hash: string; url: string; gatewayUrl: string }> {
  let result = null;
  let error = null;

  // Try Pinata via server proxy first
  try {
    const pinataResult = await uploadImageToPinata(file);
    result = {
      ...pinataResult,
      gatewayUrl: `${PINATA_GATEWAY}/ipfs/${pinataResult.hash}`,
    };
    return result;
  } catch (err) {
    console.warn("Pinata proxy upload failed, trying NFT.Storage:", err);
    error = err;
  }

  // Try NFT.Storage
  if (NFT_STORAGE_TOKEN) {
    try {
      const nftResult = await uploadImageToNFTStorage(file);
      result = {
        ...nftResult,
        gatewayUrl: `https://nft.storage/${nftResult.hash}`,
      };
      return result;
    } catch (err) {
      console.warn("NFT.Storage upload failed, trying Web3.Storage:", err);
      error = err;
    }
  }

  // Try Web3.Storage
  if (WEB3_STORAGE_TOKEN) {
    try {
      const web3Result = await uploadImageToWeb3Storage(file);
      result = {
        ...web3Result,
        gatewayUrl: `https://w3s.link/ipfs/${web3Result.hash}`,
      };
      return result;
    } catch (err) {
      console.warn("Web3.Storage upload failed:", err);
      error = err;
    }
  }

  if (!result) {
    throw new Error(
      error
        ? `All IPFS services failed. Last error: ${error}`
        : "No IPFS service configured. Please set environment variables for Pinata, NFT.Storage, or Web3.Storage"
    );
  }

  return result;
}

export function getIPFSGatewayUrl(
  ipfsHash: string,
  gateway: "pinata" | "nft.storage" | "w3s" | "auto" = "auto"
): string {
  const hash = ipfsHash.replace(/^ipfs:\/\//, "");

  switch (gateway) {
    case "nft.storage":
      return `https://nft.storage/${hash}`;
    case "w3s":
      return `https://w3s.link/ipfs/${hash}`;
    case "pinata":
      return `${PINATA_GATEWAY}/ipfs/${hash}`;
    case "auto":
    default:
      // Use Pinata as primary, with fallback logic in components
      return `${PINATA_GATEWAY}/ipfs/${hash}`;
  }
}

// Enhanced function that tries multiple gateways
export async function getIPFSImageUrl(ipfsHash: string): Promise<string> {
  const hash = ipfsHash.replace(/^ipfs:\/\//, "");

  // Try each gateway in order
  for (const gateway of IPFS_GATEWAYS) {
    try {
      const url = `${gateway}${hash}`;
      // Test if the image loads (basic fetch check)
      const response = await fetch(url, { method: "HEAD" });
      if (response.ok) {
        return url;
      }
    } catch (error) {
      console.warn(`Gateway ${gateway} failed for ${hash}:`, error);
      continue;
    }
  }

  // Fallback to primary gateway if all fail
  return `${PINATA_GATEWAY}/ipfs/${hash}`;
}

export function validateImageFile(file: File, maxSizeMB: number = 10): boolean {
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (!validTypes.includes(file.type)) {
    throw new Error(
      `Invalid file type. Supported formats: JPEG, PNG, GIF, WebP. Received: ${file.type}`
    );
  }

  if (file.size > maxSizeBytes) {
    throw new Error(
      `File size exceeds ${maxSizeMB}MB limit. File size: ${(
        file.size /
        1024 /
        1024
      ).toFixed(2)}MB`
    );
  }

  return true;
}
