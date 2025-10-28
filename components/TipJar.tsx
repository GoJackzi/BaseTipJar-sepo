'use client'

import { useState, useEffect } from 'react'
import { ConnectWallet } from '@coinbase/onchainkit/wallet'
import { useAccount, useBalance, useWriteContract, useSwitchChain, useWaitForTransactionReceipt, useEstimateGas } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { base } from 'wagmi/chains'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge as UIBadge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Gift, Wallet, User } from 'lucide-react'

// No minimum or maximum tip amounts - users can tip any amount above 0

const nftContractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT as `0x${string}` || '0xb8826389e04EA68f3fFBE3870E77Dfc5862fdf0F'

export function TipJar() {
  const { address, chainId, isConnected } = useAccount()
  const [amount, setAmount] = useState<string>('')
  const [isValidating, setIsValidating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  const { data: balance, isLoading: balanceLoading } = useBalance({ 
    address, 
    query: { enabled: !!address } 
  })

  const { writeContract, isPending, data: hash } = useWriteContract()
  const { switchChain } = useSwitchChain()

  // Estimate gas for the transaction
  const { data: gasEstimate } = useEstimateGas({
    to: nftContractAddress,
    value: amount ? parseEther(amount) as bigint : BigInt(0),
    query: { enabled: !!amount && !!nftContractAddress }
  })

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash: hash,
  })

  // Check if user is on the correct network
  const isCorrectNetwork = chainId === base.id

  // Validate amount input
  const validateAmount = (value: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue <= 0) return false
    if (balance && numValue > parseFloat(balance.formatted)) return false
    return true
  }

  const amountValid = validateAmount(amount)
  const canTip = isConnected && isCorrectNetwork && amountValid && nftContractAddress !== '0x0000000000000000000000000000000000000000'

  // Reset form on successful transaction
  useEffect(() => {
    if (isSuccess) {
      setAmount('')
      setTxHash(hash || null)
    }
  }, [isSuccess, hash])

  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: base.id })
    } catch (error) {
      console.error('Failed to switch network:', error)
    }
  }

  const handleTip = async () => {
    if (!canTip) return
    
    setIsLoading(true)
    try {
      console.log('Sending tip transaction:', {
        address: nftContractAddress,
        amount: amount,
        value: parseEther(amount),
        gasEstimate: gasEstimate
      })

      await writeContract({
        address: nftContractAddress,
        abi: [{
          name: 'tip',
          type: 'function',
          stateMutability: 'payable',
          inputs: [],
          outputs: []
        }],
        functionName: 'tip',
        value: parseEther(amount) as bigint,
        gas: gasEstimate ? gasEstimate * BigInt(120) / BigInt(100) : BigInt(500000), // Use estimate + 20% buffer
      })
      
      console.log('Transaction submitted successfully')
      setAmount('') // Clear amount on success
    } catch (error) {
      console.error('Tip failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Transaction failed: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(value)
    setIsValidating(true)
    
    // Debounce validation
    setTimeout(() => {
      setIsValidating(false)
    }, 300)
  }

  const getAmountError = () => {
    if (!amount) return null
    const numValue = parseFloat(amount)
    if (isNaN(numValue) || numValue <= 0) return 'Please enter a valid amount'
    if (balance && numValue > parseFloat(balance.formatted)) return 'Insufficient balance'
    return null
  }

  const amountError = getAmountError()

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Gift className="h-6 w-6" />
            Tip Jar
          </CardTitle>
          <CardDescription>
            Support the project and receive a unique NFT receipt for your contribution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Wallet Connection */}
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              {isMounted ? <ConnectWallet /> : <div className="h-10 w-32 bg-muted animate-pulse rounded" />}
            </div>
            
            {isConnected && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3 p-4 bg-muted rounded-lg">
                  <User className="h-4 w-4" />
                  <div className="text-sm">
                    <p className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
                    <p className="text-muted-foreground">
                      {isCorrectNetwork ? 'Connected to Base Mainnet' : `Connected to Chain ID: ${chainId}`}
                    </p>
                  </div>
                </div>

                {/* Network Switch Prompt */}
                {!isCorrectNetwork && (
                  <Alert>
                    <AlertDescription className="flex items-center justify-between">
                      <span>Please switch to Base Mainnet to continue</span>
                      <Button 
                        onClick={handleSwitchNetwork}
                        size="sm"
                        variant="outline"
                      >
                        Switch Network
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          {/* Balance Display */}
          {isConnected && (
            <div className="text-center space-y-2">
              <UIBadge variant="outline" className="text-sm">
                <Wallet className="h-3 w-3 mr-1" />
                Balance: {balanceLoading ? 'Loading...' : `${balance?.formatted || '0'} ETH`}
              </UIBadge>
              {gasEstimate && (
                <UIBadge variant="outline" className="text-xs">
                  Gas Estimate: {formatEther(gasEstimate * BigInt(120) / BigInt(100))} ETH
                </UIBadge>
              )}
            </div>
          )}

          {/* Tip Amount Input */}
          {isConnected && isCorrectNetwork && (
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Tip Amount (ETH)
              </label>
              <div className="relative">
                <Input
                  id="amount"
                  type="number"
                  step="0.0001"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="Enter tip amount (any amount above 0)"
                  className={amountError ? 'border-red-500' : ''}
                />
                {isValidating && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
                )}
              </div>
              {amountError && (
                <Alert variant="destructive">
                  <AlertDescription>{amountError}</AlertDescription>
                </Alert>
              )}
              <p className="text-xs text-muted-foreground text-center">
                You'll receive a unique NFT receipt for your tip
              </p>
            </div>
          )}

          {/* Contract Address Warning */}
          {nftContractAddress === '0x0000000000000000000000000000000000000000' && (
            <Alert>
              <AlertDescription>
                NFT contract not deployed yet. Please deploy the contract first and update the contract address in .env.local
              </AlertDescription>
            </Alert>
          )}

          {/* Send Tip Button */}
          {isConnected && isCorrectNetwork && nftContractAddress !== '0x0000000000000000000000000000000000000000' && (
            <div className="space-y-4">
              <Button 
                onClick={handleTip}
                disabled={!canTip || isPending || isConfirming}
                className="w-full"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending Transaction...
                  </>
                ) : isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  canTip ? `Send ${amount} ETH Tip` : 'Enter valid amount'
                )}
              </Button>
              
              {isPending && (
                <Alert>
                  <AlertDescription>
                    Transaction pending... Check your wallet to confirm.
                  </AlertDescription>
                </Alert>
              )}

              {isConfirming && (
                <Alert>
                  <AlertDescription>
                    Transaction submitted! Waiting for confirmation...
                  </AlertDescription>
                </Alert>
              )}

              {isSuccess && (
                <Alert>
                  <AlertDescription className="text-green-600">
                    ✅ Transaction successful! Your NFT receipt has been minted.
                    {hash && (
                      <div className="mt-2">
                        <a 
                          href={`https://base-sepolia.blockscout.com/tx/${hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View on BlockScout
                        </a>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    ❌ Transaction failed. Please check your wallet and try again.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Instructions for non-connected users */}
          {!isConnected && (
            <div className="text-center text-muted-foreground">
              <p>Connect your wallet to start tipping</p>
            </div>
          )}

          {/* Instructions for wrong network */}
          {isConnected && !isCorrectNetwork && (
            <div className="text-center text-muted-foreground">
              <p>Please switch to Base Sepolia network to continue</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Connect your wallet to Base Sepolia testnet</p>
          <p>2. Switch to Base Sepolia network if prompted</p>
          <p>3. Enter the amount you'd like to tip (any amount above 0)</p>
          <p>4. Click "Send Tip" to mint your NFT receipt</p>
          <p>5. Your unique NFT will appear in your wallet</p>
        </CardContent>
      </Card>
    </div>
  )
}
