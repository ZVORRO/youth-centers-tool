import { useParams, useNavigate } from 'react-router-dom'
import { useAssessment } from '../context/AssessmentContext'
import '../styles/SectionComplete.css'

function SectionComplete() {
  const { sectionId } = useParams()
  const navigate = useNavigate()
  const { questionsData, nextSection, getOverallProgress } = useAssessment()

  const currentIndex = questionsData.sections.findIndex(s => s.id === sectionId)
  const completedSections = currentIndex + 1
  const totalSections = questionsData.sections.length
  const overallProgress = getOverallProgress()

  const handleContinue = () => {
    const hasNextSection = nextSection()
    if (hasNextSection) {
      // Get next section ID
      const nextSec = questionsData.sections[currentIndex + 1]
      navigate(`/assessment/${nextSec.id}`)
    } else {
      // All sections complete - go to results
      navigate('/results')
    }
  }

  const handleSaveAndExit = () => {
    navigate('/')
  }

  return (
    <div className="section-complete-page" id="main-content" tabIndex="-1">
      <div className="container">
        <div className="complete-content">
          {/* Progress indicators */}
          <div className="section-progress-indicators">
            {questionsData.sections.map((_, index) => (
              <div
                key={index}
                className={`progress-indicator ${index < completedSections ? 'completed' : ''}`}
              />
            ))}
          </div>

          <p className="progress-text">
            {completedSections} з {totalSections} розділів завершено
          </p>

          {/* Success illustration */}
          <div className="success-illustration">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Trophy illustration */}
              <circle cx="100" cy="100" r="80" fill="#E8F4FC" />
              <path d="M100 140C116.569 140 130 126.569 130 110C130 93.4315 116.569 80 100 80C83.4315 80 70 93.4315 70 110C70 126.569 83.4315 140 100 140Z" fill="#FF8B7B" />
              <path d="M85 95L95 105L115 85" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="90" y="135" width="20" height="30" rx="2" fill="#6B7CFF" />
              <ellipse cx="100" cy="167" rx="20" ry="5" fill="#6B7CFF" />
            </svg>
          </div>

          <h1 className="complete-title">Розділ завершено!</h1>
          <p className="complete-subtitle">Чудова робота!</p>

          <div className="overall-progress-info">
            <p>Загальний прогрес: <strong>{overallProgress.percentage}%</strong></p>
            <p className="small-text">
              {overallProgress.answered} з {overallProgress.total} питань відповіли
            </p>
          </div>

          <div className="complete-actions">
            <button
              className="btn btn-secondary btn-large"
              onClick={handleSaveAndExit}
            >
              Зберегти і вийти
            </button>
            <button
              className="btn btn-primary btn-large"
              onClick={handleContinue}
            >
              {completedSections < totalSections
                ? 'Продовжити до наступного розділу'
                : 'Переглянути результати'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SectionComplete
