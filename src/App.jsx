import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AssessmentProvider } from './context/AssessmentContext'
import { AccessibilityProvider } from './context/AccessibilityContext'
import AccessibilityMenu from './components/AccessibilityMenu'
import Landing from './pages/Landing'
import Instructions from './pages/Instructions'
import ModeSelection from './pages/ModeSelection'
import Assessment from './pages/Assessment'
import SectionComplete from './pages/SectionComplete'
import Results from './pages/Results'
import './styles/high-contrast.css'

function AppContent() {
  const location = useLocation()

  useEffect(() => {
    // Handle skip link focus after navigation
    const handleHashChange = () => {
      if (window.location.hash === '#main-content') {
        const mainContent = document.getElementById('main-content')
        if (mainContent) {
          // Scroll to element smoothly
          mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' })
          // Set focus after a brief delay to ensure scroll completes
          setTimeout(() => {
            mainContent.focus({ preventScroll: true })
          }, 100)
        }
      }
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [location])

  // Also handle skip-link clicks directly
  useEffect(() => {
    const handleSkipLinkClick = (e) => {
      const target = e.target
      if (target.classList.contains('skip-link') && target.hash === '#main-content') {
        e.preventDefault()
        const mainContent = document.getElementById('main-content')
        if (mainContent) {
          mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' })
          setTimeout(() => {
            mainContent.focus({ preventScroll: true })
          }, 100)
        }
      }
    }

    document.addEventListener('click', handleSkipLinkClick)
    return () => {
      document.removeEventListener('click', handleSkipLinkClick)
    }
  }, [])

  return (
    <>
      <a href="#main-content" className="skip-link">
        Перейти до основного вмісту
      </a>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/mode-selection" element={<ModeSelection />} />
        <Route path="/assessment/:sectionId" element={<Assessment />} />
        <Route path="/section-complete/:sectionId" element={<SectionComplete />} />
        <Route path="/results" element={<Results />} />
      </Routes>

      <AccessibilityMenu />
    </>
  )
}

function App() {
  return (
    <AccessibilityProvider>
      <AssessmentProvider>
        <Router>
          <AppContent />
        </Router>
      </AssessmentProvider>
    </AccessibilityProvider>
  )
}

export default App
