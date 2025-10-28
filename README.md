# Base Tip Jar

A simple tip jar dApp built on Base mainnet that allows users to send ETH tips and receive NFT receipts.

## Features

- 💰 Send ETH tips with no minimum/maximum limits
- 🎨 Receive unique NFT receipts for each tip
- 🔗 Built on Base mainnet
- ⚡ Fast and gas-efficient transactions
- 🎯 Clean, modern UI

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Blockchain**: Base Mainnet, OnchainKit, Wagmi
- **Smart Contract**: Solidity 0.8.30, ERC-721 NFT
- **Styling**: Tailwind CSS, shadcn/ui

## Contract

**Address**: `0xb8826389e04EA68f3fFBE3870E77Dfc5862fdf0F`  
**Network**: Base Mainnet  
**Type**: ERC-721 NFT Contract

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Add your configuration:
   ```
   NEXT_PUBLIC_CHAIN_ENV=mainnet
   NEXT_PUBLIC_NFT_CONTRACT=0xb8826389e04EA68f3fFBE3870E77Dfc5862fdf0F
   NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

## Usage

1. **Connect your wallet** (MetaMask, Coinbase Wallet, etc.)
2. **Switch to Base Mainnet** network (prompted automatically)
3. **Enter tip amount** in ETH
4. **Click "Send Tip"** and confirm transaction
5. **Receive NFT receipt** in your wallet

## Smart Contract

The `TipJarNFT` contract mints ERC-721 NFTs as receipts for each tip:

- **Function**: `tip()` - Send ETH and receive NFT
- **Function**: `withdraw()` - Owner can withdraw collected tips
- **Function**: `tokenURI()` - Returns NFT metadata with tip details

## License

MIT
