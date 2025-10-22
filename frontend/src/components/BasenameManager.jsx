import { useState, useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { useBasename, useBasenameResolver } from '../hooks/useBasename'
import { isBasenameAvailable, resolveBasename } from '../utils/basenames'

export function BasenameManager() {
    const { address } = useAccount()
    const chainId = useChainId()
    const { basename, loading: basenameLoading } = useBasename(address, chainId)
    const { resolveAddress, loading: resolveLoading } = useBasenameResolver()
    
    const [searchBasename, setSearchBasename] = useState('')
    const [searchResult, setSearchResult] = useState(null)
    const [availabilityCheck, setAvailabilityCheck] = useState(null)
    const [isChecking, setIsChecking] = useState(false)

    const handleSearch = async () => {
        if (!searchBasename.trim()) return

        setIsChecking(true)
        try {
            const [available, resolvedAddress] = await Promise.all([
                isBasenameAvailable(searchBasename, chainId),
                resolveBasename(searchBasename, chainId)
            ])

            setAvailabilityCheck(available)
            setSearchResult({
                basename: searchBasename,
                available,
                resolvedAddress
            })
        } catch (error) {
            console.error('Error searching basename:', error)
            setSearchResult({
                basename: searchBasename,
                error: error.message
            })
        } finally {
            setIsChecking(false)
        }
    }

    const handleResolveAddress = async (inputAddress) => {
        try {
            const resolved = await resolveAddress(inputAddress, chainId)
            return resolved
        } catch (error) {
            console.error('Error resolving address:', error)
            return null
        }
    }

    return (
        <div className="basename-manager">
            <div className="basename-section">
                <h3>Your Basename</h3>
                {basenameLoading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <span>Loading your basename...</span>
                    </div>
                ) : basename ? (
                    <div className="basename-found">
                        <div className="basename-display">
                            <span className="basename-name">{basename}</span>
                            <span className="basename-domain">.base.eth</span>
                        </div>
                        <div className="basename-actions">
                            <button
                                onClick={() => navigator.clipboard.writeText(basename)}
                                className="btn-copy"
                            >
                                Copy Basename
                            </button>
                            <a
                                href={`https://www.base.org/names/${basename}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-view"
                            >
                                View on Base
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="basename-not-found">
                        <p>You don't have a Basename yet</p>
                        <a
                            href="https://www.base.org/names"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-get-basename"
                        >
                            Get Your Basename
                        </a>
                    </div>
                )}
            </div>

            <div className="basename-search">
                <h3>Search Basenames</h3>
                <div className="search-form">
                    <div className="search-input-group">
                        <input
                            type="text"
                            value={searchBasename}
                            onChange={(e) => setSearchBasename(e.target.value)}
                            placeholder="Enter basename (without .base.eth)"
                            className="search-input"
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <span className="input-suffix">.base.eth</span>
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={isChecking || !searchBasename.trim()}
                        className="btn-search"
                    >
                        {isChecking ? 'Checking...' : 'Search'}
                    </button>
                </div>

                {searchResult && (
                    <div className="search-results">
                        {searchResult.error ? (
                            <div className="result-error">
                                <span className="error-icon">❌</span>
                                <span>Error: {searchResult.error}</span>
                            </div>
                        ) : (
                            <div className="result-success">
                                <div className="result-header">
                                    <span className="basename-searched">
                                        {searchResult.basename}.base.eth
                                    </span>
                                    <span className={`availability-badge ${searchResult.available ? 'available' : 'taken'}`}>
                                        {searchResult.available ? 'Available' : 'Taken'}
                                    </span>
                                </div>
                                
                                {!searchResult.available && searchResult.resolvedAddress && (
                                    <div className="owner-info">
                                        <span className="owner-label">Owned by:</span>
                                        <span className="owner-address">
                                            {searchResult.resolvedAddress.slice(0, 6)}...
                                            {searchResult.resolvedAddress.slice(-4)}
                                        </span>
                                    </div>
                                )}

                                {searchResult.available && (
                                    <div className="register-action">
                                        <a
                                            href={`https://www.base.org/names/${searchResult.basename}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-register"
                                        >
                                            Register This Name
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="basename-benefits">
                <h3>Basename Benefits</h3>
                <div className="benefits-list">
                    <div className="benefit-item">
                        <div className="benefit-icon">🎯</div>
                        <div className="benefit-content">
                            <h4>Easy Identity</h4>
                            <p>Replace long addresses with memorable names</p>
                        </div>
                    </div>
                    <div className="benefit-item">
                        <div className="benefit-icon">🏆</div>
                        <div className="benefit-content">
                            <h4>Reputation Boost</h4>
                            <p>Having a Basename adds credibility to your profile</p>
                        </div>
                    </div>
                    <div className="benefit-item">
                        <div className="benefit-icon">🔗</div>
                        <div className="benefit-content">
                            <h4>Cross-Platform</h4>
                            <p>Use your Basename across all Base ecosystem apps</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function BasenameCard({ address, showActions = false }) {
    const chainId = useChainId()
    const { basename, loading } = useBasename(address, chainId)

    if (loading) {
        return (
            <div className="basename-card loading">
                <div className="spinner"></div>
            </div>
        )
    }

    return (
        <div className="basename-card">
            {basename ? (
                <div className="basename-info">
                    <div className="basename-display">
                        <span className="basename-name">{basename}</span>
                        <span className="basename-domain">.base.eth</span>
                    </div>
                    {showActions && (
                        <div className="basename-actions">
                            <button
                                onClick={() => navigator.clipboard.writeText(basename)}
                                className="btn-copy-small"
                                title="Copy basename"
                            >
                                📋
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="no-basename">
                    <span className="address-fallback">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                </div>
            )}
        </div>
    )
}