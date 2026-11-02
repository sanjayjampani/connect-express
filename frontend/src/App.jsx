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
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (!saved) {
      document.documentElement.setAttribute('data-theme', 'dark')
      return 'dark'
    }
    document.documentElement.setAttribute('data-theme', saved)
    return saved
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="app-root">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {!isHomePage && (
        <div className="bg-container">
          <div className="bg-aurora"></div>
          <div className="bg-grid"></div>
          <div className="bg-tracks">
            <div className="track-line"></div>
          </div>
        </div>
      )}

      <div className={isHomePage ? "" : "app"}>
        {!isHomePage && !isAuthPage && (
          <header className="header">
            <Link to="/" className="logo-link">
              <div className="logo small">
                <span className="logo-icon">🚄</span>
                <h1>Connect Express</h1>
              </div>
            </Link>
          </header>
        )}

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
