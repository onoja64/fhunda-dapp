# FhundaEnhanced - Privacy-Preserving Crowdfunding Platform

[![License](https://img.shields.io/badge/license-BSD--3--Clause--Clear-blue.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/solidity-^0.8.24-blue.svg)](https://solidity.readthedocs.io/)
[![FHEVM](https://img.shields.io/badge/FHEVM-Zama-green.svg)](https://docs.zama.org/protocol/)
[![Tests](https://img.shields.io/badge/tests-Comprehensive-brightgreen.svg)](#testing)

FhundaEnhanced is an advanced, fully private crowdfunding platform built on Zama's FHEVM technology. It provides comprehensive campaign management functionality while maintaining strict privacy guarantees for individual contributions through Fully Homomorphic Encryption (FHE).

## 🌟 Key Features

### 🔒 Privacy-First Architecture
- **Individual contributions** are always encrypted using FHE
- **Aggregate data** is publicly accessible for transparency
- **Creator access** is limited to their own campaigns
- **User privacy** is protected with zero-knowledge principles

### 📊 Comprehensive Campaign Management
- Create campaigns with rich metadata (IPFS support)
- Query campaigns by status, creator, or filter active ones
- Real-time campaign progress tracking
- Automatic success detection and status updates
- Platform-wide statistics and analytics

### 💰 Advanced Financial Operations
- ERC7984 confidential token integration
- Gas-optimized encrypted transfers
- Secure withdrawal mechanisms
- Multi-contributor campaign support
- Automated campaign lifecycle management

### 🎯 User Experience
- Client-side encryption and decryption
- Real-time event notifications
- Intuitive API for frontend integration
- Comprehensive error handling
- Mobile-optimized workflows

## 📁 Project Structure

```
├── contracts/
│   ├── FhundaEnhanced.sol          # Main enhanced contract
│   └── fheUSDT.sol                 # ERC7984 confidential token
├── test/
│   ├── FhundaEnhanced.ts           # Comprehensive test suite
│   └── Fhunda.ts                   # Original contract tests
├── deploy/
│   ├── FhundaEnhanced.ts           # Enhanced deployment script
│   └── 03_verify_FhundaEnhanced.ts # Verification script
├── docs/
│   ├── ENHANCED_FHUNDA_INTEGRATION.md  # Frontend integration guide
│   └── TECHNICAL_ARCHITECTURE.md   # Technical documentation
└── README_ENHANCED.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- Hardhat development environment
- Zama FHEVM SDK

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd fhunda-enhanced

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Sepolia
npx hardhat deploy --network sepolia
```

### Basic Usage

```typescript
import { initSDK, createInstance } from '@zama-fhe/relayer-sdk';

// Initialize FHEVM
const fhevm = await initSDK(config);
const instance = await createInstance(config);

// Create a campaign
const encryptedTarget = await instance.encrypt64(1000000); // 1M tokens
const tx = await fhundaEnhanced.createCampaign(
  encryptedTarget.handle,
  encryptedTarget.inputProof,
  7, // duration in days
  "ipfs://QmCampaignMetadataHash123"
);

// Make a contribution
const encryptedCampaignId = await instance.encrypt32(0);
const encryptedAmount = await instance.encrypt64(500000); // 500K tokens
await fhundaEnhanced.contribute(
  encryptedCampaignId.handle,
  encryptedAmount.handle,
  encryptedCampaignId.inputProof,
  encryptedAmount.inputProof
);
```

## 📋 API Reference

### Campaign Management

```typescript
// Create campaign
createCampaign(
  externalEuint64 encryptedTarget,
  bytes calldata proof,
  uint256 durationInDays,
  string calldata metadata
) returns (uint256 campaignId)

// Query campaigns
getAllCampaigns() returns (uint256[] memory)
getAllActiveCampaigns() returns (uint256[] memory)
getCampaignsByWallet(address wallet) returns (uint256[] memory)
getCampaignById(uint256 campaignId) returns (...)
isCampaignSuccessful(uint256 campaignId) returns (bool)
```

### Contributions

```typescript
// Make contribution
contribute(
  externalEuint32 encryptedCampaignId,
  externalEuint64 encryptedAmount,
  bytes calldata proofCampaignId,
  bytes calldata proofAmount
)

// Access contribution data
getEncryptedContribution(address contributor, uint256 index) returns (euint64)
getEncryptedCampaignTotal(uint256 index) returns (euint64)
getEncryptedCampaignTarget(uint256 index) returns (euint64)
```

### Withdrawals

```typescript
// Withdraw funds (creator only)
withdraw(uint256 campaignIndex)
```

### Platform Statistics

```typescript
// Get platform data
getTotalPlatformRaised() returns (euint64)
getTotalSuccessfulCampaigns() returns (uint256)
getTotalCampaignCount() returns (uint256)
```

## 🧪 Testing

The project includes comprehensive testing coverage:

```bash
# Run all tests
npx hardhat test

# Run specific test suite
npx hardhat test test/FhundaEnhanced.ts

# Run with coverage
npx hardhat coverage

# Run gas tests
REPORT_GAS=true npx hardhat test
```

### Test Categories

- **Campaign Creation & Management**: 15+ test cases
- **Contribution Processing**: 20+ test scenarios
- **Privacy Guarantees**: Comprehensive encryption testing
- **Financial Operations**: Withdrawal and security testing
- **Event Emission**: Complete event coverage
- **Edge Cases**: Error handling and validation

## 🔒 Privacy Guarantees

### Data Protection Matrix

| Data Type | Public | Creator | Contributor | Admin |
|-----------|--------|---------|-------------|-------|
| Campaign metadata | ✅ | ✅ | ✅ | ✅ |
| Individual contributions | ❌ | ❌ | ✅ | ❌ |
| Campaign totals | ✅* | ✅ | ✅ | ❌ |
| Platform statistics | ✅* | ✅ | ✅ | ✅ |

*Publicly decryptable aggregate data

### Security Features

- **FHE Encryption**: All sensitive data encrypted on-chain
- **Access Control**: Strict boundaries for data access
- **Input Validation**: Comprehensive validation for all inputs
- **Reentrancy Protection**: All state-changing functions protected
- **Operator Approval**: ERC7984 token integration for secure transfers

## 🏗️ Architecture

### Contract Hierarchy

```
ERC7984 (fheUSDT)
    ↓
FhundaEnhanced
    ├── Campaign Management
    ├── Contribution Processing
    ├── Withdrawal System
    └── Platform Statistics
```

### Key Components

1. **Campaign Storage**: Dynamic array with O(1) access
2. **Contribution Tracking**: User-campaign encrypted mapping
3. **Statistics Engine**: Real-time platform analytics
4. **Event System**: Comprehensive event emission
5. **Privacy Layer**: FHE encryption boundaries

## 📊 Performance

### Gas Costs (Estimated)

- **Campaign Creation**: ~200,000 gas
- **Contribution**: ~300,000 gas (varies with campaign count)
- **Withdrawal**: ~150,000 gas
- **Queries**: O(1) gas (view functions)

### Scalability

- **Campaigns**: Supports unlimited campaigns
- **Contributors**: No limit on contributor count
- **Contributions**: Efficient masked updates
- **Queries**: Optimized filtering and search

## 🚀 Deployment

### Network Support

- **Sepolia**: Testnet deployment ready
- **Mainnet**: Production deployment supported
- **Local**: Hardhat and Anvil networks

### Deployment Commands

```bash
# Deploy to Sepolia
npx hardhat deploy --network sepolia

# Verify contracts
npx hardhat deploy --network sepolia --tags verify

# Local deployment
npx hardhat deploy
```

### Environment Variables

```bash
# Required
MNEMONIC=your_wallet_mnemonic
ALCHEMY_API_KEY=your_alchemy_key
ETHERSCAN_API_KEY=your_etherscan_key

# Optional
REPORT_GAS=true  # Enable gas reporting
```

## 📚 Documentation

- **[Frontend Integration Guide](docs/ENHANCED_FHUNDA_INTEGRATION.md)**: Complete integration examples
- **[Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)**: Detailed technical documentation
- **[API Reference](docs/API_REFERENCE.md)**: Complete function documentation
- **[Security Analysis](docs/SECURITY_ANALYSIS.md)**: Privacy and security assessment

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Add comprehensive tests
4. Ensure all tests pass
5. Submit a pull request

### Development Guidelines

- Follow Solidity best practices
- Maintain test coverage above 90%
- Document all new functions
- Use meaningful variable names
- Add inline comments for complex logic

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Zama](https://zama.ai/) for FHEVM technology
- [OpenZeppelin](https://openzeppelin.com/) for secure contract patterns
- [Ethereum](https://ethereum.org/) community for infrastructure
- [Hardhat](https://hardhat.org/) for development tooling

## 📞 Support

- **Documentation**: Check our comprehensive guides
- **Issues**: Report bugs via GitHub issues
- **Discussions**: Join our community discussions
- **Security**: Report security issues privately

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Enhanced campaign management
- ✅ Comprehensive testing
- ✅ Documentation and integration guides

### Phase 2 (Q1 2024)
- [ ] Campaign categories and filtering
- [ ] Advanced metadata schemas
- [ ] Mobile-optimized interfaces
- [ ] Enhanced analytics dashboard

### Phase 3 (Q2 2024)
- [ ] Campaign延期机制
- [ ] Social features and sharing
- [ ] Advanced voting mechanisms
- [ ] Layer 2 integration

### Phase 4 (Q3 2024)
- [ ] Formal verification
- [ ] Governance features
- [ ] Cross-chain compatibility
- [ ] Advanced privacy features

---

**Built with ❤️ using FHEVM and Zama's privacy technology**

For more information, visit our [documentation](docs/) or join our [community](link-to-community).