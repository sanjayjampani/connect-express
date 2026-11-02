import { useState, useEffect, useMemo } from 'react'
import SearchForm from '../components/SearchForm'
import ResultCard from '../components/ResultCard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api'
const RECENT_SEARCHES_KEY = 'connectExpress_recentSearches'
const STATIONS_CACHE_KEY = 'connectExpress_stations'
const STATIONS_CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours
const MAX_RECENT_SEARCHES = 5

function clockKey(time, day = 1) {
  const [h, m] = time.split(':').map(Number)
  return (day - 1) * 1440 + h * 60 + m
}

function Search() {
  const [stations, setStations] = useState([])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchParams, setSearchParams] = useState({ from: '', to: '' })
  const [sortBy, setSortBy] = useState('duration')
  const [recentSearches, setRecentSearches] = useState([])

  useEffect(() => {
    fetchStations()
    loadRecentSearches()
  }, [])

  const loadRecentSearches = () => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (saved) {
        setRecentSearches(JSON.parse(saved))
      }
    } catch (err) {
      console.error('Error loading recent searches:', err)
    }
  }

  const saveRecentSearch = (from, to) => {
    const newSearch = { from, to, timestamp: Date.now() }
    const updated = [
      newSearch,
      ...recentSearches.filter(s => !(s.from === from && s.to === to))
    ].slice(0, MAX_RECENT_SEARCHES)
    
    setRecentSearches(updated)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  }

  const fetchStations = async () => {
    // Try to load from cache first
    try {
      const cached = localStorage.getItem(STATIONS_CACHE_KEY)
      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        const isExpired = Date.now() - timestamp > STATIONS_CACHE_EXPIRY
        if (!isExpired && data && data.length > 0) {
          setStations(data)
          console.log('📦 Stations loaded from cache')
          return
        }
      }
    } catch (err) {
      console.error('Error reading stations cache:', err)
    }

    // Fetch from API if no valid cache
    try {
      const response = await fetch(`${API_URL}/stations`)
      const data = await response.json()
      if (data.success) {
        setStations(data.data)
        // Cache the stations
        localStorage.setItem(STATIONS_CACHE_KEY, JSON.stringify({
          data: data.data,
          timestamp: Date.now()
        }))
        console.log('🌐 Stations fetched from API and cached')
      }
    } catch (err) {
      console.error('Error fetching stations:', err)
    }
  }

  const handleSearch = async (from, to) => {
    setLoading(true)
    setError(null)
    setResults(null)
    setSearchParams({ from, to })
    saveRecentSearch(from, to)

    try {
      const response = await fetch(`${API_URL}/search?from=${from}&to=${to}`)
      const data = await response.json()
      
      if (data.success) {
        setResults(data)
      } else {
        setError(data.error || 'Search failed')
      }
    } catch (err) {
      setError('Unable to connect to server. Make sure the backend is running.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStationName = (code) => {
    const station = stations.find(s => s.code === code)
    return station ? station.name : code
  }

  // Sort results based on selected option
  const sortedResults = useMemo(() => {
    if (!results) return null

    const sortRoutes = (routes, type) => {
      return [...routes].sort((a, b) => {
        if (sortBy === 'departure') {
          const stopA = type === 'direct' ? a.from : a.train1.from
          const stopB = type === 'direct' ? b.from : b.train1.from
          return clockKey(stopA.departureTime, stopA.day) - clockKey(stopB.departureTime, stopB.day)
        }
        if (sortBy === 'arrival') {
          const stopA = type === 'direct' ? a.to : a.train2.to
          const stopB = type === 'direct' ? b.to : b.train2.to
          return clockKey(stopA.arrivalTime, stopA.day) - clockKey(stopB.arrivalTime, stopB.day)
        }
        return (type === 'direct' ? a.duration : a.totalDuration) -
               (type === 'direct' ? b.duration : b.totalDuration)
      })
    }

    return {
      ...results,
      results: {
        direct: sortRoutes(results.results.direct, 'direct'),
        connecting: sortRoutes(results.results.connecting, 'connecting')
      }
    }
  }, [results, sortBy])

  return (
    <div className="app">
      <section className="search-section">
        <SearchForm 
          stations={stations} 
          onSearch={handleSearch} 
          loading={loading}
        />
        
        {/* Recent Searches */}
        {recentSearches.length > 0 && !results && !loading && (
          <div className="recent-searches">
            <div className="recent-header">
              <span className="recent-title">🕐 Recent Searches</span>
              <button 
                className="clear-recent-btn" 
                onClick={clearRecentSearches}
                title="Clear history"
              >
                ✕
              </button>
            </div>
            <div className="recent-list">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  className="recent-item"
                  onClick={() => handleSearch(search.from, search.to)}
                >
                  <span className="recent-route">
                    {getStationName(search.from)} → {getStationName(search.to)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
      </section>

      {loading && (
        <div className="loading-container">
          <div className="train-track-loader">
            <div className="train-loader"></div>
          </div>
          <p className="loading-text">Optimizing routes...</p>
        </div>
      )}

      {sortedResults && !loading && (
        <section className="results-section">
          <div className="results-header">
            <h2 className="results-title">
              {getStationName(searchParams.from)} <span className="arrow">→</span> {getStationName(searchParams.to)}
            </h2>
            <div className="results-controls">
              <div className="results-summary">
                <span className="summary-badge direct">
                  {sortedResults.directCount} Direct
                </span>
                <span className="summary-badge connecting">
                  {sortedResults.connectingCount} Connecting
                </span>
              </div>
              <div className="sort-dropdown">
                <label htmlFor="sort">Sort by:</label>
                <select 
                  id="sort" 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="duration">⏱️ Duration</option>
                  <option value="departure">🚀 Departure Time</option>
                  <option value="arrival">📍 Arrival Time</option>
                </select>
              </div>
            </div>
          </div>

          {sortedResults.directCount === 0 && sortedResults.connectingCount === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No routes found</h3>
              <p>Try searching between different stations</p>
            </div>
          ) : (
            <div className="result-cards">
              {sortedResults.results.direct.map((route, index) => (
                <ResultCard 
                  key={`direct-${index}`} 
                  route={route}
                  getStationName={getStationName}
                />
              ))}

              {sortedResults.results.direct.length > 0 && sortedResults.results.connecting.length > 0 && (
                <div className="section-divider">
                  <span>Connecting Routes</span>
                </div>
              )}

              {sortedResults.results.connecting.map((route, index) => (
                <ResultCard 
                  key={`connecting-${index}`} 
                  route={route}
                  getStationName={getStationName}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default Search
