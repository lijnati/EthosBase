import { useState } from 'react'
import { ethers } from 'ethers'

const REPUTATION_ABI = [
    'function setBasename(string basename)',
    'function getUserBasename(address user) view returns (string)'
]

export function BasenameManager({
    account,
    provider,
    contractAddress,
    userBasename,
    onBasenameUpdated
}) {
    const [newBasename, setNewBasename] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const handleSetBasename = async () => {
        if (!newBasename.trim() || !provider || !account) return

        try {
            setIsUpdating(true)
            setError(null)
            setSuccess(false)

            const signer = await provider.getSigner()
            const contract = new ethers.Contract(contractAddress, REPUTATION_ABI, signer)

            // Validate basename format
            if (!newBasename.endsWith('.base.eth')) {
                throw new Error('Basename must end with .base.eth')
            }

            const tx = await contract.setBasename(newBasename)
            await tx.wait()

            setSuccess(true)
            setNewBasename('')

            // Notify parent component
            if (onBasenameUpdated) {
                onBasenameUpdated(newBasename)
            }

        } catch (err) {
            console.error('Error setting basename:', err)
            setError(err.message || 'Failed to set basename')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleGetBasename = () => {
        window.open('https://www.base.org/names', '_blank')
    }

    return (
        <div className="basename-manager">
            <div className="basename-header">
                <h3>🏷️ Basename Integration</h3>
                <p>Link your .base.eth name to your reputation profile</p>
            </div>

            {userBasename ? (
                <div className="current-basename">
                    <div className="basename-display">
                        <span className="basename-icon">✅</span>
                        <span className="basename-text">{userBasename}</span>
                    </div>
                    <p className="basename-status">Your Basename is linked to this account</p>
                </div>
            ) : (
                <div className="no-basename">
                    <div className="basename-prompt">
                        <span className="prompt-icon">💡</span>
                        <span>No Basename linked yet</span>
                    </div>
                </div>
            )}

            <div className="basename-actions">
                {!userBasename && (
                    <div className="get-basename-section">
                        <p>Don't have a Basename yet?</p>
                        <button
                            onClick={handleGetBasename}
                            className="btn-get-basename"
                        >
                            Get Your .base.eth Name
                        </button>
                    </div>
                )}

                <div className="set-basename-section">
                    <div className="input-group">
                        <input
                            type="text"
                            value={newBasename}
                            onChange={(e) => setNewBasename(e.target.value)}
                            placeholder="yourname.base.eth"
                            className="basename-input"
                            disabled={isUpdating}
                        />
                        <button
                            onClick={handleSetBasename}
                            disabled={!newBasename.trim() || isUpdating}
                            className="btn-set-basename"
                        >
                            {isUpdating ? 'Setting...' : userBasename ? 'Update' : 'Link Basename'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="basename-error">
                        <span className="error-icon">❌</span>
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="basename-success">
                        <span className="success-icon">✅</span>
                        <span>Basename updated successfully!</span>
                    </div>
                )}
            </div>

            {/* <div className="basename-benefits">
                <h4>Benefits of linking your Basename:</h4>
                <ul>
                    <li>🎯 Enhanced profile identity</li>
                    <li>🌐 Cross-protocol recognition</li>
                    <li>🤝 Easier to find and connect</li>
                    <li>🏆 Professional DeFi presence</li>
                </ul>
            </div> */}
        </div>
    )
}