import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/ModeSelection.css'

function ModeSelection() {
  const navigate = useNavigate()
  const [selectedMode, setSelectedMode] = useState(null)

  const handleContinue = () => {
    if (selectedMode) {
      // Save mode to localStorage
      localStorage.setItem('assessment_mode', selectedMode)

      // Start with first section
      navigate('/assessment/section1')
    }
  }

  return (
    <div className="mode-selection-page" id="main-content" tabIndex="-1">
      <div className="container">
        <div className="mode-selection-content">
          <h1 className="mode-title">Оберіть режим оцінювання</h1>
          <p className="mode-subtitle">
            Виберіть рівень деталізації, який вам підходить
          </p>

          <div className="mode-cards">
            {/* Mode with explanations */}
            <div
              className={`mode-card ${selectedMode === 'with-explanations' ? 'mode-card-selected' : ''}`}
              onClick={() => setSelectedMode('with-explanations')}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedMode('with-explanations')
                }
              }}
            >
              <div className="mode-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2>З поясненнями</h2>
              <p>
                Рекомендується для першого проходження. Кожне питання містить детальні
                пояснення, приклади та рекомендації щодо стандартів доступності.
              </p>
              <ul className="mode-features">
                <li>Детальні пояснення до кожного питання</li>
                <li>Посилання на стандарти та норми</li>
                <li>Приклади правильної реалізації</li>
                <li>Час проходження: 45-60 хвилин</li>
              </ul>
              {selectedMode === 'with-explanations' && (
                <div className="mode-checkmark">✓</div>
              )}
            </div>

            {/* Mode without explanations */}
            <div
              className={`mode-card ${selectedMode === 'without-explanations' ? 'mode-card-selected' : ''}`}
              onClick={() => setSelectedMode('without-explanations')}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSelectedMode('without-explanations')
                }
              }}
            >
              <div className="mode-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2>Без пояснень</h2>
              <p>
                Швидкий режим для досвідчених користувачів або повторного оцінювання.
                Тільки питання без додаткових пояснень.
              </p>
              <ul className="mode-features">
                <li>Лише питання без пояснень</li>
                <li>Швидке проходження</li>
                <li>Підходить для повторної оцінки</li>
                <li>Час проходження: 30-40 хвилин</li>
              </ul>
              {selectedMode === 'without-explanations' && (
                <div className="mode-checkmark">✓</div>
              )}
            </div>
          </div>

          <div className="mode-footer">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/instructions')}
            >
              ← Назад
            </button>
            <button
              className={`btn btn-primary ${!selectedMode ? 'btn-disabled' : ''}`}
              onClick={handleContinue}
              disabled={!selectedMode}
            >
              Почати оцінювання
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModeSelection
