import { createContext, useContext, useState, useEffect } from 'react'
import questionsData from '../data/questions.json'

const AssessmentContext = createContext()

export function AssessmentProvider({ children }) {
  const [answers, setAnswers] = useState({})
  const [currentSection, setCurrentSection] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [mode, setMode] = useState(null)
  const [assessmentStarted, setAssessmentStarted] = useState(false)

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedAnswers = localStorage.getItem('assessment_answers')
    const savedProgress = localStorage.getItem('assessment_progress')
    const savedMode = localStorage.getItem('assessment_mode')

    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers))
    }

    if (savedProgress) {
      const progress = JSON.parse(savedProgress)
      setCurrentSection(progress.sectionId)
      setCurrentQuestionIndex(progress.questionIndex || 0)
      setAssessmentStarted(true)
    }

    if (savedMode) {
      setMode(savedMode)
    }
  }, [])

  // Save answers to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem('assessment_answers', JSON.stringify(answers))
    }
  }, [answers])

  // Save progress to localStorage
  useEffect(() => {
    if (currentSection) {
      localStorage.setItem('assessment_progress', JSON.stringify({
        sectionId: currentSection,
        questionIndex: currentQuestionIndex
      }))
    }
  }, [currentSection, currentQuestionIndex])

  const saveAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const getAnswer = (questionId) => {
    return answers[questionId]
  }

  const startAssessment = (sectionId) => {
    setCurrentSection(sectionId)
    setCurrentQuestionIndex(0)
    setAssessmentStarted(true)
  }

  const nextQuestion = () => {
    const section = questionsData.sections.find(s => s.id === currentSection)
    if (!section) return false

    // Get all questions from all subsections in current section
    const allQuestions = section.subsections.flatMap(sub => sub.questions)

    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      return true
    }

    return false // End of section
  }

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      return true
    }
    return false
  }

  const getCurrentQuestion = () => {
    const section = questionsData.sections.find(s => s.id === currentSection)
    if (!section) return null

    const allQuestions = section.subsections.flatMap(sub => sub.questions)
    return allQuestions[currentQuestionIndex]
  }

  const getCurrentSubsection = () => {
    const section = questionsData.sections.find(s => s.id === currentSection)
    if (!section) return null

    let questionCount = 0
    for (const subsection of section.subsections) {
      questionCount += subsection.questions.length
      if (currentQuestionIndex < questionCount) {
        return subsection
      }
    }
    return null
  }

  const getSectionProgress = () => {
    const section = questionsData.sections.find(s => s.id === currentSection)
    if (!section) return { current: 0, total: 0, percentage: 0 }

    const allQuestions = section.subsections.flatMap(sub => sub.questions)
    const total = allQuestions.length
    const current = currentQuestionIndex + 1
    const percentage = Math.round((current / total) * 100)

    return { current, total, percentage }
  }

  const getOverallProgress = () => {
    const totalQuestions = questionsData.sections.flatMap(
      section => section.subsections.flatMap(sub => sub.questions)
    ).length

    const answeredQuestions = Object.keys(answers).length
    const percentage = Math.round((answeredQuestions / totalQuestions) * 100)

    return { answered: answeredQuestions, total: totalQuestions, percentage }
  }

  const nextSection = () => {
    const currentIndex = questionsData.sections.findIndex(s => s.id === currentSection)
    if (currentIndex < questionsData.sections.length - 1) {
      const nextSec = questionsData.sections[currentIndex + 1]
      setCurrentSection(nextSec.id)
      setCurrentQuestionIndex(0)
      return true
    }
    return false // Assessment complete
  }

  const resetAssessment = () => {
    setAnswers({})
    setCurrentSection(null)
    setCurrentQuestionIndex(0)
    setAssessmentStarted(false)
    localStorage.removeItem('assessment_answers')
    localStorage.removeItem('assessment_progress')
    localStorage.removeItem('assessment_mode')
  }

  const value = {
    // State
    answers,
    currentSection,
    currentQuestionIndex,
    mode,
    assessmentStarted,
    questionsData,

    // Actions
    saveAnswer,
    getAnswer,
    startAssessment,
    nextQuestion,
    previousQuestion,
    getCurrentQuestion,
    getCurrentSubsection,
    getSectionProgress,
    getOverallProgress,
    nextSection,
    resetAssessment,
    setMode
  }

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  )
}

export function useAssessment() {
  const context = useContext(AssessmentContext)
  if (!context) {
    throw new Error('useAssessment must be used within AssessmentProvider')
  }
  return context
}
