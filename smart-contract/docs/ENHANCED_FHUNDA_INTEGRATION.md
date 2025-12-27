# FhundaEnhanced - Frontend Integration Guide

## Overview

FhundaEnhanced provides comprehensive campaign management functionality while maintaining FHE privacy guarantees. This guide covers how to integrate the enhanced features into your frontend application.

## Key Features

### Campaign Management
- **Create Campaigns**: With metadata support (IPFS hashes, campaign descriptions)
- **Query Campaigns**: Filter by status, creator, or retrieve all campaigns
- **Real-time Updates**: Track campaign progress and status changes
- **Platform Statistics**: View aggregate funding across the platform

### Privacy Guarantees
- **Individual Contributions**: Always encrypted, never publicly visible
- **Aggregate Data**: Publicly accessible totals and statistics
- **Creator Access**: Campaign creators can decrypt their campaign data
- **User Data**: Users can only access their own contribution data

## Installation and Setup

```bash
# Install required dependencies
npm install @zama-fhe/relayer-sdk ethers

# Initialize the FHEVM instance
import { initSDK, createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk';

const config = new SepoliaConfig();
const fhevm = await initSDK(config);
const instance = await createInstance(config);
```

## Campaign Management Functions

### Creating a Campaign

```typescript
// Encrypt the target amount
const targetAmount = 1000n * 10n ** 6n; // 1000 tokens
const encryptedTarget = await instance.encrypt64(Number(targetAmount));

// Create campaign with metadata
const tx = await fhundaEnhanced.createCampaign(
  encryptedTarget.handle,
  encryptedTarget.inputProof,
  7, // duration in days
  "ipfs://QmCampaignMetadataHash123" // IPFS metadata
);

const receipt = await tx.wait();
console.log(`Campaign created with ID: ${receipt.events?.find(e => e.event === 'CampaignCreated')?.args?.campaignId}`);
```

### Querying Campaigns

```typescript
// Get all campaigns
const allCampaignIds = await fhundaEnhanced.getAllCampaigns();

// Get only active campaigns
const activeCampaignIds = await fhundaEnhanced.getAllActiveCampaigns();

// Get campaigns by creator
const creatorCampaignIds = await fhundaEnhanced.getCampaignsByWallet(creatorAddress);

// Get specific campaign details
const [creator, deadline, status, withdrawn, creationDate, metadata] = 
  await fhundaEnhanced.getCampaignById(campaignId);

// Check if campaign is successful
const isSuccessful = await fhundaEnhanced.isCampaignSuccessful(campaignId);
```

### Making Contributions

```typescript
// Encrypt campaign ID and contribution amount
const campaignId = 0;
const contributionAmount = 500n * 10n ** 6n; // 500 tokens

const encryptedCampaignId = await instance.encrypt32(campaignId);
const encryptedAmount = await instance.encrypt64(Number(contributionAmount));

// Make contribution
const tx = await fhundaEnhanced.contribute(
  encryptedCampaignId.handle,
  encryptedAmount.handle,
  encryptedCampaignId.inputProof,
  encryptedAmount.inputProof
);

await tx.wait();
```

### Withdrawing Funds

```typescript
// Only campaign creator can withdraw after deadline
const tx = await fhundaEnhanced.withdraw(campaignId);
await tx.wait();
```

## Decryption and Data Access

### Public Decryption (Aggregate Data)

```typescript
// Decrypt platform totals (public data)
const platformTotalHandle = await fhundaEnhanced.getTotalPlatformRaised();
const platformTotal = await instance.publicDecrypt([platformTotalHandle]);

// Decrypt campaign totals (public aggregate data)
const campaignTotalHandle = await fhundaEnhanced.getEncryptedCampaignTotal(campaignId);
const campaignTotal = await instance.publicDecrypt([campaignTotalHandle]);

console.log(`Platform total raised: ${platformTotal.clearValues[platformTotalHandle]} tokens`);
console.log(`Campaign total raised: ${campaignTotal.clearValues[campaignTotalHandle]} tokens`);
```

### User Decryption (Private Data)

```typescript
// Get user's contribution to a specific campaign
const contributionHandle = await fhundaEnhanced.getEncryptedContribution(userAddress, campaignId);

// User decrypts their own contribution
const userContribution = await instance.userDecrypt([contributionHandle], userPublicKey);

console.log(`Your contribution: ${userContribution.clearValues[contributionHandle]} tokens`);
```

### Creator Access (Campaign Data)

```typescript
// Campaign creator can decrypt their campaign data
const campaignTargetHandle = await fhundaEnhanced.getEncryptedCampaignTarget(campaignId);
const campaignTotalHandle = await fhundaEnhanced.getEncryptedCampaignTotal(campaignId);

// Creator decrypts their campaign data
const campaignData = await instance.userDecrypt(
  [campaignTargetHandle, campaignTotalHandle], 
  creatorPublicKey
);

console.log(`Campaign target: ${campaignData.clearValues[campaignTargetHandle]} tokens`);
console.log(`Campaign total: ${campaignData.clearValues[campaignTotalHandle]} tokens`);
```

## Event Handling

### Listening to Campaign Events

```typescript
// Listen for campaign creation
fhundaEnhanced.on("CampaignCreated", (campaignId, creator, deadline) => {
  console.log(`New campaign ${campaignId} created by ${creator}`);
  updateCampaignList();
});

// Listen for contributions
fhundaEnhanced.on("ContributionMade", (campaignId, contributor, encryptedAmount) => {
  console.log(`Contribution made to campaign ${campaignId}`);
  updateCampaignProgress(campaignId);
});

// Listen for campaign completion
fhundaEnhanced.on("CampaignCompleted", (campaignId, successful) => {
  console.log(`Campaign ${campaignId} completed: ${successful ? 'Successful' : 'Failed'}`);
  updateCampaignStatus(campaignId);
});

// Listen for withdrawals
fhundaEnhanced.on("WithdrawalMade", (campaignId, creator, encryptedAmount) => {
  console.log(`Withdrawal made from campaign ${campaignId}`);
  updateCampaignStatus(campaignId);
});
```

## Platform Statistics

```typescript
// Get platform-wide statistics
const totalCampaigns = await fhundaEnhanced.getTotalCampaignCount();
const successfulCampaigns = await fhundaEnhanced.getTotalSuccessfulCampaigns();
const platformTotalHandle = await fhundaEnhanced.getTotalPlatformRaised();

// Decrypt platform total
const platformStats = await instance.publicDecrypt([platformTotalHandle]);

console.log(`Total campaigns: ${totalCampaigns}`);
console.log(`Successful campaigns: ${successfulCampaigns}`);
console.log(`Total platform funding: ${platformStats.clearValues[platformTotalHandle]} tokens`);
```

## Campaign Status Management

```typescript
// Check campaign status
const isActive = await fhundaEnhanced.isCampaignActive(campaignId);
const hasEnded = await fhundaEnhanced.hasCampaignEnded(campaignId);
const isSuccessful = await fhundaEnhanced.isCampaignSuccessful(campaignId);

// Get campaign metadata
const metadata = await fhundaEnhanced.getCampaignMetadata(campaignId);
const creator = await fhundaEnhanced.getCampaignCreator(campaignId);
const deadline = await fhundaEnhanced.getCampaignDeadline(campaignId);

console.log(`Campaign ${campaignId}:`);
console.log(`- Creator: ${creator}`);
console.log(`- Status: ${isActive ? 'Active' : hasEnded ? 'Ended' : 'Inactive'}`);
console.log(`- Successful: ${isSuccessful}`);
console.log(`- Deadline: ${new Date(deadline * 1000).toLocaleString()}`);
console.log(`- Metadata: ${metadata}`);
```

## Error Handling

```typescript
try {
  const tx = await fhundaEnhanced.createCampaign(
    encryptedTarget.handle,
    encryptedTarget.inputProof,
    duration,
    metadata
  );
  await tx.wait();
} catch (error) {
  if (error.message.includes("Invalid duration")) {
    console.error("Campaign duration must be greater than 0");
  } else if (error.message.includes("Metadata required")) {
    console.error("Campaign metadata is required");
  } else {
    console.error("Campaign creation failed:", error.message);
  }
}

// Contribution error handling
try {
  const tx = await fhundaEnhanced.contribute(
    encryptedCampaignId.handle,
    encryptedAmount.handle,
    encryptedCampaignId.inputProof,
    encryptedAmount.inputProof
  );
  await tx.wait();
} catch (error) {
  if (error.message.includes("Token contract is not approved operator")) {
    console.error("Please approve the FhundaEnhanced contract to transfer your tokens");
  } else if (error.message.includes("Campaign not found or inactive")) {
    console.error("Campaign not found or no longer active");
  } else {
    console.error("Contribution failed:", error.message);
  }
}
```

## Best Practices

### 1. Campaign Metadata
- Use IPFS to store campaign images, descriptions, and detailed information
- Include campaign title, description, image URLs, and social links in metadata
- Ensure metadata is immutable by storing it on IPFS or similar decentralized storage

### 2. User Experience
- Show loading states while encrypting and sending transactions
- Provide clear feedback when campaigns are created, funded, or completed
- Implement real-time updates using WebSocket connections to the blockchain

### 3. Privacy Considerations
- Never attempt to decrypt other users' contributions
- Only decrypt data that users are authorized to access
- Use appropriate decryption methods (public vs user decryption)

### 4. Gas Optimization
- Batch multiple operations when possible
- Use view functions for data queries to avoid gas costs
- Consider gas costs when designing campaign funding workflows

### 5. Security
- Always validate user inputs before encrypting
- Implement proper access controls for sensitive operations
- Use the relayer SDK for proper encryption and decryption workflows

## Example Integration

```typescript
import { ethers } from "ethers";
import { initSDK, createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk';

class FhundaEnhancedClient {
  constructor(provider, contractAddress) {
    this.provider = provider;
    this.contract = new ethers.Contract(contractAddress, FhundaEnhancedABI, provider.getSigner());
    this.fhevm = null;
    this.instance = null;
  }

  async initialize() {
    const config = new SepoliaConfig();
    this.fhevm = await initSDK(config);
    this.instance = await createInstance(config);
  }

  async createCampaign(targetAmount, durationDays, metadata) {
    const encryptedTarget = await this.instance.encrypt64(Number(targetAmount));
    
    const tx = await this.contract.createCampaign(
      encryptedTarget.handle,
      encryptedTarget.inputProof,
      durationDays,
      metadata
    );
    
    const receipt = await tx.wait();
    return receipt.events?.find(e => e.event === 'CampaignCreated')?.args?.campaignId;
  }

  async contribute(campaignId, amount) {
    const encryptedCampaignId = await this.instance.encrypt32(campaignId);
    const encryptedAmount = await this.instance.encrypt64(Number(amount));
    
    const tx = await this.contract.contribute(
      encryptedCampaignId.handle,
      encryptedAmount.handle,
      encryptedCampaignId.inputProof,
      encryptedAmount.inputProof
    );
    
    return await tx.wait();
  }

  async getCampaignProgress(campaignId) {
    const totalHandle = await this.contract.getEncryptedCampaignTotal(campaignId);
    const targetHandle = await this.contract.getEncryptedCampaignTarget(campaignId);
    
    const result = await this.instance.publicDecrypt([totalHandle, targetHandle]);
    
    return {
      raised: result.clearValues[totalHandle],
      target: result.clearValues[targetHandle],
      percentage: (result.clearValues[totalHandle] / result.clearValues[targetHandle]) * 100
    };
  }
}
```

This integration guide provides a comprehensive foundation for building applications with FhundaEnhanced while maintaining the privacy guarantees of the FHE encryption system.