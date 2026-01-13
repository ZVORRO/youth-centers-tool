import { createContext, useContext, useState, useEffect } from 'react'

const AccessibilityContext = createContext()

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider')
  }
  return context
}

export function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState({
    contrastMode: 'normal', // 'normal' | 'dark' | 'light'
    fontSize: 100, // percentage
    letterSpacing: 0, // pixels
    readingRuler: false
  })

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('accessibilitySettings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)

        // Migrate old format (highContrast: boolean) to new format (contrastMode: string)
        if ('highContrast' in parsed && !('contrastMode' in parsed)) {
          parsed.contrastMode = parsed.highContrast ? 'dark' : 'normal'
          delete parsed.highContrast
        }

        setSettings(parsed)
      } catch (error) {
        console.error('Failed to load accessibility settings:', error)
        // Clear corrupted data
        localStorage.removeItem('accessibilitySettings')
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings))
  }, [settings])

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement

    // Contrast modes
    root.classList.remove('high-contrast-dark', 'high-contrast-light')
    if (settings.contrastMode === 'dark') {
      root.classList.add('high-contrast-dark')
    } else if (settings.contrastMode === 'light') {
      root.classList.add('high-contrast-light')
    }

    // Font size
    root.style.fontSize = `${settings.fontSize}%`

    // Letter spacing
    if (settings.letterSpacing > 0) {
      root.style.letterSpacing = `${settings.letterSpacing}px`
    } else {
      root.style.letterSpacing = 'normal'
    }
  }, [settings])

  const cycleContrastMode = () => {
    setSettings(prev => {
      const modes = ['normal', 'dark', 'light']
      const currentIndex = modes.indexOf(prev.contrastMode)
      const nextIndex = (currentIndex + 1) % modes.length
      return { ...prev, contrastMode: modes[nextIndex] }
    })
  }

  const increaseFontSize = () => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.min(prev.fontSize + 10, 150)
    }))
  }

  const decreaseFontSize = () => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.max(prev.fontSize - 10, 80)
    }))
  }

  const increaseLetterSpacing = () => {
    setSettings(prev => ({
      ...prev,
      letterSpacing: Math.min(prev.letterSpacing + 1, 5)
    }))
  }

  const decreaseLetterSpacing = () => {
    setSettings(prev => ({
      ...prev,
      letterSpacing: Math.max(prev.letterSpacing - 1, 0)
    }))
  }

  const toggleReadingRuler = () => {
    setSettings(prev => ({ ...prev, readingRuler: !prev.readingRuler }))
  }

  const resetSettings = () => {
    setSettings({
      contrastMode: 'normal',
      fontSize: 100,
      letterSpacing: 0,
      readingRuler: false
    })
  }

  const value = {
    settings,
    cycleContrastMode,
    increaseFontSize,
    decreaseFontSize,
    increaseLetterSpacing,
    decreaseLetterSpacing,
    toggleReadingRuler,
    resetSettings
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}
