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
                    <>
                        {/* Hero Section */}
                        <div className="hero-modern">
                            <div className="hero-background">
                                <div className="hero-gradient"></div>
                                <div className="hero-pattern"></div>
                            </div>

                            <div className="hero-content">
                                <div className="hero-badge-modern">
                                    <span className="badge-icon">🔗</span>
                                    DeFi's First Modular Reputation Layer
                                </div>

                                <h1 className="hero-title-modern">
                                    Reputation is the
                                    <span className="gradient-text-modern"> New Collateral. </span>
                                    
                                </h1>

                                <p className="hero-subtitle-modern">
                                    EthosBase is DeFi's first composable, on-chain reputation system built for Base.
                                    
                                </p>

                                <div className="hero-cta">
                                    <button onClick={connectWallet} className="btn-primary-modern">
                                        <span className="btn-icon">🚀</span>
                                        Launch App
                                    </button>
                                    <a href="#features" className="btn-secondary-modern">
                                        Explore Features
                                        <span className="btn-arrow">→</span>
                                    </a>
                                </div>

                                <div className="hero-trust-indicators">
                                    {/* <div className="trust-item">
                                        <div className="trust-icon">🔒</div>
                                        <span>Secure & Decentralized</span>
                                    </div> */}
                                    <div className="trust-item">
                                        <div className="trust-icon">⚡</div>
                                        <span>Base Network</span>
                                    </div>
                                    <div className="trust-item">
                                        <div className="trust-icon">🏷️</div>
                                        <span>Basename Ready</span>
                                    </div>
                                </div>
                            </div>

                            <div className="hero-visual">
                                <div className="reputation-preview">
                                    <div className="preview-card">
                                        <div className="preview-header">
                                            <div className="preview-avatar">
                                                <div className="avatar-gradient"></div>
                                            </div>
                                            <div className="preview-info">
                                                <div className="preview-name">your.base.eth</div>
                                                <div className="preview-tier">Gold Tier</div>
                                            </div>
                                        </div>
                                        <div className="preview-score">
                                            <div className="score-value">750</div>
                                            <div className="score-label">Reputation Score</div>
                                        </div>
                                        <div className="preview-benefits">
                                            <div className="benefit-item">
                                                <span className="benefit-icon">💰</span>
                                                <span>1.5% Interest Discount</span>
                                            </div>
                                            <div className="benefit-item">
                                                <span className="benefit-icon">🔒</span>
                                                <span>110% Collateral Ratio</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* What Makes Us Different Section */}
                        <div className="differentiator-section">
                            <div className="differentiator-container">
                                <div className="differentiator-header">
                                    <h2 className="differentiator-title">What Makes EthosBase Stand Out</h2>
                                    <p className="differentiator-subtitle">
                                        The first truly composable reputation infrastructure for DeFi
                                    </p>
                                </div>

                                <div className="differentiator-grid">
                                    <div className="differentiator-card">
                                        <div className="diff-icon">🔗</div>
                                        <h3>Composable Reputation</h3>
                                        <p>Any protocol can query or integrate reputation scores on-chain. No APIs, no centralized dependencies - just pure blockchain composability.</p>
                                        <div className="diff-highlight">Open-source & permissionless</div>
                                    </div>

                                    <div className="differentiator-card">
                                        <div className="diff-icon">🛡️</div>
                                        <h3>Privacy-Preserving</h3>
                                        <p>No personal data required. Reputation scores are built entirely from verifiable wallet activity and on-chain behavior patterns.</p>
                                        <div className="diff-highlight">Zero personal data collection</div>
                                    </div>

                                    {/* <div className="differentiator-card">
                                        <div className="diff-icon">💰</div>
                                        <h3>Rewarding Good Behavior</h3>
                                        <p>Users earn tangible financial advantages for being trustworthy - better rates, lower collateral, and exclusive access to premium pools.</p>
                                        <div className="diff-highlight">Real financial benefits</div>
                                    </div> */}

                                    <div className="differentiator-card">
                                        <div className="diff-icon">⚡</div>
                                        <h3>Built on Base</h3>
                                        <p>Fast, low-cost transactions make continuous reputation updates possible. Real-time scoring without prohibitive gas fees.</p>
                                        <div className="diff-highlight">Optimized for Base chain</div>
                                    </div>
                                </div>

                                <div className="vs-traditional">
                                    <div className="vs-header">
                                        <h3>EthosBase vs Traditional Credit Scoring</h3>
                                    </div>
                                    <div className="comparison-grid">
                                        <div className="comparison-column ethos">
                                            <div className="column-header">
                                                <div className="column-icon">🚀</div>
                                                <h4>EthosBase</h4>
                                            </div>
                                            <div className="comparison-items">
                                                <div className="comparison-item">✅ Fully on-chain & composable</div>
                                                <div className="comparison-item">✅ No personal data required</div>
                                                <div className="comparison-item">✅ Real-time updates</div>
                                                <div className="comparison-item">✅ Open-source & transparent</div>
                                                <div className="comparison-item">✅ Immediate financial benefits</div>
                                            </div>
                                        </div>
                                        <div className="comparison-column traditional">
                                            <div className="column-header">
                                                <div className="column-icon">🏦</div>
                                                <h4>Traditional Systems</h4>
                                            </div>
                                            <div className="comparison-items">
                                                <div className="comparison-item">❌ Centralized APIs & databases</div>
                                                <div className="comparison-item">❌ Extensive personal data collection</div>
                                                <div className="comparison-item">❌ Slow, periodic updates</div>
                                                <div className="comparison-item">❌ Proprietary & opaque</div>
                                                <div className="comparison-item">❌ Limited DeFi integration</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Section */}
                        {/* <div className="stats-section">
                            <div className="stats-container">
                                <div className="stat-card">
                                    <div className="stat-icon">🔗</div>
                                    <div className="stat-number">100%</div>
                                    <div className="stat-label">Composable</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">🛡️</div>
                                    <div className="stat-number">0</div>
                                    <div className="stat-label">Personal Data</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">⚡</div>
                                    <div className="stat-number">Real-time</div>
                                    <div className="stat-label">Updates</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">🌐</div>
                                    <div className="stat-number">Any dApp</div>
                                    <div className="stat-label">Can Integrate</div>
                                </div>
                            </div>
                        </div> */}

                        {/* Features Section */}
                        <div className="features-modern" id="features">
                            <div className="features-header">
                                <h2 className="features-title">How Our Modular System Works</h2>
                                <p className="features-subtitle">
                                    A three-step process that transforms your DeFi activity into composable reputation
                                </p>
                            </div>

                            <div className="features-grid-modern">
                                <div className="feature-card-modern">
                                    <div className="feature-step">1</div>
                                    <div className="feature-icon-modern">
                                        <div className="icon-bg">📊</div>
                                    </div>
                                    <h3>Activity Tracking</h3>
                                    <p>Your on-chain activities are automatically tracked and scored - loan repayments, staking, liquidity provision, and more.</p>
                                    <div className="feature-points">
                                        <div className="point">• Automated on-chain monitoring</div>
                                        <div className="point">• Real-time score updates</div>
                                        <div className="point">• Privacy-preserving analysis</div>
                                    </div>
                                </div>

                                <div className="feature-card-modern featured">
                                    <div className="feature-badge">Core Innovation</div>
                                    <div className="feature-step">2</div>
                                    <div className="feature-icon-modern">
                                        <div className="icon-bg">🔗</div>
                                    </div>
                                    <h3>Modular Integration</h3>
                                    <p>Any DeFi protocol can instantly access your reputation through our composable smart contracts - no APIs or centralized systems.</p>
                                    <div className="feature-points">
                                        <div className="point">• Plug-and-play for any dApp</div>
                                        <div className="point">• On-chain composability</div>
                                        <div className="point">• Open-source infrastructure</div>
                                    </div>
                                </div>

                                <div className="feature-card-modern">
                                    <div className="feature-step">3</div>
                                    <div className="feature-icon-modern">
                                        <div className="icon-bg">💰</div>
                                    </div>
                                    <h3>Instant Benefits</h3>
                                    <p>Enjoy better rates, lower collateral, and exclusive access across all integrated protocols - your reputation works everywhere.</p>
                                    <div className="feature-points">
                                        <div className="point">• Cross-protocol benefits</div>
                                        <div className="point">• Immediate rate improvements</div>
                                        <div className="point">• Ecosystem-wide recognition</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tiers Section */}
                        <div className="tiers-modern">
                            <div className="tiers-header">
                                <h2 className="tiers-title">Reputation Tiers</h2>
                                <p className="tiers-subtitle">Progress through tiers to unlock better benefits</p>
                            </div>

                            <div className="tiers-grid-modern">
                                <div className="tier-card-modern bronze">
                                    <div className="tier-header-modern">
                                        <div className="tier-icon">🥉</div>
                                        <div className="tier-name-modern">Bronze</div>
                                        <div className="tier-score-modern">200+ points</div>
                                    </div>
                                    <div className="tier-benefits-modern">
                                        <div className="benefit">0.25% interest discount</div>
                                        <div className="benefit">130% collateral ratio</div>
                                        <div className="benefit">Basic lending access</div>
                                    </div>
                                </div>

                                <div className="tier-card-modern silver">
                                    <div className="tier-header-modern">
                                        <div className="tier-icon">🥈</div>
                                        <div className="tier-name-modern">Silver</div>
                                        <div className="tier-score-modern">400+ points</div>
                                    </div>
                                    <div className="tier-benefits-modern">
                                        <div className="benefit">0.5% interest discount</div>
                                        <div className="benefit">120% collateral ratio</div>
                                        <div className="benefit">Priority support</div>
                                    </div>
                                </div>

                                <div className="tier-card-modern gold popular">
                                    <div className="tier-badge-modern">Most Popular</div>
                                    <div className="tier-header-modern">
                                        <div className="tier-icon">🥇</div>
                                        <div className="tier-name-modern">Gold</div>
                                        <div className="tier-score-modern">600+ points</div>
                                    </div>
                                    <div className="tier-benefits-modern">
                                        <div className="benefit">1.5% interest discount</div>
                                        <div className="benefit">110% collateral ratio</div>
                                        <div className="benefit">Exclusive pools access</div>
                                    </div>
                                </div>

                                <div className="tier-card-modern platinum">
                                    <div className="tier-header-modern">
                                        <div className="tier-icon">💎</div>
                                        <div className="tier-name-modern">Platinum</div>
                                        <div className="tier-score-modern">800+ points</div>
                                    </div>
                                    <div className="tier-benefits-modern">
                                        <div className="benefit">2% interest discount</div>
                                        <div className="benefit">105% collateral ratio</div>
                                        <div className="benefit">VIP treatment</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA Section */}
                        <div className="cta-modern">
                            <div className="cta-content">
                                <h2 className="cta-title">Ready for Composable Credit?</h2>
                                <p className="cta-subtitle">
                                    Join DeFi's first modular reputation layer and unlock better opportunities across the entire Base ecosystem
                                </p>
                                <button onClick={connectWallet} className="btn-cta-modern">
                                    <span className="btn-icon">🔗</span>
                                    Start Building Reputation
                                </button>
                            </div>
                            <div className="cta-visual">
                                <div className="cta-pattern"></div>
                            </div>
                        </div>
                    </>
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
                                ].map((tier) => {
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

                        {/* Base Account Integration */}
                        {/* <section className="section">
                            <h2>Base Account & Basename</h2>
                            <div className="base-integration-grid">
                                <div className="integration-card">
                                    <div className="integration-icon">🏷️</div>
                                    <h3>Basename Integration</h3>
                                    <p>Your .base.eth name is now linked to your reputation</p>
                                    <div className="integration-status active">
                                        <span>✓ Active</span>
                                    </div>
                                </div>
                                <div className="integration-card">
                                    <div className="integration-icon">🎯</div>
                                    <h3>Identity Verification</h3>
                                    <p>Enhanced profile verification through Base ecosystem</p>
                                    <div className="integration-status active">
                                        <span>✓ Active</span>
                                    </div>
                                </div>
                                <div className="integration-card">
                                    <div className="integration-icon">🌐</div>
                                    <h3>Ecosystem Benefits</h3>
                                    <p>Use your reputation across all Base DeFi protocols</p>
                                    <div className="integration-status active">
                                        <span>✓ Active</span>
                                    </div>
                                </div>
                            </div>
                        </section> */}

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
                                    <div className="coming-soon-icon">🔗</div>
                                    <h3>Cross-Chain Reputation</h3>
                                    <p>Extend your reputation across multiple networks</p>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    )
}

export default App