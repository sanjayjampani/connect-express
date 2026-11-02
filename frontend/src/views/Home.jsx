import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Home.css'

function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
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
        <div className="home-logo">🚄 Connect Express</div>
        <div className="auth-buttons">
          {user ? (
            <>
              <span className="user-greeting">👋 Hi, {user.name}</span>
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
          <span className="status-dot pulse-green"></span>
          <span className="status-label">SYS_READY</span>
        </div>
        <div className="status-item">
          <span className="status-value">58</span>
          <span className="status-label">STATIONS_ACTIVE</span>
        </div>
        <div className="status-item">
          <span className="status-value">159</span>
          <span className="status-label">TRAINS</span>
        </div>
        <div className="status-item mobile-hide">
          <span className="status-label">AUTH_STABLE</span>
        </div>
      </div>

      <div className="home-content">
        <div className="hero-badge">Next-Gen Railway Routing</div>
        <h1 className="hero-title">
          Connect <span className="highlight">Express</span>
        </h1>
        <p className="hero-subtitle">
          High-performance neural routing engine. Optimized for real-time link analysis and multi-modal journey synthesis across the entire network.
        </p>

        <div className="cta-group">
          <button
            className="cta-primary"
            onClick={() => user ? navigate('/search') : navigate('/login')}
          >
            {user ? 'INITIALIZE RESEARCH_' : 'SIGN IN TO START'}
          </button>
          {!user && (
            <button
              className="cta-secondary"
              onClick={() => navigate('/signup')}
            >
              CREATE ACCOUNT
            </button>
          )}

          <div className="live-stats">
            <div className="stat-pill">
              <span className="stat-label">ROUTES</span>
              <span className="stat-count">53</span>
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
            <h3>Neural Engine</h3>
            <p className="mono-text">Real-time route optimization using advanced A* heuristics and parallel data processing.</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon-box">🔗</div>
          <div className="feature-text">
            <h3>Smart Links</h3>
            <p className="mono-text">Dynamic connection synthesis for complex, multi-station trajectories with zero overhead.</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon-box">🏙️</div>
          <div className="feature-text">
            <h3>Matrix Sync</h3>
            <p className="mono-text">Seamless synchronization across all national nodes and regional transit layers.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
