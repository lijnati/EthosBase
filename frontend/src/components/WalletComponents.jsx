import { useAccount, useConnect, useDisconnect, useChainId } from 'wagmi'
import { useState } from 'react'
import { Avatar, Name, Identity } from '@coinbase/onchainkit/identity'
import { ConnectWallet } from '@coinbase/onchainkit/wallet'
import { useBasename } from '../hooks/useBasename'
import { formatAddressWithBasename } from '../utils/basenames'

export function WalletConnect() {
    const { address, isConnected } = useAccount()
    const { connect, connectors } = useConnect()
    const { disconnect } = useDisconnect()
    const chainId = useChainId()
    const { basename } = useBasename(address, chainId)
    const [showDropdown, setShowDropdown] = useState(false)

    if (isConnected && address) {
        return (
            <div className="wallet-connected">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="wallet-button"
                >
                    <Identity 
                        address={address}
                        className="identity-compact"
                    >
                        <Avatar className="wallet-avatar" />
                        <Name className="wallet-name" />
                    </Identity>
                </button>

                {showDropdown && (
                    <div className="wallet-dropdown">
                        <div className="wallet-info">
                            <Identity address={address} className="identity-full">
                                <Avatar className="dropdown-avatar" />
                                <div className="identity-details">
                                    <Name className="dropdown-name" />
                                    <div className="wallet-full-address">
                                        {address}
                                    </div>
                                </div>
                            </Identity>
                            
                            <div className="dropdown-actions">
                                <button
                                    onClick={() => navigator.clipboard.writeText(address)}
                                    className="copy-button"
                                >
                                    Copy Address
                                </button>
                                {basename && (
                                    <button
                                        onClick={() => navigator.clipboard.writeText(basename)}
                                        className="copy-button"
                                    >
                                        Copy Basename
                                    </button>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => disconnect()}
                            className="disconnect-button"
                        >
                            Disconnect
                        </button>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="wallet-connect">
            <ConnectWallet className="connect-wallet-onchain">
                <Avatar className="h-6 w-6" />
                <Name />
            </ConnectWallet>
        </div>
    )
}

export function UserIdentity({ address, className, showBasename = true }) {
    const chainId = useChainId()
    const { basename } = useBasename(address, chainId)

    if (!address) return null

    return (
        <div className={`user-identity ${className || ''}`}>
            <Identity address={address}>
                <Avatar className="user-avatar" />
                <div className="user-details">
                    {showBasename && basename ? (
                        <>
                            <Name className="user-basename" />
                            <span className="user-address-secondary">
                                {address.slice(0, 6)}...{address.slice(-4)}
                            </span>
                        </>
                    ) : (
                        <span className="user-address">
                            {address.slice(0, 6)}...{address.slice(-4)}
                        </span>
                    )}
                </div>
            </Identity>
        </div>
    )
}

export function BasenameDisplay({ address, className }) {
    const chainId = useChainId()
    const { basename, loading } = useBasename(address, chainId)

    if (!address) return null

    if (loading) {
        return (
            <div className={`basename-display ${className || ''}`}>
                <div className="basename-loading">Loading...</div>
            </div>
        )
    }

    return (
        <div className={`basename-display ${className || ''}`}>
            {basename ? (
                <div className="basename-found">
                    <span className="basename-name">{basename}</span>
                    <span className="basename-badge">.base.eth</span>
                </div>
            ) : (
                <div className="basename-not-found">
                    <span className="address-fallback">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                </div>
            )}
        </div>
    )
}