import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'
import Home from './views/Home'
import Search from './views/Search'
import Login from './views/Login'
import Signup from './views/Signup'

function App() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  const isAuthPage = ['/login', '/signup', '/signin', '/register'].includes(location.pathname)
  const showBar = !isHomePage && !isAuthPage

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (!saved) {
      document.documentElement.setAttribute('data-theme', 'dark')
      return 'dark'
    }
    document.documentElement.setAttribute('data-theme', saved)
    return saved
  })
  const [user, setUser] = useState(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser) {
      setUser(null)
      return
    }
    try {
      setUser(JSON.parse(savedUser))
    } catch {
      setUser(null)
    }
  }, [location])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('connectExpress_recentSearches')
    setUser(null)
    window.dispatchEvent(new Event('auth-change'))
  }

  return (
    <div className={`app-root${isHomePage ? ' home' : ''}${showBar ? ' has-bar' : ''}`}>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {showBar && (
        <header className="home-header">
          <Link to="/" className="home-logo"><span className="train-slot"><span className="train">🚄</span></span> Connect Express</Link>
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
        </header>
      )}

      {!isHomePage && (
        <div className="bg-container">
          <div className="bg-aurora"></div>
          <div className="bg-grid"></div>
          <div className="bg-tracks">
            <div className="track-line"></div>
          </div>
        </div>
      )}

      <div className={isHomePage ? '' : `app${showBar ? ' with-bar' : ''}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register" element={<Signup />} />
        </Routes>
      </div>

      {!isHomePage && (
        <footer className="footer">
          <p>&copy; 2026 Connect Express. Engineered for speed.</p>
        </footer>
      )}
    </div>
  )
}

export default App
