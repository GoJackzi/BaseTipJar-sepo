# NFT Tip Jar - Remix Deployment Guide

## Prerequisites

1. **MetaMask or Coinbase Wallet** installed in your browser
2. **Base Mainnet ETH** for gas fees
3. **Remix IDE** account (free at [remix.ethereum.org](https://remix.ethereum.org))

## Step 1: Get Base Mainnet ETH

1. Bridge ETH from Ethereum mainnet to Base using [Base Bridge](https://bridge.base.org)
2. Or buy ETH directly on Base through Coinbase
3. You'll need ~0.01 ETH for deployment

## Step 2: Add Base Mainnet to MetaMask

1. Open MetaMask
2. Click the network dropdown (top of MetaMask)
3. Click "Add network"
4. Enter these details:
   - **Network Name**: Base
   - **RPC URL**: `https://mainnet.base.org`
   - **Chain ID**: `8453`
   - **Currency Symbol**: `ETH`
   - **Block Explorer**: `https://basescan.org`

## Step 3: Deploy Contract in Remix

### 3.1 Open Remix IDE
1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create a new workspace called "tip-jar-nft"

### 3.2 Create Contract File
1. In the file explorer, create a new file called `TipJarNFT.sol`
2. Copy the entire contents from `TipJarNFT-single-file.sol`
3. Paste it into the Remix editor

### 3.3 Compile Contract
1. In the Solidity Compiler tab (left sidebar)
2. Set compiler version to `0.8.30`
3. Enable optimization with 200 runs
4. Click "Compile TipJarNFT.sol"

### 3.4 Deploy Contract
1. Go to the "Deploy & Run Transactions" tab
2. Make sure "Injected Provider - MetaMask" is selected
3. Ensure your wallet is connected to Base Mainnet
4. In the "Contract" dropdown, select "TipJarNFT"
5. Click "Deploy"
6. MetaMask will pop up - confirm the transaction
7. Wait for deployment to complete

### 3.5 Get Contract Address
1. After deployment, you'll see your contract in the "Deployed Contracts" section
2. Click the copy icon next to the contract address
3. It will look like: `0xABC123...`

## Step 4: Update Environment Variables

1. Open `.env.local`
2. Set your contract address:
   ```
   NEXT_PUBLIC_CHAIN_ENV=mainnet
   NEXT_PUBLIC_NFT_CONTRACT=0xYourActualContractAddress
   NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
   ```

## Step 5: Test the Application

1. Open terminal in project directory
2. Run: `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)
4. Connect your wallet (make sure it's on Base Mainnet)
5. Try sending a small tip (0.001 ETH)
6. Check your wallet for the NFT receipt!

## Step 6: Verify Contract (Optional)

1. Go to [Base Explorer](https://basescan.org)
2. Search for your contract address
3. Click "Contract" tab
4. Click "Verify and Publish"
5. Select "Solidity (Single file)"
6. Copy your contract code and paste it
7. Set compiler version to `0.8.30`
8. Enable optimization with 200 runs
9. Click "Verify and Publish"

## Troubleshooting

### "Insufficient funds" error
- Make sure you have Base Mainnet ETH
- Bridge more ETH from Ethereum mainnet

### "Contract not found" error
- Make sure you copied the contract address correctly
- Check that the contract deployed successfully in Remix

### "Transaction failed" error
- Make sure you're on Base Mainnet network
- Try increasing gas limit in MetaMask
- Check that you have enough ETH for gas

### NFT not appearing
- Wait a few minutes for the transaction to confirm
- Check your wallet's NFT section
- Look for "Tip Jar Receipt" collection

## Next Steps

Once everything works on Base Mainnet:

1. **Customize the NFT**:
   - Edit the metadata generation in the contract
   - Add your own branding or colors
   - Redeploy with your changes

2. **Add Features**:
   - Tip leaderboard
   - Different NFT tiers based on tip amount
   - Withdrawal functionality for the owner

3. **Deploy to Production**:
   - Use a service like Vercel or Netlify
   - Set up custom domain
   - Monitor contract interactions

## Support

If you run into issues:
1. Check the browser console for errors
2. Verify your wallet is on the correct network
3. Make sure you have enough ETH for gas
4. Try refreshing the page and reconnecting your wallet

Happy building! 🚀
