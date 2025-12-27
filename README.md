# Fhunda: Privacy-Preserving Crowdfunding

Fhunda is a next-generation crowdfunding platform built on the **Zama fhEVM**, leveraging **Fully Homomorphic Encryption (FHE)** to ensure absolute privacy for both creators and contributors. Unlike traditional platforms where contribution amounts and progress are public, Fhunda keeps financial data encrypted on-chain while still allowing for verifiable progress tracking and secure fund management.

---

## 🌟 Key Features

| Feature                       | Description                                                                                                                                 |
| :---------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ |
| **Encrypted Contributions**   | All contribution amounts are encrypted using FHE, meaning only the contributor and the campaign creator can see the exact amount donated.   |
| **Private Funding Targets**   | Campaign targets can be kept private, preventing external front-running or social engineering based on funding progress.                    |
| **Stealth Progress Tracking** | Progress bars reflect the aggregate funding status without revealing individual contribution sizes or the exact total raised to the public. |
| **FHE-USDT Support**          | Integrated with confidential ERC-20 tokens (FHE-USDT) for private value transfer.                                                           |
| **Decentralized & Secure**    | Built on Sepolia Testnet with Zama's privacy-preserving smart contract technology.                                                          |

---

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

### Campaign Lifecycle

```
1. Creator creates campaign
   ↓
2. Contributors fund with encrypted amounts
   ↓
3. Deadline passes
   ↓
4. If target reached → Creator withdraws funds
   If target NOT reached → Contributors get refunds
```

## 🛠 Tech Stack

### Frontend (`/app`)

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Web3**: RainbowKit, Wagmi, Ethers.js v6
- **Privacy**: Zama Relayer SDK (for user-side decryption)

### Blockchain (`/smart-contract`)

- **Language**: Solidity (0.8.27)
- **Framework**: Hardhat
- **Privacy Engine**: Zama fhEVM (FHE-powered Virtual Machine)
- **Token Standard**: ERC-7984 (Encrypted ERC-20)

---

## 📁 Project Structure

```text
fhunda/
├── app/                # Next.js Frontend
│   ├── src/            # Source code
│   └── public/         # Static assets
├── smart-contract/     # Hardhat Smart Contract Project
│   ├── contracts/      # Solidity contracts
│   ├── deploy/         # Deployment scripts
│   └── test/           # Unit and integration tests
└── README.md           # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) or `npm`
- A Web3 wallet (e.g., MetaMask) configured for **Sepolia Testnet**.

### 1. Smart Contract Setup

Navigate to the `smart-contract` directory:

```bash
cd smart-contract
npm install
```

Create your configuration:

```bash
cp .env.example .env
```

_Fill in your `ALCHEMY_API_KEY` and `MNEMONIC` (or private key) in the `.env` file._

Compile and Test:

```bash
npx hardhat compile
npx hardhat test
```

### 2. Frontend Setup

Navigate to the `app` directory:

```bash
cd ../app
npm install
```

Create your configuration:

```bash
cp .env.example .env.local
```

_Ensure `NEXT_PUBLIC_FHUNDA_CONTRACT_ADDRESS` matches your deployed contract or the testnet deployment._

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 🔐 Privacy & FHE

Fhunda uses **ciphertext types** (`euint64`) to store financial data. Operations like adding contributions or checking targets are performed directly on encrypted data within the fhEVM. Users utilize the **Zama Relayer SDK** to authorize and perform "decryption requests" to view their own balances or campaign progress in the browser without ever exposing the raw data to the public blockchain.

---

## 📄 License

This project is licensed under the MIT License.
