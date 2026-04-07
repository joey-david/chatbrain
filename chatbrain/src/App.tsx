import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Home } from './components/pages/home'
import { Header } from './components/header'
import { Footer } from './components/footer'
import { Use } from './components/pages/use'
import './App.css'

const RouteGlow = () => {
  const location = useLocation()

  useEffect(() => {
    document.documentElement.dataset.route = location.pathname
  }, [location])

  return (
    <div className="background-container" aria-hidden="true">
      <div className="glow glow-one" />
      <div className="glow glow-two" />
    </div>
  )
}

function App() {
  return (
    <Router>
      <RouteGlow />
      <div id="root" className="app-shell">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/use" element={<Use />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
