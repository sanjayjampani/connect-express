import { useEffect, useState } from 'react'

function SearchForm({ stations, onSearch, onSentence, loading, picked, onSavedTrips, savedOpen }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sentence, setSentence] = useState('')

  useEffect(() => {
    if (!picked) return
    setFrom(picked.from)
    setTo(picked.to)
  }, [picked])

  const handleSubmit = (e) => {
    e.preventDefault()
    const text = sentence.trim()
    if (text) {
      onSentence(text)
      return
    }
    if (from && to && from !== to) {
      onSearch(from, to)
    }
  }

  const handleSwap = () => {
    const temp = from
    setFrom(to)
    setTo(temp)
  }

  const sentenceReady = sentence.trim().length > 0

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="sentence">Type a trip</label>
        <div className="input-wrapper">
          <span className="input-icon">✎</span>
          <input
            id="sentence"
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            placeholder="Tirupati Main to Chirala after 6pm"
            maxLength={200}
          />
        </div>
      </div>
      <div className="form-inputs">
        <div className="form-group">
          <label htmlFor="from">Origin Station</label>
          <div className="input-wrapper">
            <span className="input-icon">🏁</span>
            <select
              id="from"
              value={from}
              onChange={(e) => { setFrom(e.target.value); setSentence('') }}
              required={!sentenceReady}
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
              onChange={(e) => { setTo(e.target.value); setSentence('') }}
              required={!sentenceReady}
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
          disabled={loading || (!sentenceReady && (!from || !to || from === to))}
        >
          {loading ? 'Calculating...' : '🚀 Search Routes'}
        </button>
        <button
          type="button"
          className={`saved-trips-btn${savedOpen ? ' open' : ''}`}
          onClick={onSavedTrips}
        >
          Saved trips
        </button>
      </div>
    </form>
  )
}

export default SearchForm
