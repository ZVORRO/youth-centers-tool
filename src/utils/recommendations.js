/**
 * Recommendations Generator
 *
 * Generates specific recommendations based on user answers
 * that triggered recommendation triggers (negative answers)
 */

/**
 * Generate recommendations for each category
 * @param {Object} categoryScores - Scores by category from scoring.js
 * @param {Object} userCategories - User categories from questions.json
 * @param {Object} questionsData - Full questions data
 * @returns {Array} Array of recommendations grouped by category
 */
export function generateRecommendations(categoryScores, userCategories, questionsData) {
  const recommendations = []

  Object.entries(categoryScores).forEach(([categoryId, scoreData]) => {
    if (scoreData.issues.length === 0) return

    const categoryName = userCategories[categoryId]?.name || categoryId
    const categoryRecommendations = {
      categoryId,
      categoryName,
      score: scoreData.score,
      level: scoreData.level,
      issueCount: scoreData.issues.length,
      recommendations: []
    }

    // Generate specific recommendations for each issue
    scoreData.issues.forEach(issue => {
      const question = findQuestion(issue.questionId, questionsData)
      if (!question) return

      const recommendation = {
        priority: getPriority(scoreData.score),
        area: issue.sectionTitle,
        issue: issue.questionText,
        currentState: formatAnswer(issue.answer),
        recommendation: generateRecommendationText(question, issue.answer),
        explanation: question.explanation || ''
      }

      categoryRecommendations.recommendations.push(recommendation)
    })

    recommendations.push(categoryRecommendations)
  })

  // Sort by score (lowest first - highest priority)
  recommendations.sort((a, b) => a.score - b.score)

  return recommendations
}

/**
 * Find question by ID in questions data
 */
function findQuestion(questionId, questionsData) {
  for (const section of questionsData.sections) {
    for (const subsection of section.subsections) {
      const question = subsection.questions.find(q => q.id === questionId)
      if (question) return question
    }
  }
  return null
}

/**
 * Get priority level based on score
 */
function getPriority(score) {
  if (score < 50) return 'Критично'
  if (score < 80) return 'Важливо'
  return 'Рекомендовано'
}

/**
 * Format answer for display
 */
function formatAnswer(answer) {
  if (typeof answer === 'string') return answer
  if (typeof answer === 'object' && answer.main) {
    return answer.conditional
      ? `${answer.main} (${answer.conditional})`
      : answer.main
  }
  if (Array.isArray(answer)) return answer.join(', ')
  return String(answer)
}

/**
 * Generate recommendation text based on question and answer
 */
function generateRecommendationText(question, answer) {
  // Generic recommendations based on common patterns
  const questionText = question.text.toLowerCase()

  // Physical accessibility
  if (questionText.includes('пандус')) {
    return 'Встановіть нормативний пандус з поручнями відповідно до ДБН В.2.2-17:2006. Кут нахилу не більше 4,5°, ширина мінімум 1,2 м.'
  }

  if (questionText.includes('двер') || questionText.includes('вхід')) {
    return 'Забезпечте мінімальну ширину дверних прорізів 90 см. Встановіть дверні ручки натискного типу на висоті 80-110 см.'
  }

  if (questionText.includes('поручн')) {
    return 'Встановіть поручні на висоті 0,7 та 0,9 м з обох сторін. Поручні мають бути круглими (діаметр 40-45 мм), контрастного кольору.'
  }

  if (questionText.includes('освітлен')) {
    return 'Забезпечте достатнє освітлення (мінімум 200 люкс) у всіх зонах. Уникайте бліків та різких тіней.'
  }

  // Information accessibility
  if (questionText.includes('табличк') || questionText.includes('навігац')) {
    return 'Розмістіть контрастні таблички на висоті 1,5 м. Дублюйте інформацію шрифтом Брайля та піктограмами.'
  }

  if (questionText.includes('брайл')) {
    return 'Додайте тактильні таблички зі шрифтом Брайля до всіх інформаційних елементів відповідно до ДСТУ ISO 17049:2016.'
  }

  if (questionText.includes('піктограм') || questionText.includes('іконк')) {
    return 'Використовуйте універсальні піктограми відповідно до ISO 7001. Розмір піктограм мінімум 10x10 см.'
  }

  // Signage
  if (questionText.includes('контраст')) {
    return 'Забезпечте коефіцієнт контрастності мінімум 4,5:1 для тексту та 3:1 для великих елементів (WCAG 2.1 AA).'
  }

  // Communication
  if (questionText.includes('сурдоперекладач') || questionText.includes('слух')) {
    return 'Організуйте послуги сурдоперекладача або відеозв\'язок з сурдоперекладачем для заходів.'
  }

  if (questionText.includes('англійськ') || questionText.includes('мов')) {
    return 'Додайте англомовний переклад до всієї ключової інформації (вивіски, правила, програми).'
  }

  // General accessibility
  if (questionText.includes('туалет') || questionText.includes('санвузол')) {
    return 'Обладнайте мінімум один санвузол для людей з інвалідністю: простір 1,8x2,2 м, поручні, дзеркало на висоті 90 см.'
  }

  if (questionText.includes('паркування') || questionText.includes('паркомісц')) {
    return 'Виділіть 10% паркомісць (мінімум 1) для людей з інвалідністю. Розмір: 3,5x5 м, розмітка синім кольором, знак 6.3.1.'
  }

  // Default recommendation
  return 'Впровадьте зміни відповідно до ДБН В.2.2-17:2006 та Конвенції про права осіб з інвалідністю. Проконсультуйтеся з експертами з доступності.'
}

/**
 * Get summary recommendations (top priorities)
 */
export function getSummaryRecommendations(recommendations) {
  const allRecommendations = recommendations.flatMap(cat =>
    cat.recommendations.map(rec => ({
      ...rec,
      categoryName: cat.categoryName
    }))
  )

  // Sort by priority and take top 5
  const priorityOrder = { 'Критично': 0, 'Важливо': 1, 'Рекомендовано': 2 }
  allRecommendations.sort((a, b) =>
    priorityOrder[a.priority] - priorityOrder[b.priority]
  )

  return allRecommendations.slice(0, 5)
}
