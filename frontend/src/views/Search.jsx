import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchForm from '../components/SearchForm'
import ResultCard from '../components/ResultCard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api'
const RECENT_SEARCHES_KEY = 'connectExpress_recentSearches'
const PENDING_SAVE_KEY = 'connectExpress_pendingSave'
const MAX_RECENT_SEARCHES = 5

function clockKey(time, day = 1) {
  const [h, m] = time.split(':').map(Number)
  return (day - 1) * 1440 + h * 60 + m
}

function bookmarkKey(route) {
  if (route.type === 'direct') {
    return ['direct', route.trainNumber, route.from.stationCode, route.to.stationCode, route.from.departureTime].join(':')
  }
  return ['connecting', route.train1.trainNumber, route.train2.trainNumber, route.connectionStation, route.train2.from.departureTime].join(':')
}

function cardFace(route) {
  if (route.type === 'direct') {
    return [route.from.stationCode, route.from.departureTime, route.to.stationCode, route.to.arrivalTime].join('|')
  }
  return [route.train1.from.stationCode, route.train1.from.departureTime, route.train2.to.stationCode, route.train2.to.arrivalTime].join('|')
}

function Search() {
  const navigate = useNavigate()
  const [stations, setStations] = useState([])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchParams, setSearchParams] = useState({ from: '', to: '' })
  const [picked, setPicked] = useState(null)
  const [sortBy, setSortBy] = useState('duration')
  const [routeFilter, setRouteFilter] = useState('all')
  const [recentSearches, setRecentSearches] = useState([])
  const [bookmarks, setBookmarks] = useState([])
  const [showSaved, setShowSaved] = useState(false)

  useEffect(() => {
    fetchStations()
    loadRecentSearches()
    if (!sessionStorage.getItem(PENDING_SAVE_KEY)) loadBookmarks()
    const onAuth = () => {
      loadRecentSearches()
      setBookmarks([])
      setShowSaved(false)
      loadBookmarks()
    }
    window.addEventListener('auth-change', onAuth)
    return () => window.removeEventListener('auth-change', onAuth)
  }, [])

  const loadBookmarks = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    const response = await fetch(`${API_URL}/auth/bookmarks`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await response.json()
    if (data.success) setBookmarks(data.bookmarks || [])
  }

  const toggleSave = async (route) => {
    const token = localStorage.getItem('token')
    if (!token) {
      sessionStorage.setItem(PENDING_SAVE_KEY, JSON.stringify({
        from: searchParams.from,
        to: searchParams.to,
        route
      }))
      navigate('/login')
      return
    }
    const response = await fetch(`${API_URL}/auth/bookmarks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ route })
    })
    const data = await response.json()
    if (response.status === 401) {
      sessionStorage.setItem(PENDING_SAVE_KEY, JSON.stringify({
        from: searchParams.from,
        to: searchParams.to,
        route
      }))
      navigate('/login')
      return
    }
    if (data.success) setBookmarks(data.bookmarks)
  }

  const loadRecentSearches = () => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
      if (saved) setRecentSearches(JSON.parse(saved))
    } catch (err) {
      console.error('Error loading recent searches:', err)
    }
  }

  const saveRecentSearch = (from, to) => {
    const updated = [
      { from, to, timestamp: Date.now() },
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
    try {
      const response = await fetch(`${API_URL}/stations`)
      const data = await response.json()
      if (data.success) setStations(data.data)
      else setError('Could not load stations')
    } catch (err) {
      setError('Unable to connect to server. Make sure the backend is running.')
    }
  }

  const handleSearch = async (from, to, sentence) => {
    setLoading(true)
    setError(null)
    setResults(null)
    setRouteFilter('all')
    if (!sentence) {
      setSearchParams({ from, to })
      saveRecentSearch(from, to)
    }

    const url = sentence
      ? `${API_URL}/search?q=${encodeURIComponent(sentence)}`
      : `${API_URL}/search?from=${from}&to=${to}`

    try {
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setResults(data)
        setSearchParams({ from: data.from, to: data.to })
        if (sentence) {
          setPicked({ from: data.from, to: data.to })
          saveRecentSearch(data.from, data.to)
        }
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

  useEffect(() => {
    const raw = sessionStorage.getItem(PENDING_SAVE_KEY)
    if (!raw || !localStorage.getItem('token')) return
    sessionStorage.removeItem(PENDING_SAVE_KEY)
    let pending
    try {
      pending = JSON.parse(raw)
    } catch {
      return
    }
    if (pending.from && pending.to) {
      setPicked({ from: pending.from, to: pending.to })
      handleSearch(pending.from, pending.to)
    }
    if (pending.route) toggleSave(pending.route)
  }, [])

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
          onSentence={(text) => handleSearch('', '', text)}
          loading={loading}
          picked={picked}
          savedOpen={showSaved}
          onSavedTrips={() => {
            if (!localStorage.getItem('token')) {
              navigate('/login')
              return
            }
            setShowSaved(open => !open)
          }}
        />
        
        {error && <div className="error-message">{error}</div>}

        {showSaved && (
          <div className="recent-searches">
            <div className="recent-header">
              <span className="recent-title">Saved trips</span>
            </div>
            {bookmarks.length === 0 ? (
              <p className="no-saved">No saved trips</p>
            ) : (
              <div className="result-cards">
                {bookmarks.map((item) => (
                  <ResultCard
                    key={item.key}
                    route={item.route}
                    getStationName={getStationName}
                    saved
                    onToggleSave={toggleSave}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Searches */}
        {stations.length > 0 && recentSearches.some(search => getStationName(search.from) !== search.from && getStationName(search.to) !== search.to) && !results && !loading && (
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
              {recentSearches.map((search, index) => {
                const fromName = getStationName(search.from)
                const toName = getStationName(search.to)
                if (fromName === search.from || toName === search.to) return null
                return (
                  <button
                    key={index}
                    className="recent-item"
                    onClick={() => handleSearch(search.from, search.to)}
                  >
                    <span className="recent-route">
                      {fromName} → {toName}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
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
              {sortedResults.after ? ` · after ${sortedResults.after}` : ''}
            </h2>
            <div className="results-controls">
              <div className="results-summary">
                <button
                  type="button"
                  className={`summary-badge direct${routeFilter === 'connecting' ? ' off' : ''}`}
                  onClick={() => setRouteFilter(current => current === 'direct' ? 'all' : 'direct')}
                >
                  {sortedResults.directCount} Direct
                </button>
                <button
                  type="button"
                  className={`summary-badge connecting${routeFilter === 'direct' ? ' off' : ''}`}
                  onClick={() => setRouteFilter(current => current === 'connecting' ? 'all' : 'connecting')}
                >
                  {sortedResults.connectingCount} Connecting
                </button>
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

          {(() => {
            const direct = routeFilter === 'connecting' ? [] : sortedResults.results.direct
            const connecting = routeFilter === 'direct' ? [] : sortedResults.results.connecting
            const isSaved = (route) => bookmarks.some(item => item.key === bookmarkKey(route))
            const savedDirect = direct.filter(isSaved)
            const savedConnecting = connecting.filter(isSaved)
            const savedFace = new Set([...savedDirect, ...savedConnecting].map(cardFace))
            const otherDirect = direct.filter(route => !isSaved(route) && !savedFace.has(cardFace(route)))
            const otherConnecting = connecting.filter(route => !isSaved(route) && !savedFace.has(cardFace(route)))
            if (direct.length === 0 && connecting.length === 0) {
              return (
                <div className="no-results">
                  <div className="no-results-icon">🔍</div>
                  <h3>No routes found</h3>
                  <p>{sortedResults.after ? `No train leaves at or after ${sortedResults.after}` : 'Try searching between different stations'}</p>
                </div>
              )
            }
            return (
              <div className="result-cards">
                {savedDirect.length + savedConnecting.length > 0 && (
                  <div className="saved-heading">
                    <span>Saved</span>
                  </div>
                )}
                {savedDirect.map((route) => (
                  <ResultCard
                    key={`saved-direct-${route.trainNumber}-${route.from.departureTime}`}
                    route={route}
                    getStationName={getStationName}
                    saved
                    onToggleSave={toggleSave}
                  />
                ))}
                {savedConnecting.map((route) => (
                  <ResultCard
                    key={`saved-connecting-${route.train1.trainNumber}-${route.train2.trainNumber}-${route.connectionStation}-${route.train2.from.departureTime}`}
                    route={route}
                    getStationName={getStationName}
                    saved
                    onToggleSave={toggleSave}
                  />
                ))}
                {savedDirect.length + savedConnecting.length > 0 && <div className="saved-rule" />}

                {otherDirect.map((route) => (
                  <ResultCard
                    key={`direct-${route.trainNumber}-${route.from.departureTime}`}
                    route={route}
                    getStationName={getStationName}
                    saved={false}
                    onToggleSave={toggleSave}
                  />
                ))}

                {otherDirect.length > 0 && otherConnecting.length > 0 && (
                  <div className="section-divider">
                    <span>Connecting Routes</span>
                  </div>
                )}

                {otherConnecting.map((route) => (
                  <ResultCard
                    key={`connecting-${route.train1.trainNumber}-${route.train2.trainNumber}-${route.connectionStation}-${route.train2.from.departureTime}`}
                    route={route}
                    getStationName={getStationName}
                    saved={false}
                    onToggleSave={toggleSave}
                  />
                ))}
              </div>
            )
          })()}
        </section>
      )}
    </div>
  )
}

export default Search
