/**
 * Smart Contract ABIs
 * Extracted from verified contract deployments
 */

// Fhunda Contract ABI - Complete verified from contract deployment
export const FHUNDA_ABI = [
  {
    inputs: [
      { internalType: "address", name: "tokenAddress", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
  { inputs: [], name: "ZamaProtocolUnsupported", type: "error" },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "campaignId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "bool",
        name: "successful",
        type: "bool",
      },
    ],
    name: "CampaignCompleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "campaignId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "CampaignCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "campaignId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "enum Fhunda.CampaignStatus",
        name: "status",
        type: "uint8",
      },
    ],
    name: "CampaignStatusUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "campaignId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "contributor",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "encryptedAmount",
        type: "bytes32",
      },
    ],
    name: "ContributionMade",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "campaignId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "encryptedAmount",
        type: "bytes32",
      },
    ],
    name: "WithdrawalMade",
    type: "event",
  },
  {
    inputs: [],
    name: "campaignCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "confidentialProtocolId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "externalEuint32",
        name: "encryptedCampaignId",
        type: "bytes32",
      },
      {
        internalType: "externalEuint64",
        name: "encryptedAmount",
        type: "bytes32",
      },
      { internalType: "bytes", name: "proofCampaignId", type: "bytes" },
      { internalType: "bytes", name: "proofAmount", type: "bytes" },
    ],
    name: "contribute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "externalEuint64",
        name: "encryptedTarget",
        type: "bytes32",
      },
      { internalType: "bytes", name: "proof", type: "bytes" },
      { internalType: "uint256", name: "durationInDays", type: "uint256" },
      { internalType: "string", name: "metadata", type: "string" },
    ],
    name: "createCampaign",
    outputs: [{ internalType: "uint256", name: "campaignId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllActiveCampaigns",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllCampaigns",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "campaignId", type: "uint256" }],
    name: "getCampaignById",
    outputs: [
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "uint256", name: "deadline", type: "uint256" },
      {
        internalType: "enum Fhunda.CampaignStatus",
        name: "status",
        type: "uint8",
      },
      { internalType: "bool", name: "withdrawn", type: "bool" },
      { internalType: "uint256", name: "creationDate", type: "uint256" },
      { internalType: "string", name: "metadata", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "campaignId", type: "uint256" }],
    name: "getCampaignCreator",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "campaignId", type: "uint256" }],
    name: "getCampaignDeadline",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "campaignId", type: "uint256" }],
    name: "getCampaignMetadata",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "wallet", type: "address" }],
    name: "getCampaignsByWallet",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "getEncryptedCampaignTarget",
    outputs: [{ internalType: "euint64", name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "index", type: "uint256" }],
    name: "getEncryptedCampaignTotal",
    outputs: [{ internalType: "euint64", name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "contributor", type: "address" },
      { internalType: "uint256", name: "index", type: "uint256" },
    ],
    name: "getEncryptedContribution",
    outputs: [{ internalType: "euint64", name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalCampaignCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalPlatformRaised",
    outputs: [{ internalType: "euint64", name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalSuccessfulCampaigns",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "campaignId", type: "uint256" }],
    name: "hasCampaignEnded",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "campaignId", type: "uint256" }],
    name: "isCampaignActive",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "campaignId", type: "uint256" }],
    name: "isCampaignSuccessful",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "token",
    outputs: [{ internalType: "contract ERC7984", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "campaignId", type: "uint256" },
      {
        internalType: "enum Fhunda.CampaignStatus",
        name: "newStatus",
        type: "uint8",
      },
    ],
    name: "updateCampaignStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "campaignIndex", type: "uint256" },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// fheUSDT Token ABI (ERC7984 - Encrypted ERC20)
export const FHE_USDT_ABI = [
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "uint256", name: "requestId", type: "uint256" }],
    name: "ERC7984InvalidGatewayRequest",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "receiver", type: "address" }],
    name: "ERC7984InvalidReceiver",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "sender", type: "address" }],
    name: "ERC7984InvalidSender",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "caller", type: "address" }],
    name: "ERC7984UnauthorizedCaller",
    type: "error",
  },
  {
    inputs: [
      { internalType: "address", name: "holder", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "ERC7984UnauthorizedSpender",
    type: "error",
  },
  {
    inputs: [
      { internalType: "euint64", name: "amount", type: "bytes32" },
      { internalType: "address", name: "user", type: "address" },
    ],
    name: "ERC7984UnauthorizedUseOfEncryptedAmount",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "holder", type: "address" }],
    name: "ERC7984ZeroBalance",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidKMSSignatures",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [],
    name: "ZamaProtocolUnsupported",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "euint64",
        name: "encryptedAmount",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "requester",
        type: "address",
      },
    ],
    name: "AmountDiscloseRequested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "euint64",
        name: "encryptedAmount",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "uint64",
        name: "amount",
        type: "uint64",
      },
    ],
    name: "AmountDisclosed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "euint64",
        name: "amount",
        type: "bytes32",
      },
    ],
    name: "ConfidentialTransfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "holder",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint48",
        name: "until",
        type: "uint48",
      },
    ],
    name: "OperatorSet",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32[]",
        name: "handlesList",
        type: "bytes32[]",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "abiEncodedCleartexts",
        type: "bytes",
      },
    ],
    name: "PublicDecryptionVerified",
    type: "event",
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "confidentialBalanceOf",
    outputs: [{ internalType: "euint64", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      {
        internalType: "externalEuint64",
        name: "encryptedAmount",
        type: "bytes32",
      },
      { internalType: "bytes", name: "inputProof", type: "bytes" },
    ],
    name: "confidentialMint",
    outputs: [
      { internalType: "euint64", name: "transferred", type: "bytes32" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "confidentialProtocolId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "confidentialTotalSupply",
    outputs: [{ internalType: "euint64", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      {
        internalType: "externalEuint64",
        name: "encryptedAmount",
        type: "bytes32",
      },
      { internalType: "bytes", name: "inputProof", type: "bytes" },
    ],
    name: "confidentialTransfer",
    outputs: [{ internalType: "euint64", name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "euint64", name: "amount", type: "bytes32" },
    ],
    name: "confidentialTransfer",
    outputs: [{ internalType: "euint64", name: "", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "euint64", name: "amount", type: "bytes32" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "confidentialTransferAndCall",
    outputs: [
      { internalType: "euint64", name: "transferred", type: "bytes32" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      {
        internalType: "externalEuint64",
        name: "encryptedAmount",
        type: "bytes32",
      },
      { internalType: "bytes", name: "inputProof", type: "bytes" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "confidentialTransferAndCall",
    outputs: [
      { internalType: "euint64", name: "transferred", type: "bytes32" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      {
        internalType: "externalEuint64",
        name: "encryptedAmount",
        type: "bytes32",
      },
      { internalType: "bytes", name: "inputProof", type: "bytes" },
    ],
    name: "confidentialTransferFrom",
    outputs: [
      { internalType: "euint64", name: "transferred", type: "bytes32" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "euint64", name: "amount", type: "bytes32" },
    ],
    name: "confidentialTransferFrom",
    outputs: [
      { internalType: "euint64", name: "transferred", type: "bytes32" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      {
        internalType: "externalEuint64",
        name: "encryptedAmount",
        type: "bytes32",
      },
      { internalType: "bytes", name: "inputProof", type: "bytes" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "confidentialTransferFromAndCall",
    outputs: [
      { internalType: "euint64", name: "transferred", type: "bytes32" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "euint64", name: "amount", type: "bytes32" },
      { internalType: "bytes", name: "data", type: "bytes" },
    ],
    name: "confidentialTransferFromAndCall",
    outputs: [
      { internalType: "euint64", name: "transferred", type: "bytes32" },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "contractURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "euint64", name: "encryptedAmount", type: "bytes32" },
      { internalType: "uint64", name: "cleartextAmount", type: "uint64" },
      { internalType: "bytes", name: "decryptionProof", type: "bytes" },
    ],
    name: "discloseEncryptedAmount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "holder", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "isOperator",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint64", name: "amount", type: "uint64" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pendingOwner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "euint64", name: "encryptedAmount", type: "bytes32" },
    ],
    name: "requestDiscloseEncryptedAmount",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "operator", type: "address" },
      { internalType: "uint48", name: "until", type: "uint48" },
    ],
    name: "setOperator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
    name: "supportsInterface",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
