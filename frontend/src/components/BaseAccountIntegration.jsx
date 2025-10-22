import { useState, useEffect } from 'react'
import { useAccount, useChainId, useBalance } from 'wagmi'
import { Identity, Avatar, Name, Badge } from '@coinbase/onchainkit/identity'
import { Transaction, TransactionButton, TransactionStatus } from '@coinbase/onchainkit/transaction'
import { useBasename } from '../hooks/useBasename'
import { BasenameManager, BasenameCard } from './BasenameManager'

export function BaseAccountProfile() {
    const { address, isConnected } = useAccount()
    const chainId = useChainId()
    const { basename, loading: basenameLoading } = useBasename(address, chainId)
    const { data: balance } = useBalance({ address })
    const [showBasenameManager, setShowBasenameManager] = useState(false)

    if (!isConnected || !address) {
        return (
            <div className="base-account-profile">
                <div className="profile-placeholder">
                    <h3>Connect Your Wallet</h3>
                    <p>Connect your wallet to view your Base Account profile</p>
                </div>
            </div>
        )
    }

    return (
        <div className="base-account-profile">
            <div className="profile-header">
                <Identity address={address} className="profile-identity">
                    <Avatar className="profile-avatar" />
                    <div className="profile-info">
                        <Name className="profile-name" />
                        <Badge className="profile-badge" />
                        <div className="profile-address">
                            {address.slice(0, 6)}...{address.slice(-4)}
                        </div>
                    </div>
                </Identity>

                <div className="profile-stats">
                    <div className="stat-item">
                        <div className="stat-label">Balance</div>
                        <div className="stat-value">
                            {balance ? `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}` : '0 ETH'}
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-label">Network</div>
                        <div className="stat-value">
                            {chainId === 8453 ? 'Base Mainnet' : 'Base Sepolia'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="profile-basename">
                <div className="basename-section-header">
                    <h4>Basename</h4>
                    <button
                        onClick={() => setShowBasenameManager(!showBasenameManager)}
                        className="btn-manage"
                    >
                        {showBasenameManager ? 'Hide' : 'Manage'}
                    </button>
                </div>

                {basenameLoading ? (
                    <div className="basename-loading">Loading basename...</div>
                ) : basename ? (
                    <BasenameCard address={address} showActions={true} />
                ) : (
                    <div className="no-basename-prompt">
                        <p>Get a Basename to enhance your Base identity</p>
                        <a
                            href="https://www.base.org/names"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-get-basename"
                        >
                            Get Basename
                        </a>
                    </div>
                )}

                {showBasenameManager && (
                    <div className="basename-manager-container">
                        <BasenameManager />
                    </div>
                )}
            </div>
        </div>
    )
}

export function BaseAccountBenefits({ reputation }) {
    const { address } = useAccount()
    const { basename } = useBasename(address)

    const benefits = [
        {
            id: 'basename',
            title: 'Basename Identity',
            description: 'Enhanced profile with .base.eth name',
            active: !!basename,
            reputationBonus: basename ? 25 : 0,
            icon: '🏷️'
        },
        {
            id: 'verified',
            title: 'Verified Account',
            description: 'Account verification through Base ecosystem',
            active: reputation?.total >= 200,
            reputationBonus: 50,
            icon: '✅'
        },
        {
            id: 'ecosystem',
            title: 'Ecosystem Participation',
            description: 'Active participation in Base DeFi protocols',
            active: reputation?.total >= 400,
            reputationBonus: 75,
            icon: '🌐'
        },
        {
            id: 'premium',
            title: 'Premium Features',
            description: 'Access to exclusive Base ecosystem features',
            active: reputation?.total >= 600,
            reputationBonus: 100,
            icon: '⭐'
        }
    ]

    return (
        <div className="base-account-benefits">
            <h3>Base Account Benefits</h3>
            <div className="benefits-grid">
                {benefits.map((benefit) => (
                    <div
                        key={benefit.id}
                        className={`benefit-card ${benefit.active ? 'active' : 'inactive'}`}
                    >
                        <div className="benefit-header">
                            <span className="benefit-icon">{benefit.icon}</span>
                            <div className="benefit-status">
                                {benefit.active ? (
                                    <span className="status-active">Active</span>
                                ) : (
                                    <span className="status-inactive">Locked</span>
                                )}
                            </div>
                        </div>
                        <h4>{benefit.title}</h4>
                        <p>{benefit.description}</p>
                        <div className="benefit-bonus">
                            <span className="bonus-label">Reputation Bonus:</span>
                            <span className="bonus-value">+{benefit.reputationBonus}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function BaseEcosystemIntegration() {
    const { address } = useAccount()
    const chainId = useChainId()
    const { basename } = useBasename(address, chainId)

    const ecosystemApps = [
        {
            name: 'Uniswap',
            description: 'Decentralized exchange on Base',
            url: 'https://app.uniswap.org',
            icon: '🦄',
            basenameSupport: true
        },
        {
            name: 'Aerodrome',
            description: 'Base native DEX and liquidity hub',
            url: 'https://aerodrome.finance',
            icon: '✈️',
            basenameSupport: true
        },
        {
            name: 'Coinbase Wallet',
            description: 'Native Base wallet integration',
            url: 'https://wallet.coinbase.com',
            icon: '💼',
            basenameSupport: true
        },
        {
            name: 'Base Bridge',
            description: 'Bridge assets to Base network',
            url: 'https://bridge.base.org',
            icon: '🌉',
            basenameSupport: false
        }
    ]

    return (
        <div className="base-ecosystem-integration">
            <h3>Base Ecosystem</h3>
            <p>Your reputation and Basename work across the entire Base ecosystem</p>
            
            <div className="ecosystem-apps">
                {ecosystemApps.map((app) => (
                    <div key={app.name} className="ecosystem-app">
                        <div className="app-info">
                            <span className="app-icon">{app.icon}</span>
                            <div className="app-details">
                                <h4>{app.name}</h4>
                                <p>{app.description}</p>
                            </div>
                        </div>
                        <div className="app-features">
                            {app.basenameSupport && basename && (
                                <span className="feature-badge">Basename Ready</span>
                            )}
                            <a
                                href={app.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-visit"
                            >
                                Visit
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}