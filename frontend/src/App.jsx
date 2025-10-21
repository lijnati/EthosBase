import { useState } from 'react'
import { ethers } from 'ethers'
import './App.css'

const CONTRACTS = {
    reputation: '0x4fD8693aEAF67F96D8077961847344FF485e659b',
    access: '0x32f848F3677738d73faC20a0bD5A465e0da6e731',
    lending: '0xD1abe9A4288A7880AD75b6b353c4EA65B220adC7'
}

const REPUTATION_ABI = [
    'function getUserReputation(address user) view returns (uint256, uint256, uint256, uint256, uint256, bool)',
    'function getReputationTier(address user) view returns (string)'
]

const ACCESS_ABI = [
    'function getUserAccessLevel(address user) view returns (string, uint256, uint256, uint256, bool)'
]

const LENDING_ABI = [
    'function requestLoan(uint256 amount)',
    'function repayLoan()',
    'function getLoanDetails(address borrower) view returns (uint256, uint256, uint256, uint256, bool, uint256)'
]

function App() {
    const [account, setAccount] = useState(null)
    const [reputation, setReputation] = useState(null)
    const [access, setAccess] = useState(null)
    const [loan, setLoan] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [loanAmount, setLoanAmount] = useState('')

    const switchToBaseSepolia = async () => {
        try {
            setError(null)
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x14a34' }], // 84532 in hex
            })
            // After switching, try connecting again
            setTimeout(() => connectWallet(), 500)
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: '0x14a34',
                                chainName: 'Base Sepolia',
                                nativeCurrency: {
                                    name: 'Ethereum',
                                    symbol: 'ETH',
                                    decimals: 18,
                                },
                                rpcUrls: ['https://sepolia.base.org'],
                                blockExplorerUrls: ['https://sepolia.basescan.org'],
                            },
                        ],
                    })
                    // After adding, try connecting again
                    setTimeout(() => connectWallet(), 500)
                } catch (addError) {
                    setError('Failed to add Base Sepolia network')
                }
            } else {
                setError(switchError.message)
            }
        }
    }

    const connectWallet = async () => {
        try {
            setError(null)
            if (!window.ethereum) {
                throw new Error('MetaMask not found')
            }

            const provider = new ethers.BrowserProvider(window.ethereum)
            await provider.send('eth_requestAccounts', [])
            const signer = await provider.getSigner()
            const address = await signer.getAddress()

            const network = await provider.getNetwork()
            const chainId = Number(network.chainId)

            console.log('Connected to chain ID:', chainId)

            // Base Mainnet: 8453, Base Sepolia: 84532
            if (chainId !== 8453 && chainId !== 84532) {
                setError(`Wrong network (Chain ID: ${chainId}). Click "Switch to Base Sepolia" below.`)
                return
            }

            setAccount(address)
            await loadData(signer, address)
        } catch (err) {
            setError(err.message)
        }
    }

    const loadData = async (signer, address) => {
        try {
            setLoading(true)

            const repContract = new ethers.Contract(CONTRACTS.reputation, REPUTATION_ABI, signer)
            const accessContract = new ethers.Contract(CONTRACTS.access, ACCESS_ABI, signer)
            const lendingContract = new ethers.Contract(CONTRACTS.lending, LENDING_ABI, signer)

            const [repData, tier] = await Promise.all([
                repContract.getUserReputation(address),
                repContract.getReputationTier(address)
            ])

            setReputation({
                total: Number(repData[0]),
                loan: Number(repData[1]),
                staking: Number(repData[2]),
                community: Number(repData[3]),
                tier
            })

            const accessData = await accessContract.getUserAccessLevel(address)
            setAccess({
                maxLoan: ethers.formatUnits(accessData[1], 6),
                collateral: Number(accessData[2]) / 100,
                discount: Number(accessData[3]) / 100,
                exclusive: accessData[4]
            })

            const loanData = await lendingContract.getLoanDetails(address)
            if (loanData[4]) {
                setLoan({
                    amount: ethers.formatUnits(loanData[0], 6),
                    collateral: ethers.formatEther(loanData[1]),
                    dueDate: new Date(Number(loanData[3]) * 1000),
                    interest: ethers.formatUnits(loanData[5], 6)
                })
            }
        } catch (err) {
            console.error('Load error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleRequestLoan = async () => {
        try {
            setError(null)
            setLoading(true)
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner()
            const lendingContract = new ethers.Contract(CONTRACTS.lending, LENDING_ABI, signer)

            const amount = ethers.parseUnits(loanAmount, 6)
            const tx = await lendingContract.requestLoan(amount)
            await tx.wait()

            await loadData(signer, account)
            setLoanAmount('')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleRepayLoan = async () => {
        try {
            setError(null)
            setLoading(true)
            const provider = new ethers.BrowserProvider(window.ethereum)
            const signer = await provider.getSigner()
            const lendingContract = new ethers.Contract(CONTRACTS.lending, LENDING_ABI, signer)

            const tx = await lendingContract.repayLoan()
            await tx.wait()

            await loadData(signer, account)
            setLoan(null)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="app">
            <nav className="nav">
                <div className="nav-content">
                    <div className="logo">
                        <span className="logo-text">
                            <span className="logo-ethos">ETHOS</span>
                            <span className="logo-base">BASE</span>
                        </span>
                    </div>
                    {!account ? (
                        <button onClick={connectWallet} className="btn-primary">
                            Connect Wallet
                        </button>
                    ) : (
                        <div className="account">
                            {account.slice(0, 6)}...{account.slice(-4)}
                        </div>
                    )}
                </div>
            </nav>

            <main className="main">
                {error && (
                    <div className="alert alert-error">
                        {error}
                        {error.includes('Wrong network') && (
                            <button onClick={switchToBaseSepolia} className="btn-switch">
                                Switch to Base Sepolia
                            </button>
                        )}
                    </div>
                )}

                {!account ? (
                    <>
                        <div className="hero">
                            <div className="hero-badge">Built on Base</div>
                            <h1 className="hero-title">
                                Reputation is the 
                                <br />
                                <span className="gradient-text">New Collateral.</span>
                            </h1>
                            <p className="hero-subtitle">
                                Build on-chain credibility and unlock better DeFi rates, lower collateral,
                                <br />
                                and exclusive access to premium lending pools
                            </p>
                            <div className="hero-buttons">
                                <button onClick={connectWallet} className="btn-hero">
                                    Launch App
                                </button>
                                <a href="#how-it-works" className="btn-secondary">
                                    Learn More
                                </a>
                            </div>
                            <div className="hero-stats">
                                <div className="stat-item">
                                    <div className="stat-number">Up to 2%</div>
                                    <div className="stat-label">Interest Discount</div>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="stat-item">
                                    <div className="stat-number">105%</div>
                                    <div className="stat-label">Min Collateral</div>
                                </div>
                                <div className="stat-divider"></div>
                                <div className="stat-item">
                                    <div className="stat-number">4 Tiers</div>
                                    <div className="stat-label">Reputation Levels</div>
                                </div>
                            </div>
                        </div>

                        <section className="features" id="how-it-works">
                            <h2 className="section-title">How It Works</h2>
                            <div className="features-grid">
                                <div className="feature-card">
                                    <div className="feature-icon">📊</div>
                                    <h3>Build Reputation</h3>
                                    <p>Earn reputation points through on-time loan repayments, staking, and community participation</p>
                                </div>
                                <div className="feature-card">
                                    <div className="feature-icon">🎯</div>
                                    <h3>Unlock Benefits</h3>
                                    <p>Higher reputation unlocks better interest rates, lower collateral requirements, and larger loan limits</p>
                                </div>
                                <div className="feature-card">
                                    <div className="feature-icon">🔒</div>
                                    <h3>Access Exclusive Pools</h3>
                                    <p>Gold and Platinum tiers gain access to premium lending pools with the best terms</p>
                                </div>
                            </div>
                        </section>

                        <section className="tiers">
                            <h2 className="section-title">Reputation Tiers</h2>
                            <div className="tiers-grid">
                                <div className="tier-card tier-card-bronze">
                                    <div className="tier-header">
                                        <div className="tier-name">Bronze</div>
                                        <div className="tier-score">200+ pts</div>
                                    </div>
                                    <div className="tier-benefits">
                                        <div className="benefit">✓ 10K USDC max loan</div>
                                        <div className="benefit">✓ 150% collateral</div>
                                        <div className="benefit">✓ Standard rates</div>
                                    </div>
                                </div>
                                <div className="tier-card tier-card-silver">
                                    <div className="tier-header">
                                        <div className="tier-name">Silver</div>
                                        <div className="tier-score">400+ pts</div>
                                    </div>
                                    <div className="tier-benefits">
                                        <div className="benefit">✓ 50K USDC max loan</div>
                                        <div className="benefit">✓ 130% collateral</div>
                                        <div className="benefit">✓ 0.5% discount</div>
                                    </div>
                                </div>
                                <div className="tier-card tier-card-gold">
                                    <div className="tier-badge-popular">Popular</div>
                                    <div className="tier-header">
                                        <div className="tier-name">Gold</div>
                                        <div className="tier-score">600+ pts</div>
                                    </div>
                                    <div className="tier-benefits">
                                        <div className="benefit">✓ 200K USDC max loan</div>
                                        <div className="benefit">✓ 110% collateral</div>
                                        <div className="benefit">✓ 1% discount</div>
                                        <div className="benefit">✓ Exclusive pools</div>
                                    </div>
                                </div>
                                <div className="tier-card tier-card-platinum">
                                    <div className="tier-badge-premium">Premium</div>
                                    <div className="tier-header">
                                        <div className="tier-name">Platinum</div>
                                        <div className="tier-score">800+ pts</div>
                                    </div>
                                    <div className="tier-benefits">
                                        <div className="benefit">✓ 1M USDC max loan</div>
                                        <div className="benefit">✓ 105% collateral</div>
                                        <div className="benefit">✓ 2% discount</div>
                                        <div className="benefit">✓ VIP access</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="cta">
                            <h2 className="cta-title">Ready to Build Your Reputation?</h2>
                            <p className="cta-subtitle">Join EthosBase and start earning better DeFi terms today</p>
                            <button onClick={connectWallet} className="btn-cta">
                                Connect Wallet
                            </button>
                        </section>
                    </>
                ) : loading && !reputation ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <>
                        <section className="section">
                            <h2>Your Reputation</h2>
                            <div className="grid">
                                <div className="card card-highlight">
                                    <div className="card-label">Total Score</div>
                                    <div className="card-value">{reputation?.total || 0}</div>
                                    <div className={`tier tier-${reputation?.tier?.toLowerCase()}`}>
                                        {reputation?.tier || 'Unrated'}
                                    </div>
                                </div>
                                <div className="card">
                                    <div className="card-label">Loan Score</div>
                                    <div className="card-value">{reputation?.loan || 0}</div>
                                </div>
                                <div className="card">
                                    <div className="card-label">Staking Score</div>
                                    <div className="card-value">{reputation?.staking || 0}</div>
                                </div>
                                <div className="card">
                                    <div className="card-label">Community Score</div>
                                    <div className="card-value">{reputation?.community || 0}</div>
                                </div>
                            </div>
                        </section>

                        <section className="section">
                            <h2>Access Benefits</h2>
                            <div className="grid">
                                <div className="card">
                                    <div className="card-label">Max Loan</div>
                                    <div className="card-value">{access?.maxLoan || 0} USDC</div>
                                </div>
                                <div className="card">
                                    <div className="card-label">Collateral Ratio</div>
                                    <div className="card-value">{access?.collateral || 0}%</div>
                                </div>
                                <div className="card">
                                    <div className="card-label">Interest Discount</div>
                                    <div className="card-value">{access?.discount || 0}%</div>
                                </div>
                                <div className="card">
                                    <div className="card-label">Exclusive Access</div>
                                    <div className="card-value">{access?.exclusive ? '✓' : '✗'}</div>
                                </div>
                            </div>
                        </section>

                        <section className="section">
                            <h2>Lending</h2>
                            {loan ? (
                                <div className="loan-active">
                                    <div className="card">
                                        <div className="loan-info">
                                            <div>
                                                <div className="card-label">Active Loan</div>
                                                <div className="card-value">{loan.amount} USDC</div>
                                            </div>
                                            <div>
                                                <div className="card-label">Interest</div>
                                                <div className="card-value">{loan.interest} USDC</div>
                                            </div>
                                            <div>
                                                <div className="card-label">Due Date</div>
                                                <div className="card-value">{loan.dueDate.toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleRepayLoan}
                                            disabled={loading}
                                            className="btn-primary"
                                        >
                                            {loading ? 'Processing...' : 'Repay Loan'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="loan-form">
                                    <input
                                        type="number"
                                        placeholder="Amount (USDC)"
                                        value={loanAmount}
                                        onChange={(e) => setLoanAmount(e.target.value)}
                                        className="input"
                                    />
                                    <button
                                        onClick={handleRequestLoan}
                                        disabled={loading || !loanAmount}
                                        className="btn-primary"
                                    >
                                        {loading ? 'Processing...' : 'Request Loan'}
                                    </button>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    )
}

export default App