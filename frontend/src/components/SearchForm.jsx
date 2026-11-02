import { useState } from 'react'

function SearchForm({ stations, onSearch, loading }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (from && to && from !== to) {
      onSearch(from, to)
    }
  }

  const handleSwap = () => {
    const temp = from
    setFrom(to)
    setTo(temp)
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="form-inputs">
        <div className="form-group">
          <label htmlFor="from">Origin Station</label>
          <div className="input-wrapper">
            <span className="input-icon">🏁</span>
            <select
              id="from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
            >
              <option value="">Select origin</option>
              {stations.map((station) => (
                <option key={station.code} value={station.code}>
                  {station.name} ({station.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          className="swap-btn"
          onClick={handleSwap}
          title="Swap stations"
          disabled={!from && !to}
        >
          ⇄
        </button>

        <div className="form-group">
          <label htmlFor="to">Destination Station</label>
          <div className="input-wrapper">
            <span className="input-icon">📍</span>
            <select
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            >
              <option value="">Select destination</option>
              {stations.map((station) => (
                <option key={`to-${station.code}`} value={station.code}>
                  {station.name} ({station.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="search-actions">
        <button
          type="submit"
          className="search-btn"
          disabled={loading || !from || !to || from === to}
        >
          {loading ? 'Calculating...' : '🚀 Search Routes'}
        </button>
      </div>
    </form>
  )
}

export default SearchForm
