/**
 * IPFS Integration for Fhunda
 * Handles image uploads and retrieval from IPFS using Pinata or Web3.Storage
 */

// Pinata configuration - using their free tier
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || "";
const PINATA_API_SECRET = process.env.NEXT_PUBLIC_PINATA_API_SECRET || "";
const PINATA_GATEWAY = "https://gateway.pinata.cloud";

// Web3.Storage alternative - can be used instead of Pinata
const WEB3_STORAGE_TOKEN = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN || "";

// Nft.storage alternative - free IPFS pinning service
const NFT_STORAGE_TOKEN = process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN || "";

/**
 * Upload image to IPFS using Pinata
 * @param file - The image file to upload
 * @returns IPFS hash and URL
 */
export async function uploadImageToPinata(
  file: File
): Promise<{ hash: string; url: string }> {
  if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    throw new Error(
      "Pinata API credentials not configured. Set NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_API_SECRET"
    );
  }

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
    const options = JSON.stringify({
      cidVersion: 1,
    });
    formData.append("pinataOptions", options);

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    const ipfsHash = data.IpfsHash;
    const ipfsUrl = `ipfs://${ipfsHash}`;

    return {
      hash: ipfsHash,
      url: ipfsUrl, // Use the IPFS hash in contract, gateway URL for display
    };
  } catch (error) {
    console.error("Error uploading image to Pinata:", error);
    throw error;
  }
}

/**
 * Upload image to IPFS using NFT.Storage (free alternative)
 * @param file - The image file to upload
 * @returns IPFS hash and URL
 */
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

/**
 * Upload image to IPFS using Web3.Storage
 * @param file - The image file to upload
 * @returns IPFS hash and URL
 */
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

/**
 * Auto-select and upload image to the best available IPFS service
 * Priority: Pinata > NFT.Storage > Web3.Storage
 * @param file - The image file to upload
 * @returns IPFS hash and gateway URL
 */
export async function uploadImageToIPFS(
  file: File
): Promise<{ hash: string; url: string; gatewayUrl: string }> {
  let result = null;
  let error = null;

  // Try Pinata first
  if (PINATA_API_KEY && PINATA_API_SECRET) {
    try {
      const pinataResult = await uploadImageToPinata(file);
      result = {
        ...pinataResult,
        gatewayUrl: `${PINATA_GATEWAY}/ipfs/${pinataResult.hash}`,
      };
      return result;
    } catch (err) {
      console.warn("Pinata upload failed, trying NFT.Storage:", err);
      error = err;
    }
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

  // If all services failed
  if (!result) {
    throw new Error(
      error
        ? `All IPFS services failed. Last error: ${error}`
        : "No IPFS service configured. Please set environment variables for Pinata, NFT.Storage, or Web3.Storage"
    );
  }

  return result;
}

/**
 * Get a gateway URL for an IPFS hash
 * @param ipfsHash - The IPFS hash (either with or without ipfs:// prefix)
 * @param gateway - Optional gateway to use (defaults to Pinata)
 * @returns Full HTTP gateway URL
 */
export function getIPFSGatewayUrl(
  ipfsHash: string,
  gateway: "pinata" | "nft.storage" | "w3s" = "pinata"
): string {
  // Remove ipfs:// prefix if present
  const hash = ipfsHash.replace(/^ipfs:\/\//, "");

  switch (gateway) {
    case "nft.storage":
      return `https://nft.storage/${hash}`;
    case "w3s":
      return `https://w3s.link/ipfs/${hash}`;
    case "pinata":
    default:
      return `${PINATA_GATEWAY}/ipfs/${hash}`;
  }
}

/**
 * Validate image file before upload
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB (default: 10)
 * @returns true if valid, throws error if invalid
 */
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
