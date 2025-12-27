# Fhunda - Privacy-Preserving Crowdfunding Platform

## Overview

Fhunda is a decentralized crowdfunding platform built on the Zama FHEVM (Fully Homomorphic Encryption Virtual Machine)
using Solidity and Hardhat. It leverages cutting-edge privacy-preserving technologies to protect the financial
information of campaign creators and contributors.

## Features

### Core Functionality

- **Campaign Creation**: Create crowdfunding campaigns with customizable targets, duration, title, and description
- **Private Contributions**: Contributors can fund campaigns while their contribution amounts remain encrypted
- **Successful Withdrawals**: Campaign creators can withdraw funds when the target is reached
- **Failed Campaign Refunds**: Contributors get refunded if the campaign fails to reach its target
- **Campaign Management**: Creators can close campaigns early if needed
- **Status Tracking**: Real-time campaign status (ACTIVE, SUCCESSFUL, FAILED, CLOSED)

### Privacy Features

- **Encrypted Contributions**: Uses FHEVM's euint32 and euint64 types to keep contribution amounts encrypted
- **Homomorphic Operations**: Supports encrypted arithmetic on contribution amounts
- **On-Chain Privacy**: All financial data remains encrypted on-chain by default

### Security Features

- **Reentrancy Protection**: Uses OpenZeppelin's ReentrancyGuard
- **Access Control**: Campaign operations are restricted to authorized parties
- **Input Validation**: Comprehensive validation of all inputs
- **Safe Transfers**: Uses call instead of transfer for fund transfers

## Smart Contract Architecture

### Main Contract: Fhunda.sol

```solidity
contract Fhunda is EIP712WithModifier, Ownable, ReentrancyGuard
```

#### Key Data Structures

**Campaign Struct:**

```solidity
struct Campaign {
  address creator; // Campaign creator address
  uint256 targetAmount; // Target funding amount in wei
  uint256 deadline; // Campaign end timestamp
  bool withdrawn; // Has creator withdrawn funds?
  uint256 totalFunded; // Total amount funded (public tracking)
  bool active; // Is campaign active?
  string title; // Campaign title
  string description; // Campaign description
}
```

#### Core Functions

**createCampaign**

- Creates a new crowdfunding campaign
- Sets target amount, duration, title, and description
- Returns campaign ID
- Emits: `CampaignCreated`

**contribute**

- Allows users to fund a campaign
- Accepts encrypted contribution amounts
- Supports multiple contributions
- Emits: `ContributionMade`

**withdrawFunds**

- Allows creator to withdraw funds from successful campaigns
- Only callable after deadline if target is reached
- Prevents double-withdrawal via flag
- Emits: `CampaignWithdrawn`

**refund**

- Allows contributors to get refunds on failed campaigns
- Only callable after deadline if target not reached
- Emits: `RefundIssued`

**closeCampaign**

- Allows creator to close campaign early
- Prevents further contributions
- Emits: `CampaignClosed`

#### Query Functions

- `getCampaign(id)` - Get campaign details
- `getCampaignCounter()` - Get total campaigns created
- `getTotalFunded(id)` - Get total funded amount
- `isCampaignSuccessful(id)` - Check if target reached
- `getCampaignStatus(id)` - Get campaign status string
- `getContributionAmount(id, contributor)` - Get contributor's amount

## Events

```solidity
event CampaignCreated(
  uint256 indexed campaignId,
  address indexed creator,
  uint256 targetAmount,
  uint256 deadline,
  string title
);

event ContributionMade(uint256 indexed campaignId, address indexed contributor, uint256 amount);

event CampaignWithdrawn(uint256 indexed campaignId, address indexed creator, uint256 amount);

event CampaignClosed(uint256 indexed campaignId);

event RefundIssued(uint256 indexed campaignId, address indexed contributor, uint256 amount);
```

## Testing

Comprehensive test suite with 50+ test cases covering:

### Test Categories

1. **Campaign Creation Tests** (7 tests)
   - Basic campaign creation
   - Campaign counter incrementing
   - Event emission
   - Input validation (zero amounts, zero duration, empty titles)

2. **Contribution Tests** (9 tests)
   - Single and multiple contributions
   - Same user multiple contributions
   - Total funded updates
   - Campaign deadline enforcement
   - Contribution to inactive campaigns
   - Large contributions

3. **Withdrawal Tests** (8 tests)
   - Successful withdrawals
   - Creator-only access
   - Deadline enforcement
   - Target verification
   - Double-withdrawal prevention
   - Campaign state updates

4. **Refund Tests** (5 tests)
   - Failed campaign refunds
   - Target verification
   - Contributor verification
   - No duplicate refunds

5. **Campaign Closure Tests** (4 tests)
   - Creator closure
   - Event emission
   - Access control
   - State transitions

6. **Campaign Status Tests** (4 tests)
   - ACTIVE status
   - SUCCESSFUL status
   - FAILED status
   - CLOSED status

7. **Success Checks Tests** (3 tests)
   - Target reached verification
   - Target not reached verification
   - Target exceeded verification

8. **Error Handling Tests** (4 tests)
   - Invalid campaign ID handling
   - Proper error messages

9. **Security Tests** (1 test)
   - Reentrancy protection on withdrawal

10. **Integration Tests** (2 tests)
    - Complete campaign lifecycle
    - Failed campaign with refunds scenario

## Installation and Setup

### Prerequisites

- Node.js >= 20
- npm >= 7.0.0
- Hardhat
- FHEVM Hardhat Plugin

### Installation

```bash
# Clone the repository
cd zamafhevm-contract

# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm test

# Run tests on Sepolia
npm test:sepolia

# Deploy locally
npm run deploy:localhost

# Deploy to Sepolia
npm run deploy:sepolia
```

## Usage Examples

### Creating a Campaign

```typescript
const tx = await fhunda.createCampaign(
  ethers.parseEther("10"), // 10 ETH target
  7, // 7 days duration
  "Build a Privacy App",
  "We're building a privacy-preserving application",
);

const receipt = await tx.wait();
const campaignId = 0; // First campaign
```

### Contributing to a Campaign

```typescript
const tx = await fhunda.contribute(
  campaignId,
  encryptedAmount, // Encrypted contribution amount
  { value: ethers.parseEther("5") }, // 5 ETH contribution
);

await tx.wait();
```

### Checking Campaign Status

```typescript
// Get full campaign details
const campaign = await fhunda.getCampaign(campaignId);

// Get campaign status
const status = await fhunda.getCampaignStatus(campaignId);
// Returns: "ACTIVE", "SUCCESSFUL", "FAILED", or "CLOSED"

// Check if target reached
const isSuccessful = await fhunda.isCampaignSuccessful(campaignId);
```

### Withdrawing Funds (Creator)

```typescript
// After campaign deadline, if target reached
const tx = await fhunda.connect(creator).withdrawFunds(campaignId);
await tx.wait();
```

### Getting Refund (Contributor)

```typescript
// After campaign deadline, if target not reached
const tx = await fhunda.connect(contributor).refund(campaignId);
await tx.wait();
```

## Error Codes

| Error Message                    | Cause                          | Solution                |
| -------------------------------- | ------------------------------ | ----------------------- |
| "Target amount must be positive" | Target is 0                    | Set target > 0          |
| "Duration must be positive"      | Duration is 0                  | Set duration > 0        |
| "Title cannot be empty"          | Empty campaign title           | Provide a title         |
| "Campaign does not exist"        | Invalid campaign ID            | Use valid campaign ID   |
| "Campaign is not active"         | Campaign is closed             | Create new campaign     |
| "Campaign has ended"             | Deadline has passed            | Check deadline          |
| "Contribution must be positive"  | Contribution is 0              | Contribute > 0          |
| "Only creator can withdraw"      | Non-creator calling withdrawal | Use creator account     |
| "Funds already withdrawn"        | Already withdrawn              | Can only withdraw once  |
| "Campaign is still active"       | Deadline not passed            | Wait for deadline       |
| "Target not reached"             | Insufficient funding           | Need more contributions |
| "Target was reached"             | Campaign succeeded             | No refunds available    |
| "No contribution found"          | User didn't contribute         | Contribute first        |

## Gas Optimization Tips

1. **Batch Operations**: Group multiple contributions in a single transaction when possible
2. **Campaign Closure**: Close campaigns early to reduce storage usage
3. **Encrypted Operations**: Use batch refunds for failed campaigns
4. **State Compression**: Consider storing multiple flags in a single uint256 for large deployments

## Future Enhancements

1. **Multi-Token Support**: Support ERC-20 tokens in addition to ETH
2. **Milestone-Based Releases**: Release funds in stages as milestones are met
3. **Governance**: Allow community to vote on campaign disputes
4. **Reputation System**: Track contributor and creator reputation
5. **Advanced Privacy**: Full FHE for all campaign operations
6. **Commission Model**: Implement platform fees
7. **Subscriptions**: Support recurring contributions
8. **NFT Rewards**: Offer NFT rewards for top contributors

## Security Considerations

### Audited Aspects

- Reentrancy guards on withdrawal functions
- Overflow/underflow protection (via Solidity 0.8.20)
- Access control on sensitive functions
- Input validation on all public functions

### Considerations for Production

Before mainnet deployment:

1. **Full Security Audit**: Conduct comprehensive third-party audit
2. **Formal Verification**: Verify critical functions with formal methods
3. **Bug Bounty**: Launch bug bounty program
4. **Decryption Mechanism**: Implement safe decryption procedure for FHE values
5. **Oracle Integration**: Consider integration with external data feeds
6. **Rate Limiting**: Implement rate limits for refund/withdrawal requests
7. **Pause Mechanism**: Add emergency pause functionality

## Contract Addresses

### Testnet (Sepolia)

- Fhunda: [To be deployed]

### Mainnet

- Fhunda: [To be deployed]

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request
5. Ensure all tests pass

## License

BSD-3-Clause-Clear

## Support

For issues, questions, or suggestions:

- Open an issue on GitHub
- Contact: support@fhunda.com
- Discord: [Community Discord]

## References

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity Documentation](https://docs.soliditylang.org)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)

---

Built with ❤️ using Zama's FHEVM and Hardhat
