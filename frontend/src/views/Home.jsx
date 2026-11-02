import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Home.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api'

function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [counts, setCounts] = useState({ stations: '', trains: '' })

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    fetch(`${API_URL}/stations`)
      .then(response => response.json())
      .then(data => {
        if (data.success) setCounts({ stations: data.count, trains: data.trainCount })
      })
      .catch(() => {})
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('connectExpress_recentSearches')
    setUser(null)
  }

  return (
    <div className="home-container">
      <div className="video-overlay"></div>
      <div className="tech-grid-overlay"></div>
      <video
        autoPlay
        muted
        loop
        playsInline
        className="hero-video"
      >
        <source src="https://player.vimeo.com/external/370331493.sd.mp4?s=7b9015c9ac0207fa6c048bce9302c019744c8034&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="home-header">
        <div className="home-logo"><span className="train-slot"><span className="train">🚄</span></span> Connect Express</div>
        <div className="auth-buttons">
          {user ? (
            <>
              <span className="user-greeting"><span className="wave">👋</span> Hi, {user.name}</span>
              <button className="auth-link logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-link">Sign In</Link>
              <Link to="/signup" className="auth-link primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>

      <div className="network-status-bar">
        <div className="status-item">
          <span className="status-value">{counts.stations}</span>
          <span className="status-label">STATIONS</span>
        </div>
        <div className="status-item">
          <span className="status-value">{counts.trains}</span>
          <span className="status-label">TRAINS</span>
        </div>
      </div>

      <div className="home-content">
        <div className="hero-badge">Direct or one change</div>
        <h1 className="hero-title">
          Connect <span className="highlight">Express</span>
        </h1>
        <p className="hero-subtitle">
          Find a direct train, or one change of train, between stations in Tamil Nadu, Karnataka, and Andhra Pradesh.
        </p>

        <div className="cta-group">
          <button
            className="cta-primary"
            onClick={() => navigate('/search')}
          >
            Search
          </button>

          <div className="live-stats">
            <div className="stat-pill">
              <span className="stat-label">AS OF</span>
              <span className="stat-count">Aug 2026</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">MIN_LAYOVER</span>
              <span className="stat-count">60m</span>
            </div>
            <div className="stat-pill">
              <span className="stat-label">MAX_LAYOVER</span>
              <span className="stat-count">12h</span>
            </div>
          </div>
        </div>
      </div>

      <div className="home-features">
        <div className="feature-item">
          <div className="feature-icon-box">⚡</div>
          <div className="feature-text">
            <h3>Direct</h3>
            <p className="mono-text">A train that stops at both stations, in that order.</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon-box">🔗</div>
          <div className="feature-text">
            <h3>One change</h3>
            <p className="mono-text">Get off and board another train. The wait has to be between 1 and 12 hours.</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon-box">🏙️</div>
          <div className="feature-text">
            <h3>Sign in</h3>
            <p className="mono-text">Email and password. Search works either way.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
