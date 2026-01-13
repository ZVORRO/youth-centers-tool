import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAssessment } from '../context/AssessmentContext'
import { calculateScores, getCategoryName, getScoreColor, getScoreLabel } from '../utils/scoring'
import { generateRecommendations, getSummaryRecommendations } from '../utils/recommendations'
import { generateResultsPDF, generateAdminPDF, generateResultsPDFAsBase64, generateAdminPDFAsBase64 } from '../utils/pdfGenerator'
import '../styles/Results.css'

function Results() {
  const navigate = useNavigate()
  const { answers, questionsData, resetAssessment } = useAssessment()
  const [scores, setScores] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailStatus, setEmailStatus] = useState(null) // 'success' | 'error' | null

  const handleSendEmail = useCallback(async () => {
    setIsSendingEmail(true)
    setEmailStatus(null)

    try {
      console.log('Starting email send process...')

      const centerName = answers?.['q1_1'] || answers?.['q1_1_1'] || 'Молодіжний центр'
      const completedAt = new Date().toLocaleString('uk-UA')

      // Step 1: Generate Results PDF
      console.log('Generating Results PDF...')
      const resultsPdfBase64 = await generateResultsPDFAsBase64(answers)
      console.log('Results PDF generated')

      // Step 2: Upload Results PDF to Blob
      console.log('Uploading Results PDF to Blob storage...')
      const uploadResponse1 = await fetch('/api/upload-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfBase64: resultsPdfBase64,
          filename: 'звіт_з_рекомендаціями.pdf',
          centerName
        }),
      })

      const uploadData1 = await uploadResponse1.json()
      if (!uploadResponse1.ok) {
        throw new Error(uploadData1.error || 'Failed to upload Results PDF')
      }

      const resultsPdfUrl = uploadData1.url
      console.log('Results PDF uploaded:', resultsPdfUrl)

      // Step 3: Generate Admin PDF
      console.log('Generating Admin PDF...')
      const adminPdfBase64 = await generateAdminPDFAsBase64(answers, questionsData)
      console.log('Admin PDF generated')

      // Step 4: Upload Admin PDF to Blob
      console.log('Uploading Admin PDF to Blob storage...')
      const uploadResponse2 = await fetch('/api/upload-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfBase64: adminPdfBase64,
          filename: 'повні_відповіді.pdf',
          centerName
        }),
      })

      const uploadData2 = await uploadResponse2.json()
      if (!uploadResponse2.ok) {
        throw new Error(uploadData2.error || 'Failed to upload Admin PDF')
      }

      const adminPdfUrl = uploadData2.url
      console.log('Admin PDF uploaded:', adminPdfUrl)

      // Step 5: Send emails with download links
      console.log('Sending emails with download links...')
      const emailResponse = await fetch('/api/send-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          centerName,
          resultsPdfUrl,
          adminPdfUrl,
          completedAt
        }),
      })

      const emailData = await emailResponse.json()
      if (!emailResponse.ok) {
        throw new Error(emailData.error || 'Failed to send emails')
      }

      console.log('Emails sent successfully:', emailData)

      setEmailStatus('success')
      console.log('Process completed successfully!')
    } catch (error) {
      console.error('Error sending email:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
      setEmailStatus('error')
    } finally {
      setIsSendingEmail(false)
    }
  }, [answers, questionsData])

  useEffect(() => {
    // Check if assessment is complete
    if (Object.keys(answers).length === 0) {
      navigate('/')
      return
    }

    // Calculate scores
    const calculatedScores = calculateScores(answers, questionsData)
    setScores(calculatedScores)

    // Generate recommendations
    const recs = generateRecommendations(
      calculatedScores.byCategory,
      questionsData.userCategories,
      questionsData
    )
    setRecommendations(recs)

    // Automatically send email with results (only once)
    const emailSent = sessionStorage.getItem('emailSent')
    if (!emailSent) {
      // Small delay to ensure page is fully loaded
      setTimeout(() => {
        handleSendEmail()
        sessionStorage.setItem('emailSent', 'true')
      }, 1000)
    }
  }, [answers, questionsData, navigate, handleSendEmail])

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true)

    try {
      await generateResultsPDF(answers)
    } catch (error) {
      console.error('PDF generation error:', error)
      alert('Помилка при генерації PDF. Спробуйте ще раз.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleDownloadAdminPDF = async () => {
    setIsGeneratingPDF(true)

    try {
      await generateAdminPDF(answers, questionsData)
    } catch (error) {
      console.error('Admin PDF generation error:', error)
      alert('Помилка при генерації адміністративного PDF. Спробуйте ще раз.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleStartNew = () => {
    if (window.confirm('Ви впевнені? Всі дані поточного оцінювання будуть видалені.')) {
      resetAssessment()
      navigate('/')
    }
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  if (!scores) {
    return (
      <div className="results-page">
        <div className="container">
          <div className="loading">Обчислюємо результати...</div>
        </div>
      </div>
    )
  }

  const summaryRecommendations = getSummaryRecommendations(recommendations)
  const overallColor = getScoreColor(scores.overall.level)

  return (
    <div className="results-page" id="main-content" tabIndex="-1">
      <div className="container">
        <div id="results-content" className="results-content">
          {/* Header */}
          <div className="results-header">
            <h1>Звіт про доступність</h1>
            <p className="results-subtitle">Молодіжний центр України</p>
          </div>

          {/* Overall Score */}
          <div className="overall-score-section">
            <h2>Загальний рівень доступності</h2>
            <div
              className="score-circle"
              style={{ borderColor: overallColor }}
            >
              <div className="score-number" style={{ color: overallColor }}>
                {scores.overall.score}
              </div>
              <div className="score-percentage">%</div>
            </div>
            <div
              className="score-level-badge"
              style={{ backgroundColor: overallColor }}
            >
              {getScoreLabel(scores.overall.level)}
            </div>
            <p className="score-description">{scores.overall.description}</p>
          </div>

          {/* Section Scores */}
          <div className="section-scores-section">
            <h2>Оцінка за розділами</h2>
            <div className="section-scores-grid">
              {Object.entries(scores.bySection).map(([sectionId, sectionScore]) => (
                <div key={sectionId} className="section-score-card">
                  <h3>{sectionScore.title}</h3>
                  <div className="section-score-bar">
                    <div
                      className="section-score-fill"
                      style={{
                        width: `${sectionScore.score}%`,
                        backgroundColor: getScoreColor(sectionScore.level)
                      }}
                    />
                  </div>
                  <div className="section-score-text">
                    <span className="score-value">{sectionScore.score}%</span>
                    <span className="score-fraction">
                      {sectionScore.positive}/{sectionScore.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Group Breakdown */}
          <div className="category-breakdown-section">
            <h2>Доступність за категоріями користувачів</h2>
            <div className="category-list">
              {Object.entries(scores.byCategory)
                .sort((a, b) => a[1].score - b[1].score)
                .map(([categoryId, categoryScore]) => {
                  const categoryName = getCategoryName(categoryId, questionsData.userCategories)
                  const color = getScoreColor(categoryScore.level)

                  return (
                    <div key={categoryId} className="category-item">
                      <div className="category-header">
                        <span className="category-name">{categoryName}</span>
                        <span
                          className="category-badge"
                          style={{ backgroundColor: color }}
                        >
                          {categoryScore.score}%
                        </span>
                      </div>
                      <div className="category-bar">
                        <div
                          className="category-bar-fill"
                          style={{
                            width: `${categoryScore.score}%`,
                            backgroundColor: color
                          }}
                        />
                      </div>
                      {categoryScore.issues.length > 0 && (
                        <div className="category-issues">
                          <span className="issues-count">
                            {categoryScore.issues.length} проблем виявлено
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Top Recommendations */}
          {summaryRecommendations.length > 0 && (
            <div className="recommendations-section">
              <h2>Топ-5 пріоритетних рекомендацій</h2>
              <div className="recommendations-list">
                {summaryRecommendations.map((rec, index) => (
                  <div key={index} className="recommendation-card">
                    <div className="recommendation-header">
                      <span
                        className={`priority-badge priority-${rec.priority.toLowerCase()}`}
                      >
                        {rec.priority}
                      </span>
                      <span className="recommendation-category">
                        {rec.categoryName}
                      </span>
                    </div>
                    <h4 className="recommendation-issue">{rec.issue}</h4>
                    <p className="recommendation-text">{rec.recommendation}</p>
                    {rec.explanation && (
                      <p className="recommendation-explanation">
                        💡 {rec.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="results-footer">
            <p className="generated-date">
              Згенеровано: {new Date().toLocaleDateString('uk-UA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <p className="undp-credit">
              🤖 Згенеровано за допомогою інструменту оцінки доступності UNDP Ukraine
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="results-actions">
          <button
            className="btn btn-secondary"
            onClick={handleBackToHome}
          >
            Повернутися на головну
          </button>
          <button
            className="btn btn-primary"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF || isSendingEmail}
          >
            {isGeneratingPDF ? 'Генерується...' : '📊 Звіт з рекомендаціями (PDF)'}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleDownloadAdminPDF}
            disabled={isGeneratingPDF || isSendingEmail}
            style={{ backgroundColor: '#059669' }}
          >
            {isGeneratingPDF ? 'Генерується...' : '📋 Повні відповіді (PDF)'}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSendEmail}
            disabled={isGeneratingPDF || isSendingEmail}
            style={{ backgroundColor: '#0468B1' }}
          >
            {isSendingEmail ? '📧 Відправляємо...' : '📧 Відправити на email'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleStartNew}
          >
            Почати нове оцінювання
          </button>
        </div>

        {/* Email status message */}
        {emailStatus && (
          <div className={`email-status ${emailStatus === 'success' ? 'email-success' : 'email-error'}`}>
            {emailStatus === 'success' ? (
              <>
                ✅ Результати успішно відправлено на email адміністратора!
              </>
            ) : (
              <>
                ❌ Помилка при відправці email. Спробуйте ще раз або завантажте PDF вручну.
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Results
