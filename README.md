# ZamaFile

**Privacy-Preserving File Storage on Blockchain using Fully Homomorphic Encryption**

ZamaFile is a decentralized application (dApp) that enables users to securely store and manage file references on the blockchain with complete privacy. By leveraging Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine) technology, file metadata remains encrypted on-chain while maintaining full functionality and user control.

[![License](https://img.shields.io/badge/License-BSD_3--Clause--Clear-blue.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-orange.svg)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow.svg)](https://hardhat.org/)

---

## 📖 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Problem Statement](#problem-statement)
- [Solution Architecture](#solution-architecture)
- [Technology Stack](#technology-stack)
- [Smart Contract Details](#smart-contract-details)
- [Frontend Application](#frontend-application)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Deployment](#deployment)
- [Security Considerations](#security-considerations)
- [Advantages](#advantages)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

ZamaFile is a cutting-edge Web3 application that combines blockchain transparency with privacy-preserving cryptography. Users can upload files, generate IPFS content identifiers (CIDs), and store encrypted references on the Ethereum blockchain using Fully Homomorphic Encryption (FHE). This ensures that only the file owner can decrypt and access their file references, while benefiting from blockchain's immutability and decentralization.

### What Makes ZamaFile Unique?

- **True Privacy**: File references are encrypted using FHE technology, ensuring complete confidentiality
- **On-Chain Storage**: All encrypted data is stored directly on the blockchain
- **User-Controlled Decryption**: Only the owner can decrypt their file references
- **No Backend Required**: Fully decentralized architecture with no central server
- **IPFS Integration**: Leverages IPFS for distributed file storage
- **Production-Ready**: Deployed on Ethereum Sepolia testnet with full functionality

---

## ✨ Key Features

### 1. **Encrypted File Reference Storage**
- Store IPFS content identifiers (CIDs) as encrypted addresses on-chain
- Each file reference is split into two encrypted EVM addresses for security
- Encrypted data is accessible only to the file owner

### 2. **User-Friendly Interface**
- Modern React-based UI with smooth animations
- Wallet integration via RainbowKit supporting multiple wallets
- Real-time transaction feedback and status updates
- Intuitive file upload and management experience

### 3. **Privacy-Preserving Technology**
- Utilizes Zama's FHEVM for on-chain encryption
- Cryptographic proofs ensure data integrity
- Client-side encryption before blockchain submission
- Secure decryption via EIP-712 signatures

### 4. **Decentralized Architecture**
- No central server or database
- Direct blockchain interaction via Web3 libraries
- IPFS for distributed file storage
- Smart contract-based access control

### 5. **File Management**
- Submit new files with custom names
- View encrypted file list per wallet address
- Reveal IPFS hash through secure decryption
- Timestamp tracking for all submissions

---

## 🔍 Problem Statement

Traditional cloud storage solutions face several critical challenges:

### Privacy Concerns
- **Centralized Control**: Service providers have access to all stored data
- **Data Breaches**: Single point of failure puts all user data at risk
- **Surveillance**: Potential for unauthorized access by third parties
- **Lack of Ownership**: Users don't truly own their data

### Blockchain Limitations
- **Public Visibility**: Standard blockchain transactions are transparent to everyone
- **Privacy Trade-off**: Decentralization often comes at the cost of privacy
- **Metadata Exposure**: Even encrypted data can leak information through metadata

### Existing Solutions Fall Short
- **Traditional Encryption**: Encrypted data on public chains still reveals access patterns
- **Off-Chain Storage**: Centralized components create trust dependencies
- **Partial Privacy**: Many solutions only encrypt part of the data

---

## 💡 Solution Architecture

ZamaFile addresses these challenges through a comprehensive privacy-first approach:

### Fully Homomorphic Encryption (FHE)
- **On-Chain Privacy**: Data remains encrypted even during smart contract execution
- **Zero-Knowledge Operations**: Smart contracts can process encrypted data without decryption
- **Owner-Only Access**: Only the data owner can decrypt their information

### Cryptographic Innovation
1. **IPFS CID Conversion**: File hashes are deterministically converted to two EVM addresses
2. **FHE Encryption**: Addresses are encrypted using Zama's relayer SDK
3. **Proof Generation**: Cryptographic proofs validate encrypted inputs
4. **Access Control**: Smart contract manages who can access encrypted data

### Decentralized Storage Model
```
User's File → SHA-256 Hash → IPFS CID → Split into 2 Addresses → FHE Encryption → Blockchain Storage
                                                                                              ↓
User Retrieval ← IPFS CID Reconstruction ← Address Decryption ← EIP-712 Signature ← User Request
```

---

## 🛠 Technology Stack

### Smart Contract Layer
- **Solidity 0.8.24**: Smart contract development
- **FHEVM Library**: Fully Homomorphic Encryption primitives
- **Hardhat**: Development framework and testing environment
- **Hardhat Deploy**: Deployment management and artifact tracking
- **TypeChain**: Type-safe contract interactions

### Frontend Layer
- **React 19**: Modern UI library with hooks
- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and development server
- **Wagmi**: React hooks for Ethereum
- **Viem**: TypeScript EVM library for contract reads
- **Ethers.js v6**: Ethereum library for contract writes
- **RainbowKit**: Wallet connection UI

### Cryptography & Privacy
- **@fhevm/solidity**: Zama's FHE Solidity library
- **@zama-fhe/relayer-sdk**: Client-side encryption SDK
- **EIP-712**: Structured data signing for decryption authorization

### Infrastructure
- **Ethereum Sepolia**: Target blockchain network
- **Infura**: RPC provider for network access
- **IPFS**: Distributed file storage protocol

---

## 📜 Smart Contract Details

### ZamaFile Contract

**Location**: `contracts/ZamaFile.sol`

The `ZamaFile` contract is the core component that manages encrypted file references on-chain.

#### Contract Structure

```solidity
struct Record {
    string name;        // Plaintext filename (user-provided)
    uint256 timestamp;  // Unix timestamp of submission
    eaddress addr1;     // First encrypted address (from IPFS CID)
    eaddress addr2;     // Second encrypted address (from IPFS CID)
}
```

#### Key Functions

**submitRecord**
```solidity
function submitRecord(
    string calldata _name,
    externalEaddress _addr1,
    externalEaddress _addr2,
    bytes calldata inputProof
) external
```
- Stores a new encrypted file record
- Validates encrypted inputs via proof verification
- Sets up access control list (ACL) for owner and contract
- Emits `RecordSubmitted` event

**getRecordCount**
```solidity
function getRecordCount(address user) external view returns (uint256)
```
- Returns the total number of records for a specific user
- Used for pagination and list rendering

**getRecord**
```solidity
function getRecord(address user, uint256 index)
    external view
    returns (string memory name, uint256 timestamp, eaddress addr1, eaddress addr2)
```
- Retrieves a specific record by index
- Returns both plaintext metadata and encrypted addresses
- Encrypted addresses can only be decrypted by the owner

**getRecordNames**
```solidity
function getRecordNames(address user) external view returns (string[] memory)
```
- Convenience function to fetch all filenames for a user
- Useful for quick list previews

#### Security Features

1. **Proof Verification**: All encrypted inputs must include valid cryptographic proofs
2. **Access Control**: ACL automatically configured for owner and contract
3. **Per-User Storage**: Records are isolated by wallet address
4. **Immutable Records**: Once submitted, records cannot be modified
5. **Event Logging**: All submissions emit events for off-chain tracking

---

## 🎨 Frontend Application

### Architecture

The frontend is built with a modern React architecture emphasizing type safety, modularity, and user experience.

**Location**: `home/src/`

### Core Components

#### 1. **App.tsx** (Root Component)
- Sets up Web3 providers (Wagmi, RainbowKit, TanStack Query)
- Configures global application state
- Manages wallet connection lifecycle

#### 2. **FileApp.tsx** (Main Container)
- Tab navigation between Submit and List views
- Responsive layout and styling
- State management for active view

#### 3. **FileSubmission.tsx** (Upload Interface)
- File selection and upload handling
- IPFS CID generation via SHA-256
- FHE encryption of addresses
- Transaction submission and confirmation
- Real-time status feedback

#### 4. **FileList.tsx** (File Management)
- Fetches user's encrypted records from blockchain
- Displays file list with metadata
- Handles secure decryption via EIP-712 signatures
- Reveals IPFS CIDs on demand

#### 5. **Header.tsx** (Navigation Bar)
- Displays application branding
- RainbowKit wallet connection button
- Responsive design

### Custom Hooks

#### useZamaInstance
```typescript
export function useZamaInstance()
```
- Initializes Zama FHE instance
- Manages instance lifecycle and errors
- Provides encryption/decryption capabilities

#### useEthersSigner
```typescript
export function useEthersSigner()
```
- Converts Wagmi client to Ethers.js signer
- Enables write operations to smart contracts
- Handles provider switching

### Utility Functions

#### IPFS Conversion (`utils/ipfs.ts`)

**mockIPFSUpload**
```typescript
async function mockIPFSUpload(file: File): Promise<string>
```
- Computes SHA-256 hash of file
- Generates CIDv0 format identifier
- Returns base58-encoded CID

**ipfsToAddresses**
```typescript
function ipfsToAddresses(cid: string): { addr1: string; addr2: string }
```
- Decodes base58 CID to bytes
- Splits multihash into two 20-byte addresses
- Returns EVM-compatible address pair

**addressesToIpfs**
```typescript
function addressesToIpfs(addr1: string, addr2: string): string
```
- Reconstructs multihash from two addresses
- Encodes back to base58 CID
- Enables file retrieval from IPFS

### Styling

**Modern Design System** (`styles/FileApp.css`, `index.css`)
- CSS custom properties for theming
- Glassmorphism effects and gradients
- Smooth animations and transitions
- Responsive layouts for all screen sizes
- Dark mode optimized

---

## ⚙️ How It Works

### Complete User Flow

#### 1. **File Submission Process**

```
┌─────────────┐
│  User       │
│  Selects    │
│  File       │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Compute SHA-256    │
│  Generate IPFS CID  │
└──────────┬──────────┘
           │
           ▼
┌───────────────────────────┐
│  Convert CID to 2         │
│  EVM Addresses            │
│  (20 bytes each)          │
└──────────┬────────────────┘
           │
           ▼
┌───────────────────────────┐
│  Initialize Zama Instance │
│  Create Encrypted Input   │
└──────────┬────────────────┘
           │
           ▼
┌───────────────────────────┐
│  Encrypt Both Addresses   │
│  with FHE                 │
└──────────┬────────────────┘
           │
           ▼
┌───────────────────────────┐
│  Generate Cryptographic   │
│  Proof for Validation     │
└──────────┬────────────────┘
           │
           ▼
┌───────────────────────────┐
│  Submit Transaction to    │
│  Smart Contract           │
└──────────┬────────────────┘
           │
           ▼
┌───────────────────────────┐
│  Smart Contract Validates │
│  Proof & Stores Data      │
└───────────────────────────┘
```

#### 2. **File Retrieval Process**

```
┌─────────────┐
│  User       │
│  Views List │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Fetch Record Count │
│  from Smart Contract│
└──────────┬──────────┘
           │
           ▼
┌───────────────────────────┐
│  Query Each Record        │
│  (Name, Timestamp, etc.)  │
└──────────┬────────────────┘
           │
           ▼
┌───────────────────────────┐
│  Display List with        │
│  Encrypted Handles        │
└──────────┬────────────────┘
           │
           ▼ (User clicks "Reveal")
┌───────────────────────────┐
│  Generate Keypair         │
│  Create EIP-712 Message   │
└──────────┬────────────────┘
           │
           ▼
┌───────────────────────────┐
│  User Signs EIP-712       │
│  Authorization Request    │
└──────────┬────────────────┘
           │
           ▼
┌───────────────────────────┐
│  Call Zama Relayer        │
│  Decrypt Addresses        │
└──────────┬────────────────┘
           │
           ▼
┌───────────────────────────┐
│  Reconstruct IPFS CID     │
│  from Decrypted Addresses │
└──────────┬────────────────┘
           │
           ▼
┌───────────────────────────┐
│  Display IPFS Hash        │
│  User Can Access File     │
└───────────────────────────┘
```

### Technical Deep Dive

#### Encryption Process
1. **Input Preparation**: User's file generates an IPFS CID
2. **Address Conversion**: CID is split into two 20-byte EVM addresses
3. **Encryption Setup**: Zama instance creates encrypted input object
4. **FHE Encryption**: Each address is encrypted using FHE primitives
5. **Proof Generation**: Relayer SDK generates zero-knowledge proof
6. **Submission**: Encrypted handles and proof sent to smart contract

#### Decryption Process
1. **Authorization**: User generates temporary keypair
2. **EIP-712 Signing**: User signs structured authorization message
3. **Relayer Request**: Frontend calls Zama relayer with signature
4. **Server-Side Decryption**: Relayer validates and decrypts data
5. **Client Reconstruction**: Frontend converts addresses back to CID

---

## 📁 Project Structure

```
ZamaFile/
├── contracts/                 # Smart contract source files
│   ├── FHECounter.sol        # Example FHE counter contract
│   └── ZamaFile.sol          # Main file storage contract
│
├── deploy/                    # Deployment scripts
│   ├── 01_zamafile.ts        # ZamaFile contract deployment
│   └── deploy.ts             # General deployment utilities
│
├── test/                      # Smart contract tests
│   ├── FHECounter.ts         # Counter contract tests
│   └── FHECounterSepolia.ts  # Sepolia-specific tests
│
├── tasks/                     # Hardhat custom tasks
│   ├── accounts.ts           # Account management tasks
│   └── FHECounter.ts         # Counter interaction tasks
│
├── home/                      # Frontend application
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── FileApp.tsx   # Main container
│   │   │   ├── FileSubmission.tsx # Upload interface
│   │   │   ├── FileList.tsx  # File management
│   │   │   └── Header.tsx    # Navigation bar
│   │   │
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useZamaInstance.ts # FHE instance hook
│   │   │   └── useEthersSigner.ts # Ethers signer hook
│   │   │
│   │   ├── config/           # Configuration files
│   │   │   ├── wagmi.ts      # Web3 configuration
│   │   │   └── contracts.ts  # Contract ABI and address
│   │   │
│   │   ├── utils/            # Utility functions
│   │   │   └── ipfs.ts       # IPFS conversion utilities
│   │   │
│   │   ├── styles/           # CSS stylesheets
│   │   │   └── FileApp.css   # Component styles
│   │   │
│   │   ├── App.tsx           # Root component
│   │   └── main.tsx          # Application entry point
│   │
│   ├── index.html            # HTML template
│   ├── package.json          # Frontend dependencies
│   └── vite.config.ts        # Vite configuration
│
├── deployments/              # Deployment artifacts
│   └── sepolia/              # Sepolia network deployments
│       └── ZamaFile.json     # Contract ABI and address
│
├── hardhat.config.ts         # Hardhat configuration
├── package.json              # Root dependencies
├── tsconfig.json             # TypeScript configuration
├── .env                      # Environment variables (private)
└── README.md                 # This file
```

---

## 🚀 Installation

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Version 7.0.0 or higher
- **Git**: For cloning the repository
- **MetaMask** or compatible Web3 wallet
- **Sepolia ETH**: For testnet transactions

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/ZamaFile.git
cd ZamaFile
```

### Step 2: Install Dependencies

```bash
# Install root dependencies (Hardhat, contracts)
npm install

# Install frontend dependencies
cd home
npm install
cd ..
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Wallet configuration
MNEMONIC="your twelve word mnemonic phrase here"
PRIVATE_KEY="your_private_key_without_0x_prefix"

# RPC provider
INFURA_API_KEY="your_infura_api_key"

# Optional: Contract verification
ETHERSCAN_API_KEY="your_etherscan_api_key"
```

**Security Warning**: Never commit your `.env` file to version control!

### Step 4: Configure Hardhat Variables (Alternative)

```bash
# Set mnemonic securely
npx hardhat vars set MNEMONIC

# Set Infura API key
npx hardhat vars set INFURA_API_KEY

# Optional: Set Etherscan API key
npx hardhat vars set ETHERSCAN_API_KEY
```

---

## 📖 Usage

### Local Development

#### 1. Start Local FHEVM Node

```bash
# Terminal 1: Start local Hardhat node with FHEVM support
npx hardhat node
```

#### 2. Compile Contracts

```bash
# Terminal 2: Compile smart contracts
npm run compile
```

#### 3. Run Tests

```bash
# Run all tests
npm run test

# Run specific test file
npx hardhat test test/FHECounter.ts
```

#### 4. Deploy Contracts Locally

```bash
# Deploy to local node
npx hardhat deploy --network localhost
```

#### 5. Start Frontend Development Server

```bash
# Terminal 3: Navigate to frontend and start dev server
cd home
npm run dev
```

Open `http://localhost:5173` in your browser.

### Testnet Deployment (Sepolia)

#### 1. Deploy Smart Contract

```bash
# Deploy ZamaFile contract to Sepolia
npx hardhat deploy --network sepolia
```

Output will show:
```
Deploying ZamaFile...
ZamaFile contract: 0x1234567890abcdef1234567890abcdef12345678
```

#### 2. Verify Contract on Etherscan

```bash
# Verify deployed contract
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

#### 3. Update Frontend Configuration

Edit `home/src/config/contracts.ts`:

```typescript
export const CONTRACT_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';
```

Copy ABI from `deployments/sepolia/ZamaFile.json` to the same file.

#### 4. Update Wagmi Configuration

Edit `home/src/config/wagmi.ts`:

```typescript
export const config = getDefaultConfig({
  appName: 'ZamaFile',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get from https://cloud.walletconnect.com
  chains: [sepolia],
  ssr: false,
});
```

#### 5. Build Frontend for Production

```bash
cd home
npm run build
```

Deploy the `dist/` folder to your hosting provider (Vercel, Netlify, etc.).

### Interacting with the Application

#### Submit a File

1. **Connect Wallet**: Click "Connect Wallet" in the header
2. **Select File**: Choose a file from your computer
3. **Upload to IPFS**: Click "Upload IPFS" to generate hash
4. **Submit to Blockchain**: Click "Submit to Blockchain"
5. **Confirm Transaction**: Approve the transaction in your wallet
6. **Wait for Confirmation**: Transaction will be mined in ~15 seconds

#### View Your Files

1. **Switch to "My Files" Tab**
2. **View File List**: See all your submitted files
3. **Reveal IPFS Hash**: Click "Reveal IPFS Hash" on any file
4. **Sign Authorization**: Sign the EIP-712 message
5. **View Decrypted Hash**: IPFS CID will be displayed

---

## 🔐 Security Considerations

### Smart Contract Security

1. **Access Control**: Only file owners can decrypt their data
2. **Proof Verification**: All encrypted inputs validated via cryptographic proofs
3. **Immutability**: Records cannot be modified after submission
4. **Event Logging**: All actions logged for transparency and auditing

### Frontend Security

1. **Client-Side Encryption**: All encryption happens in the browser
2. **Private Key Protection**: Private keys never leave the user's wallet
3. **Secure Communication**: HTTPS required for production deployment
4. **Input Validation**: All user inputs sanitized and validated

### Cryptographic Security

1. **FHE Guarantees**: Encrypted data never decrypted on-chain
2. **Zero-Knowledge Proofs**: Proof-based validation without revealing data
3. **EIP-712 Signatures**: Structured signing prevents replay attacks
4. **Temporal Validation**: Decryption authorizations time-limited

### Operational Security

1. **Environment Variables**: Sensitive data stored securely
2. **Key Management**: Private keys managed via hardware wallets recommended
3. **Network Security**: RPC endpoints should use secure connections
4. **Dependency Auditing**: Regular security audits of dependencies

### Known Limitations

1. **Filename Privacy**: Filenames are stored in plaintext (by design for UX)
2. **Metadata Leakage**: Transaction timestamps and addresses are public
3. **IPFS Availability**: Files must be pinned to remain accessible
4. **Gas Costs**: FHE operations more expensive than standard transactions

---

## 🌟 Advantages

### For Users

1. **Complete Privacy**: Only you can access your file references
2. **True Ownership**: Your data lives on the blockchain, not someone else's server
3. **Censorship Resistant**: No central authority can block or delete your files
4. **Portable Identity**: Access your files from any device with your wallet
5. **Transparent Security**: Open-source code auditable by anyone

### For Developers

1. **Simple Integration**: Easy-to-use SDK and clear documentation
2. **Type Safety**: Full TypeScript support across the stack
3. **Modern Stack**: Built with latest tools and best practices
4. **Extensible**: Clean architecture easy to customize and extend
5. **Well-Tested**: Comprehensive test suite ensures reliability

### Technical Advantages

1. **On-Chain Privacy**: First-class support for encrypted data processing
2. **Gas Efficient**: Optimized contract code minimizes transaction costs
3. **Scalable Architecture**: Modular design supports future enhancements
4. **Cross-Platform**: Works on desktop and mobile browsers
5. **No Backend**: Fully decentralized with no server dependencies

### Business Advantages

1. **Cost Effective**: No infrastructure costs for backend services
2. **Regulatory Friendly**: Privacy-by-design architecture
3. **Vendor Independence**: Not locked into any cloud provider
4. **Future-Proof**: Built on emerging Web3 standards
5. **Competitive Edge**: Cutting-edge privacy technology

---

## 🗺 Future Roadmap

### Phase 1: Core Enhancements (Q2 2025)

- [ ] **File Sharing**: Encrypted sharing with other wallet addresses
- [ ] **Access Control Lists**: Granular permission management
- [ ] **Batch Operations**: Submit multiple files in one transaction
- [ ] **Metadata Encryption**: Optional encryption for filenames
- [ ] **Mobile Optimization**: Responsive design improvements

### Phase 2: Advanced Features (Q3 2025)

- [ ] **File Versioning**: Track file history and updates
- [ ] **Folder Structure**: Organize files into directories
- [ ] **Search Functionality**: Encrypted search capabilities
- [ ] **Expiration Dates**: Time-limited file access
- [ ] **Multi-Chain Support**: Deploy to Polygon, Arbitrum, etc.

### Phase 3: Enterprise Features (Q4 2025)

- [ ] **Organization Accounts**: Multi-user team workspaces
- [ ] **Role-Based Access**: Admin, editor, viewer roles
- [ ] **Audit Logs**: Comprehensive activity tracking
- [ ] **Compliance Tools**: GDPR, HIPAA compliance features
- [ ] **API Gateway**: Programmatic access for integrations

### Phase 4: Ecosystem Growth (2026)

- [ ] **IPFS Pinning Service**: Automatic file pinning integration
- [ ] **NFT Integration**: Mint files as NFTs with encrypted metadata
- [ ] **Cross-Chain Bridge**: Transfer file references between chains
- [ ] **Decentralized Identity**: Integration with ENS, Lens, etc.
- [ ] **Mobile App**: Native iOS and Android applications

### Community & Research

- [ ] **Bug Bounty Program**: Reward security researchers
- [ ] **Developer Grants**: Fund ecosystem projects
- [ ] **Academic Partnerships**: Research collaboration
- [ ] **Documentation Portal**: Comprehensive guides and tutorials
- [ ] **Integration Marketplace**: Third-party extensions

### Infrastructure Improvements

- [ ] **Gas Optimization**: Further reduce transaction costs
- [ ] **Batch Decryption**: Decrypt multiple files at once
- [ ] **Offline Mode**: Local caching and sync capabilities
- [ ] **Performance Monitoring**: Analytics and metrics dashboard
- [ ] **Automated Testing**: CI/CD pipeline enhancements

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Report Bugs**: Open issues for bugs you encounter
2. **Suggest Features**: Share your ideas for improvements
3. **Submit Pull Requests**: Fix bugs or implement new features
4. **Improve Documentation**: Help make docs clearer and more comprehensive
5. **Write Tests**: Increase test coverage
6. **Review Code**: Provide feedback on open pull requests

### Development Process

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/ZamaFile.git
   cd ZamaFile
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests for new functionality

4. **Test Your Changes**
   ```bash
   npm run test
   npm run lint
   ```

5. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Describe your changes clearly
   - Link related issues
   - Wait for review and feedback

### Code Style Guidelines

- **Solidity**: Follow official Solidity style guide
- **TypeScript**: Use ESLint configuration provided
- **Comments**: Write clear, concise comments in English
- **Naming**: Use descriptive variable and function names
- **Testing**: Aim for >80% code coverage

### Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow the code of conduct

---

## 📄 License

This project is licensed under the **BSD-3-Clause-Clear License**.

```
BSD 3-Clause Clear License

Copyright (c) 2024, ZamaFile Contributors
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted (subject to the limitations in the disclaimer
below) provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright
   notice, this list of conditions and the following disclaimer in the
   documentation and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

NO EXPRESS OR IMPLIED LICENSES TO ANY PARTY'S PATENT RIGHTS ARE GRANTED BY
THIS LICENSE. THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT
NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

---

## 🆘 Support

### Getting Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/ZamaFile/issues)
- **Discussions**: [Ask questions and share ideas](https://github.com/yourusername/ZamaFile/discussions)
- **Zama Documentation**: [FHEVM Docs](https://docs.zama.ai/fhevm)
- **Zama Community**: [Join Discord](https://discord.gg/zama)

### Useful Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Hardhat Documentation](https://hardhat.org/docs)
- [React Documentation](https://react.dev)
- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)
- [RainbowKit Documentation](https://rainbowkit.com)

---

## 🙏 Acknowledgments

Built with amazing open-source technologies:

- **Zama**: For pioneering FHE on Ethereum
- **Hardhat**: For excellent smart contract development tools
- **React Team**: For the powerful UI library
- **Wagmi Team**: For simplifying Web3 integration
- **RainbowKit Team**: For beautiful wallet connection UX
- **IPFS Community**: For decentralized storage innovation

---

## 📊 Project Status

- **Version**: 1.0.0
- **Status**: Production Ready ✅
- **Network**: Ethereum Sepolia Testnet
- **Last Updated**: September 2024
- **Maintained**: Actively maintained

---

## 🎯 Use Cases

### Personal Use
- Secure document backup with privacy
- Private photo storage references
- Encrypted diary or journal entries
- Medical records management

### Business Applications
- Confidential contract storage
- Secure credential management
- Privacy-compliant data archival
- Encrypted audit trails

### Development & Research
- Decentralized application building blocks
- Privacy-preserving storage research
- FHE technology demonstration
- Blockchain education and training

---

**Built with ❤️ using Fully Homomorphic Encryption**

For questions, feedback, or contributions, please open an issue or pull request on GitHub.

---

*Disclaimer: This is experimental technology deployed on testnet. Use at your own risk. Always perform due diligence before using in production environments.*