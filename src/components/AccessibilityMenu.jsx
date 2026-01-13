import { useState } from 'react'
import { useAccessibility } from '../context/AccessibilityContext'
import ReadingRuler from './ReadingRuler'
import './AccessibilityMenu.css'

function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    settings,
    cycleContrastMode,
    increaseFontSize,
    decreaseFontSize,
    increaseLetterSpacing,
    decreaseLetterSpacing,
    toggleReadingRuler,
    resetSettings
  } = useAccessibility()

  const getContrastModeLabel = () => {
    switch (settings.contrastMode) {
      case 'normal':
        return 'Звичайний'
      case 'dark':
        return 'Темний контраст'
      case 'light':
        return 'Світлий контраст'
      default:
        return 'Звичайний'
    }
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      {/* Floating Eye Button */}
      <button
        className="accessibility-toggle"
        onClick={toggleMenu}
        aria-label="Налаштування доступності"
        title="Налаштування доступності"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
            fill="white"
          />
        </svg>
      </button>

      {/* Accessibility Menu */}
      {isOpen && (
        <div className="accessibility-menu">
          <div className="accessibility-menu-header">
            <h3>Налаштування доступності</h3>
            <button
              className="close-button"
              onClick={toggleMenu}
              aria-label="Закрити меню"
            >
              ✕
            </button>
          </div>

          <div className="accessibility-menu-content">
            {/* Contrast Mode */}
            <div className="accessibility-option">
              <div className="option-header">
                <span className="option-icon">🎨</span>
                <span className="option-label">Контрастний режим</span>
              </div>
              <button
                className={`option-toggle ${settings.contrastMode !== 'normal' ? 'active' : ''}`}
                onClick={cycleContrastMode}
                aria-label="Змінити контрастний режим"
              >
                {getContrastModeLabel()}
              </button>
            </div>

            {/* Font Size */}
            <div className="accessibility-option">
              <div className="option-header">
                <span className="option-icon">🔤</span>
                <span className="option-label">Розмір шрифту: {settings.fontSize}%</span>
              </div>
              <div className="option-controls">
                <button
                  className="control-button"
                  onClick={decreaseFontSize}
                  disabled={settings.fontSize <= 80}
                  aria-label="Зменшити шрифт"
                >
                  A−
                </button>
                <button
                  className="control-button"
                  onClick={increaseFontSize}
                  disabled={settings.fontSize >= 150}
                  aria-label="Збільшити шрифт"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Letter Spacing */}
            <div className="accessibility-option">
              <div className="option-header">
                <span className="option-icon">📏</span>
                <span className="option-label">
                  Відстань між літерами: {settings.letterSpacing}px
                </span>
              </div>
              <div className="option-controls">
                <button
                  className="control-button"
                  onClick={decreaseLetterSpacing}
                  disabled={settings.letterSpacing <= 0}
                  aria-label="Зменшити відстань"
                >
                  −
                </button>
                <button
                  className="control-button"
                  onClick={increaseLetterSpacing}
                  disabled={settings.letterSpacing >= 5}
                  aria-label="Збільшити відстань"
                >
                  +
                </button>
              </div>
            </div>

            {/* Reading Ruler */}
            <div className="accessibility-option">
              <div className="option-header">
                <span className="option-icon">📖</span>
                <span className="option-label">Лінійка для читання</span>
              </div>
              <button
                className={`option-toggle ${settings.readingRuler ? 'active' : ''}`}
                onClick={toggleReadingRuler}
                aria-pressed={settings.readingRuler}
              >
                {settings.readingRuler ? 'Увімкнено' : 'Вимкнено'}
              </button>
            </div>

            {/* Reset Button */}
            <button className="reset-button" onClick={resetSettings}>
              🔄 Скинути всі налаштування
            </button>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && <div className="accessibility-overlay" onClick={toggleMenu} />}

      {/* Reading Ruler */}
      {settings.readingRuler && <ReadingRuler />}
    </>
  )
}

export default AccessibilityMenu
