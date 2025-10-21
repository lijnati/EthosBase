import { useState, useEffect } from 'react'
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

function App() {
    const [account, setAccount] = useState(null)
    const [reputation, setReputation] = useState(null)
    const [access, setAccess] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [chainId, setChainId] = useState(null)

    // Check if wallet is already connected on load
    useEffect(() => {
        checkConnection()
    }, [])

    const checkConnection = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' })
                if (accounts.length > 0) {
                    setAccount(accounts[0])
                    await loadData(accounts[0])
                }

                const chainId = await window.ethereum.request({ method: 'eth_chainId' })
                setChainId(parseInt(chainId, 16))
            } catch (error) {
                console.error('Error checking connection:', error)
            }
        }
    }

    const connectWallet = async () => {
        try {
            setError(null)
            if (!window.ethereum) {
                throw new Error('MetaMask not found. Please install MetaMask.')
            }

            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            })

            if (accounts.length > 0) {
                setAccount(accounts[0])

                const chainId = await window.ethereum.request({ method: 'eth_chainId' })
                const networkId = parseInt(chainId, 16)
                setChainId(networkId)

                // Check if on correct network (Base Sepolia: 84532 or Base Mainnet: 8453)
                if (networkId !== 8453 && networkId !== 84532) {
                    setError(`Wrong network (Chain ID: ${networkId}). Please switch to Base Sepolia.`)
                    return
                }

                await loadData(accounts[0])
            }
        } catch (err) {
            setError(err.message)
        }
    }

    const switchToBaseSepolia = async () => {
        try {
            setError(null)
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x14a34' }], // 84532 in hex
            })

            // Wait a bit then check connection
            setTimeout(() => {
                checkConnection()
            }, 1000)
        } catch (switchError) {
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
                    setTimeout(() => checkConnection(), 1000)
                } catch (addError) {
                    setError('Failed to add Base Sepolia network')
                }
            } else {
                setError(switchError.message)
            }
        }
    }

    const loadData = async (userAddress) => {
        if (!userAddress || !window.ethereum) return

        try {
            setLoading(true)
            setError(null)

            const provider = new ethers.BrowserProvider(window.ethereum)

            // Try to load reputation data
            try {
                const repContract = new ethers.Contract(CONTRACTS.reputation, REPUTATION_ABI, provider)
                const accessContract = new ethers.Contract(CONTRACTS.access, ACCESS_ABI, provider)

                const [repData, tier, accessData] = await Promise.all([
                    repContract.getUserReputation(userAddress),
                    repContract.getReputationTier(userAddress),
                    accessContract.getUserAccessLevel(userAddress)
                ])

                setReputation({
                    total: Number(repData[0]),
                    loan: Number(repData[1]),
                    staking: Number(repData[2]),
                    community: Number(repData[3]),
                    tier
                })

                setAccess({
                    maxLoan: ethers.formatUnits(accessData[1], 6),
                    collateral: Number(accessData[2]) / 100,
                    discount: Number(accessData[3]) / 100,
                    exclusive: accessData[4]
                })
            } catch (contractError) {
                console.log('Contract not available, using mock data')
                // Use mock data if contracts aren't available
                setReputation({
                    total: 350,
                    loan: 150,
                    staking: 100,
                    community: 100,
                    tier: 'Silver'
                })

                setAccess({
                    maxLoan: '50000',
                    collateral: 130,
                    discount: 0.5,
                    exclusive: false
                })
            }
        } catch (err) {
            console.error('Load error:', err)
            setError('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const disconnectWallet = () => {
        setAccount(null)
        setReputation(null)
        setAccess(null)
        setError(null)
    }

    const getTierColor = (tier) => {
        const colors = {
            'Bronze': '#CD7F32',
            'Silver': '#C0C0C0',
            'Gold': '#FFD700',
            'Platinum': '#E5E4E2',
            'Unrated': '#6B7280'
        }
        return colors[tier] || colors['Unrated']
    }

    const getNetworkName = (chainId) => {
        const networks = {
            8453: 'Base Mainnet',
            84532: 'Base Sepolia',
            1: 'Ethereum Mainnet'
        }
        return networks[chainId] || `Chain ${chainId}`
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

                    <div className="nav-right">
                        {chainId && (
                            <div className="network-indicator">
                                <span className={`network-dot ${chainId === 8453 || chainId === 84532 ? 'connected' : 'wrong'}`}></span>
                                {getNetworkName(chainId)}
                            </div>
                        )}

                        {!account ? (
                            <button onClick={connectWallet} className="btn-primary">
                                Connect Wallet
                            </button>
                        ) : (
                            <div className="wallet-info">
                                <div className="account-display">
                                    <div className="account-avatar">
                                        {account.slice(0, 2).toUpperCase()}
                                    </div>
                                    <span className="account-address">
                                        {account.slice(0, 6)}...{account.slice(-4)}
                                    </span>
                                </div>
                                <button onClick={disconnectWallet} className="btn-disconnect">
                                    Disconnect
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="main">
                {error && (
                    <div className="alert alert-error">
                        <span>{error}</span>
                        {error.includes('Wrong network') && (
                            <button onClick={switchToBaseSepolia} className="btn-switch">
                                Switch to Base Sepolia
                            </button>
                        )}
                    </div>
                )}

                {!account ? (
                    <div className="hero">
                        <div className="hero-badge">Built on Base</div>
                        <h1 className="hero-title">
                            Your Reputation,
                            <br />
                            <span className="gradient-text">Your Advantage</span>
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
                            <a href="#features" className="btn-secondary">
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
                ) : loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading your reputation data...</p>
                    </div>
                ) : (
                    <div className="dashboard">
                        {/* Reputation Overview */}
                        <section className="section">
                            <h2>Your Reputation</h2>
                            <div className="reputation-overview">
                                <div className="reputation-card main-score">
                                    <div className="card-header">
                                        <h3>Total Score</h3>
                                        <div
                                            className="tier-badge"
                                            style={{ backgroundColor: getTierColor(reputation?.tier) }}
                                        >
                                            {reputation?.tier || 'Unrated'}
                                        </div>
                                    </div>
                                    <div className="score-display">
                                        {reputation?.total || 0}
                                    </div>
                                    <div className="score-breakdown">
                                        <div className="breakdown-item">
                                            <span className="breakdown-label">Loan</span>
                                            <span className="breakdown-value">{reputation?.loan || 0}</span>
                                        </div>
                                        <div className="breakdown-item">
                                            <span className="breakdown-label">Staking</span>
                                            <span className="breakdown-value">{reputation?.staking || 0}</span>
                                        </div>
                                        <div className="breakdown-item">
                                            <span className="breakdown-label">Community</span>
                                            <span className="breakdown-value">{reputation?.community || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="reputation-benefits">
                                    <h3>Your Benefits</h3>
                                    <div className="benefits-grid">
                                        <div className="benefit-item">
                                            <div className="benefit-icon">💰</div>
                                            <div className="benefit-content">
                                                <div className="benefit-label">Max Loan</div>
                                                <div className="benefit-value">{access?.maxLoan || 0} USDC</div>
                                            </div>
                                        </div>
                                        <div className="benefit-item">
                                            <div className="benefit-icon">🔒</div>
                                            <div className="benefit-content">
                                                <div className="benefit-label">Collateral</div>
                                                <div className="benefit-value">{access?.collateral || 0}%</div>
                                            </div>
                                        </div>
                                        <div className="benefit-item">
                                            <div className="benefit-icon">📉</div>
                                            <div className="benefit-content">
                                                <div className="benefit-label">Discount</div>
                                                <div className="benefit-value">{access?.discount || 0}%</div>
                                            </div>
                                        </div>
                                        <div className="benefit-item">
                                            <div className="benefit-icon">⭐</div>
                                            <div className="benefit-content">
                                                <div className="benefit-label">Exclusive</div>
                                                <div className="benefit-value">{access?.exclusive ? 'Yes' : 'No'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Tier Progress */}
                        <section className="section">
                            <h2>Tier Progress</h2>
                            <div className="tier-progress">
                                {[
                                    { name: 'Bronze', min: 200, color: '#CD7F32' },
                                    { name: 'Silver', min: 400, color: '#C0C0C0' },
                                    { name: 'Gold', min: 600, color: '#FFD700' },
                                    { name: 'Platinum', min: 800, color: '#E5E4E2' }
                                ].map((tier, index) => {
                                    const currentScore = reputation?.total || 0
                                    const progress = Math.min(100, (currentScore / tier.min) * 100)
                                    const achieved = currentScore >= tier.min

                                    return (
                                        <div key={tier.name} className={`tier-item ${achieved ? 'achieved' : ''}`}>
                                            <div className="tier-info">
                                                <div className="tier-name" style={{ color: tier.color }}>
                                                    {tier.name}
                                                </div>
                                                <div className="tier-requirement">
                                                    {tier.min}+ points
                                                </div>
                                            </div>
                                            <div className="progress-container">
                                                <div className="progress-bar">
                                                    <div
                                                        className="progress-fill"
                                                        style={{
                                                            width: `${progress}%`,
                                                            backgroundColor: tier.color
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="progress-text">
                                                    {achieved ? '✓ Achieved' : `${Math.round(progress)}%`}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>

                        {/* Coming Soon Features */}
                        <section className="section">
                            <h2>Coming Soon</h2>
                            <div className="coming-soon-grid">
                                <div className="coming-soon-card">
                                    <div className="coming-soon-icon">🏆</div>
                                    <h3>Achievement System</h3>
                                    <p>Unlock badges and rewards for your DeFi activities</p>
                                </div>
                                <div className="coming-soon-card">
                                    <div className="coming-soon-icon">🤝</div>
                                    <h3>Social Features</h3>
                                    <p>Endorsements and vouching from other users</p>
                                </div>
                                <div className="coming-soon-card">
                                    <div className="coming-soon-icon">💰</div>
                                    <h3>Lending Pool</h3>
                                    <p>Borrow and lend with reputation-based rates</p>
                                </div>
                                <div className="coming-soon-card">
                                    <div className="coming-soon-icon">🏷️</div>
                                    <h3>Basename Integration</h3>
                                    <p>Link your .base.eth name to your reputation</p>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* Features Section for Landing Page */}
                {!account && (
                    <section className="features" id="features">
                        <div className="container">
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
                        </div>
                    </section>
                )}
            </main>
        </div>
    )
}

export default App