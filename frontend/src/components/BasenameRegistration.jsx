import { useState } from 'react'
import { isBasenameAvailable } from '../utils/basenames'
import './components.css'

export function BasenameRegistration({ account, chainId }) {
  const [searchName, setSearchName] = useState('')
  const [isAvailable, setIsAvailable] = useState(null)
  const [loading, setLoading] = useState(false)

  const checkAvailability = async () => {
    if (!searchName.trim()) return

    setLoading(true)
    try {
      const available = await isBasenameAvailable(searchName.toLowerCase(), chainId)
      setIsAvailable(available)
    } catch (error) {
      console.error('Error checking availability:', error)
      setIsAvailable(null)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = () => {
    // Open Basenames registration page
    const baseUrl = chainId === 8453 
      ? 'https://www.base.org/names' 
      : 'https://www.base.org/names'
    
    window.open(`${baseUrl}?name=${searchName.toLowerCase()}`, '_blank')
  }

  return (
    <div className="basename-registration">
      <h3>🏷️ Get Your Basename</h3>
      <p>Claim a human-readable name for your address</p>
      
      <div className="basename-search">
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Enter desired name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="basename-input"
          />
          <span className="basename-suffix">.base.eth</span>
        </div>
        
        <button 
          onClick={checkAvailability}
          disabled={loading || !searchName.trim()}
          className="btn-check"
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
      </div>

      {isAvailable !== null && (
        <div className={`availability-result ${isAvailable ? 'available' : 'unavailable'}`}>
          {isAvailable ? (
            <>
              <div className="result-text">
                ✅ {searchName.toLowerCase()}.base.eth is available!
              </div>
              <button onClick={handleRegister} className="btn-register">
                Register on Base.org
              </button>
            </>
          ) : (
            <div className="result-text">
              ❌ {searchName.toLowerCase()}.base.eth is already taken
            </div>
          )}
        </div>
      )}
    </div>
  )
}