import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAssessment } from '../context/AssessmentContext'
import QuestionRenderer from '../components/QuestionRenderer'
import ExplanationModal from '../components/ExplanationModal'
import Section3Instruction from '../components/Section3Instruction'
import UserCategoriesDisplay from '../components/UserCategoriesDisplay'
import '../styles/Assessment.css'

function Assessment() {
  const { sectionId } = useParams()
  const navigate = useNavigate()
  const {
    getCurrentQuestion,
    getCurrentSubsection,
    getSectionProgress,
    saveAnswer,
    getAnswer,
    nextQuestion,
    previousQuestion,
    currentSection,
    startAssessment,
    mode,
    questionsData,
    nextSection
  } = useAssessment()

  const [showExplanationModal, setShowExplanationModal] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [showSection3Instruction, setShowSection3Instruction] = useState(false)
  const [modeChecked, setModeChecked] = useState(false)

  useEffect(() => {
    // Give time for mode to load from localStorage
    const checkMode = setTimeout(() => {
      if (!mode) {
        // Double-check localStorage directly as fallback
        const savedMode = localStorage.getItem('assessment_mode')
        if (!savedMode) {
          navigate('/mode-selection')
          return
        }
      }
      setModeChecked(true)
    }, 100)

    return () => clearTimeout(checkMode)
  }, [mode, navigate])

  useEffect(() => {
    // Only proceed if mode is checked
    if (!modeChecked) return

    // Start assessment if section changed
    if (currentSection !== sectionId) {
      startAssessment(sectionId)
    }

    // Check if we should show Section 3 instruction
    if (sectionId === 'section3') {
      const hasSeenInstruction = localStorage.getItem('section3InstructionSeen')
      if (!hasSeenInstruction) {
        setShowSection3Instruction(true)
      }
    }
  }, [modeChecked, sectionId, currentSection, startAssessment])

  const question = getCurrentQuestion()
  const subsection = getCurrentSubsection()
  const progress = getSectionProgress()
  const currentAnswer = question ? getAnswer(question.id) : null

  const section = questionsData?.sections.find(s => s.id === sectionId)

  const handleAnswerChange = (answer) => {
    if (question) {
      saveAnswer(question.id, answer)
      setValidationError('')
    }
  }

  const validateAnswer = () => {
    if (!question) return true

    if (question.required) {
      // Handle array answers (checkbox)
      if (Array.isArray(currentAnswer)) {
        if (currentAnswer.length === 0) {
          setValidationError('Це питання є обов\'язковим для відповіді')
          return false
        }
        return true
      }

      // Handle matrix answers
      if (question.type === 'matrix') {
        if (!currentAnswer || typeof currentAnswer !== 'object') {
          setValidationError('Це питання є обов\'язковим для відповіді')
          return false
        }
        // Check if all rows are answered
        const rows = question.rows || []
        const answeredRows = Object.keys(currentAnswer)
        if (answeredRows.length < rows.length) {
          setValidationError(`Будь ласка, дайте відповідь на всі рядки (${answeredRows.length}/${rows.length})`)
          return false
        }
        return true
      }

      // Handle object answers (radio with conditional)
      if (typeof currentAnswer === 'object' && currentAnswer !== null) {
        // Check if it's a radio with conditional field
        if ('main' in currentAnswer) {
          if (!currentAnswer.main) {
            setValidationError('Це питання є обов\'язковим для відповіді')
            return false
          }

          // Check conditional field
          if (question.conditionalField && currentAnswer.main === question.conditionalField.trigger) {
            if (!currentAnswer.conditional || currentAnswer.conditional === '') {
              setValidationError('Будь ласка, заповніть додаткове поле')
              return false
            }
          }
          return true
        }
        // If it's just an object but not matrix or conditional, it might be valid
        return true
      }

      // Handle string/number answers
      if (!currentAnswer || currentAnswer === '') {
        setValidationError('Це питання є обов\'язковим для відповіді')
        return false
      }
    }

    return true
  }

  const handleNext = () => {
    // Debug logging
    console.log('Question:', question?.id, question?.type)
    console.log('Current Answer:', currentAnswer)
    console.log('Is Array?', Array.isArray(currentAnswer))
    console.log('Validation result:', validateAnswer())

    if (!validateAnswer()) {
      return
    }

    const hasMore = nextQuestion()
    if (!hasMore) {
      // End of section - show completion screen
      navigate(`/section-complete/${sectionId}`)
    }
  }

  const handlePrevious = () => {
    previousQuestion()
    setValidationError('')
  }

  const handleLeave = () => {
    if (window.confirm('Ваш прогрес буде збережено. Ви впевнені, що хочете вийти?')) {
      navigate('/')
    }
  }

  const handleContinueFromSection3Instruction = () => {
    localStorage.setItem('section3InstructionSeen', 'true')
    setShowSection3Instruction(false)
  }

  if (!question || !section) {
    return (
      <div className="assessment-page">
        <div className="container">
          <p>Завантаження...</p>
        </div>
      </div>
    )
  }

  // Show Section 3 instruction if needed
  if (showSection3Instruction) {
    return <Section3Instruction onContinue={handleContinueFromSection3Instruction} />
  }

  const showExplanations = mode === 'with-explanations'

  return (
    <div className="assessment-page" id="main-content" tabIndex="-1">
      {/* Header with progress */}
      <div className="assessment-header">
        <div className="container">
          <div className="header-top">
            <div className="progress-info">
              <span className="question-counter">
                Питання {progress.current} з {progress.total}
              </span>
            </div>
            <button
              className="btn-leave"
              onClick={handleLeave}
              aria-label="Вийти з оцінювання"
            >
              Вийти
            </button>
          </div>

          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${progress.percentage}%` }}
              role="progressbar"
              aria-valuenow={progress.percentage}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>

          {/* Breadcrumb */}
          {subsection && (
            <div className="breadcrumb">
              {section.title} → {subsection.title}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="assessment-main">
        <div className="container">
          {/* Tell me details button */}
          {showExplanations && question.explanation && !showExplanationModal && (
            <div className="detail-buttons">
              <button
                className="btn btn-primary btn-details"
                onClick={() => setShowExplanationModal(true)}
              >
                💡 Розкажи детальніше
              </button>
            </div>
          )}

          {/* Question */}
          <QuestionRenderer
            question={question}
            value={currentAnswer}
            onChange={handleAnswerChange}
            showExplanation={showExplanations}
          />

          {/* Validation error */}
          {validationError && (
            <div className="validation-error" role="alert">
              ⚠️ {validationError}
            </div>
          )}

          {/* Navigation */}
          <div className="assessment-navigation">
            <button
              className="btn btn-secondary"
              onClick={handlePrevious}
              disabled={progress.current === 1}
            >
              ← Назад
            </button>
            <button
              className="btn btn-primary"
              onClick={handleNext}
            >
              {progress.current === progress.total ? 'Завершити розділ' : 'Далі'} →
            </button>
          </div>

          {/* User Categories Display */}
          {question.categories && <UserCategoriesDisplay categories={question.categories} />}
        </div>
      </div>

      {/* Explanation Modal */}
      {showExplanationModal && (
        <ExplanationModal
          question={question}
          onClose={() => setShowExplanationModal(false)}
        />
      )}
    </div>
  )
}

export default Assessment
