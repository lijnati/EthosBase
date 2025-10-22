import { useState } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { BaseAccountProfile, BaseAccountBenefits, BaseEcosystemIntegration } from './BaseAccountIntegration'
import { BasenameManager } from './BasenameManager'
import { useBasename } from '../hooks/useBasename'

export function BaseIntegrationPage({ reputation, access }) {
    const { address, isConnected } = useAccount()
    const chainId = useChainId()
    const { basename } = useBasename(address, chainId)
    const [activeTab, setActiveTab] = useState('profile')

    if (!isConnected) {
        return (
            <div className="base-integration-page">
                <div className="integration-hero">
                    <h1>Base Account Integration</h1>
                    <p>Connect your wallet to access Base Account features and Basename integration</p>
                </div>
            </div>
        )
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: '👤' },
        { id: 'basename', label: 'Basename', icon: '🏷️' },
        { id: 'benefits', label: 'Benefits', icon: '🎁' },
        { id: 'ecosystem', label: 'Ecosystem', icon: '🌐' }
    ]

    return (
        <div className="base-integration-page">
            <div className="integration-header">
                <h1>Base Account & Basename</h1>
                <p>Manage your Base identity and unlock ecosystem benefits</p>
            </div>

            <div className="integration-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="integration-content">
                {activeTab === 'profile' && (
                    <div className="tab-content">
                        <BaseAccountProfile />
                        
                        <div className="profile-stats-grid">
                            <div className="stat-card">
                                <h3>Reputation Score</h3>
                                <div className="stat-number">{reputation?.total || 0}</div>
                                <div className="stat-tier">{reputation?.tier || 'Unrated'}</div>
                            </div>
                            
                            <div className="stat-card">
                                <h3>Base Identity</h3>
                                <div className="identity-status">
                                    {basename ? (
                                        <div className="has-basename">
                                            <span className="basename-display">{basename}.base.eth</span>
                                            <span className="status-badge verified">Verified</span>
                                        </div>
                                    ) : (
                                        <div className="no-basename">
                                            <span className="status-text">No Basename</span>
                                            <span className="status-badge unverified">Unverified</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="stat-card">
                                <h3>Network</h3>
                                <div className="network-info">
                                    <span className="network-name">
                                        {chainId === 8453 ? 'Base Mainnet' : 'Base Sepolia'}
                                    </span>
                                    <span className="network-status connected">Connected</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'basename' && (
                    <div className="tab-content">
                        <BasenameManager />
                    </div>
                )}

                {activeTab === 'benefits' && (
                    <div className="tab-content">
                        <BaseAccountBenefits reputation={reputation} />
                        
                        <div className="reputation-boost-info">
                            <h3>Reputation Boosts</h3>
                            <p>Enhance your reputation score through Base ecosystem participation:</p>
                            
                            <div className="boost-list">
                                <div className="boost-item">
                                    <div className="boost-icon">🏷️</div>
                                    <div className="boost-details">
                                        <h4>Basename Registration</h4>
                                        <p>Get +25 reputation points for registering a .base.eth name</p>
                                        <div className="boost-status">
                                            {basename ? (
                                                <span className="status-earned">+25 Points Earned</span>
                                            ) : (
                                                <span className="status-available">Available</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="boost-item">
                                    <div className="boost-icon">✅</div>
                                    <div className="boost-details">
                                        <h4>Account Verification</h4>
                                        <p>Verify your account through Base ecosystem apps</p>
                                        <div className="boost-status">
                                            {reputation?.total >= 200 ? (
                                                <span className="status-earned">+50 Points Earned</span>
                                            ) : (
                                                <span className="status-locked">Requires 200+ reputation</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="boost-item">
                                    <div className="boost-icon">🌐</div>
                                    <div className="boost-details">
                                        <h4>Ecosystem Participation</h4>
                                        <p>Active participation in Base DeFi protocols</p>
                                        <div className="boost-status">
                                            {reputation?.total >= 400 ? (
                                                <span className="status-earned">+75 Points Earned</span>
                                            ) : (
                                                <span className="status-locked">Requires 400+ reputation</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'ecosystem' && (
                    <div className="tab-content">
                        <BaseEcosystemIntegration />
                        
                        <div className="integration-benefits">
                            <h3>Cross-Platform Benefits</h3>
                            <p>Your EthosBase reputation and Basename work seamlessly across the Base ecosystem:</p>
                            
                            <div className="benefits-grid">
                                <div className="benefit-card">
                                    <h4>🔄 Automatic Recognition</h4>
                                    <p>Your reputation is automatically recognized by integrated Base apps</p>
                                </div>
                                
                                <div className="benefit-card">
                                    <h4>🎯 Personalized Experience</h4>
                                    <p>Apps can customize features based on your reputation tier</p>
                                </div>
                                
                                <div className="benefit-card">
                                    <h4>💰 Better Rates</h4>
                                    <p>Access preferential rates and terms across DeFi protocols</p>
                                </div>
                                
                                <div className="benefit-card">
                                    <h4>🏆 Exclusive Access</h4>
                                    <p>Unlock premium features and exclusive opportunities</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}