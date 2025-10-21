import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useState } from 'react'

export function WalletConnect() {
    const { address, isConnected } = useAccount()
    const { connect, connectors } = useConnect()
    const { disconnect } = useDisconnect()
    const [showDropdown, setShowDropdown] = useState(false)

    if (isConnected && address) {
        return (
            <div className="wallet-connected">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="wallet-button"
                >
                    <div className="wallet-avatar">
                        {address.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="wallet-address">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                </button>

                {showDropdown && (
                    <div className="wallet-dropdown">
                        <div className="wallet-info">
                            <div className="wallet-full-address">
                                {address}
                            </div>
                            <button
                                onClick={() => navigator.clipboard.writeText(address)}
                                className="copy-button"
                            >
                                Copy Address
                            </button>
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
            {connectors.map((connector) => (
                <button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                    className="connect-button"
                >
                    Connect {connector.name}
                </button>
            ))}
        </div>
    )
}

export function UserIdentity({ address, className }) {
    if (!address) return null

    return (
        <div className={`user-identity ${className || ''}`}>
            <div className="user-avatar">
                {address.slice(0, 2).toUpperCase()}
            </div>
            <span className="user-address">
                {address.slice(0, 6)}...{address.slice(-4)}
            </span>
        </div>
    )
}