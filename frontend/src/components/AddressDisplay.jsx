import { useBasename } from '../hooks/useBasename'
import { formatAddressWithBasename, shortenBasename } from '../utils/basename'

/**
 * Component to display an address with its Basename if available
 */
export function AddressDisplay({ 
  address, 
  provider, 
  showFull = false, 
  className = '',
  showCopy = false 
}) {
  const { basename, loading } = useBasename(address, provider)

  const displayName = showFull 
    ? formatAddressWithBasename(address, basename)
    : formatAddressWithBasename(address, basename ? shortenBasename(basename) : null)

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address)
    }
  }

  if (loading) {
    return (
      <span className={`address-display loading ${className}`}>
        <span className="loading-shimmer">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
        </span>
      </span>
    )
  }

  return (
    <span className={`address-display ${basename ? 'has-basename' : ''} ${className}`}>
      <span className="address-text" title={address}>
        {displayName}
      </span>
      {basename && (
        <span className="basename-indicator" title="This address has a Basename">
          🏷️
        </span>
      )}
      {showCopy && address && (
        <button 
          className="copy-button" 
          onClick={handleCopy}
          title="Copy address"
        >
          📋
        </button>
      )}
    </span>
  )
}

/**
 * Component for displaying user avatar with Basename support
 */
export function UserAvatar({ 
  address, 
  provider, 
  size = 'medium',
  showBasename = true 
}) {
  const { basename } = useBasename(address, provider)
  
  const getInitials = () => {
    if (basename) {
      const name = basename.split('.')[0]
      return name.slice(0, 2).toUpperCase()
    }
    return address ? address.slice(2, 4).toUpperCase() : '??'
  }

  const sizeClass = {
    small: 'avatar-small',
    medium: 'avatar-medium', 
    large: 'avatar-large'
  }[size] || 'avatar-medium'

  return (
    <div className={`user-avatar ${sizeClass}`}>
      <div className="avatar-circle">
        {getInitials()}
      </div>
      {showBasename && basename && (
        <div className="avatar-basename">
          {shortenBasename(basename)}
        </div>
      )}
    </div>
  )
}