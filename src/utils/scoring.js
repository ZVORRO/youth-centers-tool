/**
 * Scoring Algorithm for Youth Centers Accessibility Assessment
 *
 * Calculates accessibility scores based on:
 * - User answers to accessibility questions
 * - Categories affected by each question
 * - Recommendation triggers (negative answers)
 */

/**
 * Calculate overall and detailed accessibility scores
 * @param {Object} answers - Map of questionId -> answer
 * @param {Object} questionsData - Full questions data from JSON
 * @returns {Object} Scoring results with overall, bySection, and byCategory scores
 */
export function calculateScores(answers, questionsData) {
  // Get all accessibility questions
  const accessibilityQuestions = getAllAccessibilityQuestions(questionsData)

  // Initialize score tracking
  const categoryScores = {}
  const sectionScores = {}

  // Process each accessibility question
  accessibilityQuestions.forEach(({ question, sectionId, sectionTitle }) => {
    const answer = answers[question.id]
    if (!answer) return // Skip unanswered questions

    // Check if answer triggers a recommendation (indicates an issue)
    const hasIssue = isNegativeAnswer(answer, question)

    // Update scores for each affected category
    question.categories.forEach(categoryId => {
      if (!categoryScores[categoryId]) {
        categoryScores[categoryId] = {
          total: 0,
          positive: 0,
          issues: []
        }
      }

      categoryScores[categoryId].total++
      if (!hasIssue) {
        categoryScores[categoryId].positive++
      } else {
        categoryScores[categoryId].issues.push({
          questionId: question.id,
          questionText: question.text,
          answer: answer,
          sectionTitle: sectionTitle
        })
      }
    })

    // Update section scores
    if (!sectionScores[sectionId]) {
      sectionScores[sectionId] = {
        title: sectionTitle,
        total: 0,
        positive: 0
      }
    }

    sectionScores[sectionId].total++
    if (!hasIssue) {
      sectionScores[sectionId].positive++
    }
  })

  // Calculate percentages
  const categoryResults = {}
  Object.entries(categoryScores).forEach(([categoryId, data]) => {
    const percentage = Math.round((data.positive / data.total) * 100)
    categoryResults[categoryId] = {
      score: percentage,
      total: data.total,
      positive: data.positive,
      issues: data.issues,
      level: getScoreLevel(percentage)
    }
  })

  const sectionResults = {}
  Object.entries(sectionScores).forEach(([sectionId, data]) => {
    const percentage = Math.round((data.positive / data.total) * 100)
    sectionResults[sectionId] = {
      title: data.title,
      score: percentage,
      total: data.total,
      positive: data.positive,
      level: getScoreLevel(percentage)
    }
  })

  // Calculate overall score (average of all category scores)
  const overallScore = calculateOverallScore(categoryResults)

  return {
    overall: {
      score: overallScore,
      level: getScoreLevel(overallScore),
      description: getScoreDescription(overallScore)
    },
    byCategory: categoryResults,
    bySection: sectionResults,
    totalQuestions: accessibilityQuestions.length,
    answeredQuestions: Object.keys(answers).length
  }
}

/**
 * Get all accessibility questions from all sections
 */
function getAllAccessibilityQuestions(questionsData) {
  const questions = []

  questionsData.sections.forEach(section => {
    section.subsections.forEach(subsection => {
      subsection.questions.forEach(question => {
        if (question.isAccessibilityQuestion) {
          questions.push({
            question,
            sectionId: section.id,
            sectionTitle: section.title,
            subsectionTitle: subsection.title
          })
        }
      })
    })
  })

  return questions
}

/**
 * Check if answer triggers a recommendation (negative answer)
 */
function isNegativeAnswer(answer, question) {
  if (!question.recommendationTrigger || question.recommendationTrigger.length === 0) {
    // If no trigger defined, assume any answer is positive
    return false
  }

  // Handle matrix type answers (object with row -> column mapping)
  if (question.type === 'matrix' && typeof answer === 'object' && !answer.main && !Array.isArray(answer)) {
    // For matrix, check if ANY row has a negative answer
    const values = Object.values(answer)
    return values.some(value => question.recommendationTrigger.includes(value))
  }

  // Handle different answer types
  if (typeof answer === 'string') {
    return question.recommendationTrigger.includes(answer)
  }

  if (typeof answer === 'object' && answer.main) {
    return question.recommendationTrigger.includes(answer.main)
  }

  if (Array.isArray(answer)) {
    // For checkbox questions, check if any selected option is negative
    return answer.some(a => question.recommendationTrigger.includes(a))
  }

  return false
}

/**
 * Get score level (High, Medium, Low)
 */
function getScoreLevel(percentage) {
  if (percentage >= 80) return 'high'
  if (percentage >= 50) return 'medium'
  return 'low'
}

/**
 * Get score description
 */
function getScoreDescription(percentage) {
  if (percentage >= 80) {
    return 'Ваш молодіжний центр демонструє сильну відданість доступності, але деякі зони можуть бути покращені.'
  }
  if (percentage >= 50) {
    return 'Ваш молодіжний центр має базовий рівень доступності, але є значні можливості для покращення.'
  }
  return 'Ваш молодіжний центр потребує суттєвих покращень у доступності для забезпечення інклюзивності.'
}

/**
 * Calculate overall score (weighted average)
 */
function calculateOverallScore(categoryResults) {
  const scores = Object.values(categoryResults).map(c => c.score)
  if (scores.length === 0) return 0

  const sum = scores.reduce((acc, score) => acc + score, 0)
  return Math.round(sum / scores.length)
}

/**
 * Get user-friendly category name
 */
export function getCategoryName(categoryId, userCategories) {
  return userCategories[categoryId]?.name || categoryId
}

/**
 * Get score color
 */
export function getScoreColor(level) {
  const colors = {
    high: '#59BA47',    // Success green
    medium: '#FDB714',  // Warning yellow
    low: '#EE402D'      // Error red
  }
  return colors[level] || colors.low
}

/**
 * Get score label
 */
export function getScoreLabel(level) {
  const labels = {
    high: 'Висока доступність',
    medium: 'Середня доступність',
    low: 'Низька доступність'
  }
  return labels[level] || labels.low
}
