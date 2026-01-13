import { useEffect } from 'react'
import './ExplanationModal.css'

function ExplanationModal({ question, onClose }) {
  // Parse explanation text and extract image if present
  const parseExplanation = (explanation) => {
    if (!explanation) return { text: '', image: null }

    if (explanation.includes('||IMAGE:')) {
      const parts = explanation.split('||IMAGE:')
      return {
        text: parts[0].trim(),
        image: parts[1].trim()
      }
    }

    return { text: explanation, image: null }
  }

  const { text: explanationText, image: explanationImage } = parseExplanation(question.explanation)

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Закрити"
        >
          ✕
        </button>

        <h2 id="modal-title" className="modal-title">
          Принцип доступності пояснено
        </h2>

        <div className="modal-body">
          <h3>{question.text}</h3>

          {explanationText && (
            <div className="explanation-section">
              <h4>Чому це важливо:</h4>
              <p>{explanationText}</p>
              {explanationImage && (
                <div className="explanation-image">
                  <img
                    src={`/${explanationImage}.jpg`}
                    alt="Ілюстрація до питання"
                    style={{ maxWidth: '100%', height: 'auto', marginTop: '1rem', borderRadius: '8px' }}
                    onError={(e) => {
                      // Fallback to .png if .jpg doesn't exist
                      e.target.src = `/${explanationImage}.png`
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {question.categories && question.categories.length > 0 && (
            <div className="affected-categories">
              <h4>Стосується категорій:</h4>
              <div className="category-tags">
                {question.categories.map((cat, index) => (
                  <span key={index} className="category-tag">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* POUR Principles illustration */}
          <div className="pour-principles">
            <h4>POUR принципи доступності</h4>
            <div className="pour-grid">
              <div className="pour-item">
                <div className="pour-icon perceivable">
                  👁️
                </div>
                <span>Perceivable</span>
                <small>Сприйматливий</small>
              </div>
              <div className="pour-item">
                <div className="pour-icon operable">
                  👆
                </div>
                <span>Operable</span>
                <small>Керований</small>
              </div>
              <div className="pour-item">
                <div className="pour-icon understandable">
                  🧠
                </div>
                <span>Understandable</span>
                <small>Зрозумілий</small>
              </div>
              <div className="pour-item">
                <div className="pour-icon robust">
                  💪
                </div>
                <span>Robust</span>
                <small>Надійний</small>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Закрити теорію
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Продовжити
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExplanationModal
