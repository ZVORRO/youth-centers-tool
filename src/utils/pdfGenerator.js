import html2pdf from 'html2pdf.js'

/**
 * Generate admin PDF with all answers
 * @param {Object} answers - All user answers
 * @param {Object} questionsData - Questions data
 * @returns {Promise} PDF generation promise
 */
export async function generateAdminPDF(answers, questionsData) {
  // Create temporary container for PDF content
  const container = document.createElement('div')
  container.id = 'admin-pdf-content'
  container.style.padding = '20px'
  container.style.fontFamily = 'Arial, sans-serif'
  container.style.fontSize = '11px'
  container.style.lineHeight = '1.5'

  // Header
  const header = `
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0468B1; padding-bottom: 20px;">
      <h1 style="color: #0468B1; margin: 0 0 10px 0;">Повний звіт відповідей</h1>
      <h2 style="color: #666; margin: 0; font-weight: normal;">Інструмент оцінки доступності молодіжних центрів</h2>
      <p style="color: #999; margin: 10px 0 0 0;">
        Дата: ${new Date().toLocaleDateString('uk-UA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>
  `

  // Build content
  let content = header

  // Loop through all sections
  questionsData.sections.forEach((section, sectionIndex) => {
    content += `
      <div style="page-break-before: ${sectionIndex > 0 ? 'always' : 'auto'}; margin-bottom: 25px;">
        <h2 style="color: #0468B1; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 15px; page-break-after: avoid; page-break-inside: avoid;">
          ${section.title}
        </h2>
    `

    // Loop through subsections
    section.subsections.forEach((subsection, subsectionIndex) => {
      content += `
        <div style="margin-bottom: 18px; page-break-inside: avoid;">
          <h3 style="color: #333; font-size: 12px; margin-bottom: 10px; margin-top: ${subsectionIndex > 0 ? '15px' : '0'}; page-break-after: avoid; page-break-inside: avoid; orphans: 4; widows: 4;">
            ${subsection.title}
          </h3>
      `

      // Loop through questions
      subsection.questions.forEach((question, qIndex) => {
        const answer = answers[question.id]
        const answerText = formatAnswerForPDF(answer, question)

        content += `
          <div style="margin-bottom: 10px; padding: 10px; background-color: ${qIndex % 2 === 0 ? '#f9f9f9' : '#fff'}; border-left: 3px solid #0468B1; page-break-inside: avoid; orphans: 4; widows: 4;">
            <p style="margin: 0 0 5px 0; font-weight: bold; color: #333; page-break-after: avoid; page-break-inside: avoid;">
              ${question.text}
              ${question.required ? '<span style="color: #EE402D;">*</span>' : ''}
            </p>
            <p style="margin: 0; color: #666; line-height: 1.3; page-break-inside: avoid;">
              <strong>Відповідь:</strong> ${answerText || '<em style="color: #999;">Не відповіли</em>'}
            </p>
            ${question.explanation ? `
              <p style="margin: 5px 0 0 0; padding: 5px; background-color: #FFF9E6; border-radius: 3px; font-size: 9px; color: #666; line-height: 1.2; page-break-inside: avoid;">
                💡 ${question.explanation.split('||IMAGE:')[0].trim()}
              </p>
            ` : ''}
          </div>
        `
      })

      content += `</div>` // Close subsection
    })

    content += `</div>` // Close section
  })

  // Footer
  content += `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 10px;">
      <p>Згенеровано інструментом оцінки доступності UNDP Ukraine</p>
      <p>Всього питань: ${Object.keys(answers).length}</p>
    </div>
  `

  container.innerHTML = content
  document.body.appendChild(container)

  const centerName = answers['q1_1'] || answers['q1_1_1'] || 'Молодіжний_центр'
  const cleanName = centerName.replace(/[^a-zA-Zа-яА-ЯіІїЇєЄґҐ0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
  const filename = `${cleanName}_повні_відповіді.pdf`

  const opt = {
    margin: [12, 12, 12, 12],
    filename: filename,
    image: { type: 'jpeg', quality: 0.92 },
    html2canvas: {
      scale: 1.8,
      useCORS: true,
      letterRendering: true,
      allowTaint: false,
      logging: false,
      windowWidth: 1024
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true,
      putOnlyUsedFonts: true
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: ['div', 'p', 'h3', 'h2']
    }
  }

  try {
    await html2pdf().set(opt).from(container).save()
    document.body.removeChild(container)
    return true
  } catch (error) {
    console.error('PDF generation error:', error)
    document.body.removeChild(container)
    throw error
  }
}

/**
 * Format answer for PDF display
 */
function formatAnswerForPDF(answer, question) {
  if (!answer) return null

  // Array (checkbox)
  if (Array.isArray(answer)) {
    return answer.join(', ')
  }

  // Object (radio with conditional or matrix)
  if (typeof answer === 'object') {
    if ('main' in answer) {
      // Radio with conditional
      return answer.conditional
        ? `${answer.main} (${answer.conditional})`
        : answer.main
    }

    // Matrix
    if (question.type === 'matrix') {
      const rows = Object.entries(answer)
        .map(([row, col]) => `${row}: ${col}`)
        .join('; ')
      return rows
    }

    return JSON.stringify(answer)
  }

  // String or number
  return String(answer)
}

/**
 * Generate results PDF (existing functionality)
 */
export async function generateResultsPDF(answers) {
  const element = document.getElementById('results-content')

  // Get center name from answers
  const centerName = answers?.['q1_1'] || answers?.['q1_1_1'] || 'Молодіжний_центр'
  const cleanName = centerName.replace(/[^a-zA-Zа-яА-ЯіІїЇєЄґҐ0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
  const filename = `${cleanName}_звіт_з_рекомендаціями.pdf`

  const opt = {
    margin: [12, 12, 12, 12],
    filename: filename,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      allowTaint: false,
      logging: false
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'], avoid: ['div', '.score-circle', '.section-score-card', '.category-item', '.recommendation-card'] }
  }

  try {
    await html2pdf().set(opt).from(element).save()
    return true
  } catch (error) {
    console.error('PDF generation error:', error)
    throw error
  }
}

/**
 * Generate results PDF as base64 string for email
 */
export async function generateResultsPDFAsBase64(answers) {
  const element = document.getElementById('results-content')

  const opt = {
    margin: [12, 12, 12, 12],
    image: { type: 'jpeg', quality: 0.7 },
    html2canvas: {
      scale: 1.5,
      useCORS: true,
      letterRendering: true,
      allowTaint: false,
      logging: false
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'], avoid: ['div', '.score-circle', '.section-score-card', '.category-item', '.recommendation-card'] }
  }

  try {
    const pdf = await html2pdf().set(opt).from(element).outputPdf('datauristring')
    return pdf
  } catch (error) {
    console.error('PDF generation error:', error)
    throw error
  }
}

/**
 * Generate admin PDF as base64 string for email
 */
export async function generateAdminPDFAsBase64(answers, questionsData) {
  // Create temporary container for PDF content
  const container = document.createElement('div')
  container.id = 'admin-pdf-content-temp'
  container.style.padding = '20px'
  container.style.fontFamily = 'Arial, sans-serif'
  container.style.fontSize = '11px'
  container.style.lineHeight = '1.5'

  // Header
  const header = `
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0468B1; padding-bottom: 20px;">
      <h1 style="color: #0468B1; margin: 0 0 10px 0;">Повний звіт відповідей</h1>
      <h2 style="color: #666; margin: 0; font-weight: normal;">Інструмент оцінки доступності молодіжних центрів</h2>
      <p style="color: #999; margin: 10px 0 0 0;">
        Дата: ${new Date().toLocaleDateString('uk-UA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </p>
    </div>
  `

  // Build content (same logic as generateAdminPDF)
  let content = header

  questionsData.sections.forEach((section, sectionIndex) => {
    content += `
      <div style="page-break-before: ${sectionIndex > 0 ? 'always' : 'auto'}; margin-bottom: 25px;">
        <h2 style="color: #0468B1; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 15px; page-break-after: avoid; page-break-inside: avoid;">
          ${section.title}
        </h2>
    `

    section.subsections.forEach((subsection, subsectionIndex) => {
      content += `
        <div style="margin-bottom: 18px; page-break-inside: avoid;">
          <h3 style="color: #333; font-size: 12px; margin-bottom: 10px; margin-top: ${subsectionIndex > 0 ? '15px' : '0'}; page-break-after: avoid; page-break-inside: avoid; orphans: 4; widows: 4;">
            ${subsection.title}
          </h3>
      `

      subsection.questions.forEach((question, qIndex) => {
        const answer = answers[question.id]
        const answerText = formatAnswerForPDF(answer, question)

        content += `
          <div style="margin-bottom: 10px; padding: 10px; background-color: ${qIndex % 2 === 0 ? '#f9f9f9' : '#fff'}; border-left: 3px solid #0468B1; page-break-inside: avoid; orphans: 4; widows: 4;">
            <p style="margin: 0 0 5px 0; font-weight: bold; color: #333; page-break-after: avoid; page-break-inside: avoid;">
              ${question.text}
              ${question.required ? '<span style="color: #EE402D;">*</span>' : ''}
            </p>
            <p style="margin: 0; color: #666; line-height: 1.3; page-break-inside: avoid;">
              <strong>Відповідь:</strong> ${answerText || '<em style="color: #999;">Не відповіли</em>'}
            </p>
            ${question.explanation ? `
              <p style="margin: 5px 0 0 0; padding: 5px; background-color: #FFF9E6; border-radius: 3px; font-size: 9px; color: #666; line-height: 1.2; page-break-inside: avoid;">
                💡 ${question.explanation.split('||IMAGE:')[0].trim()}
              </p>
            ` : ''}
          </div>
        `
      })

      content += `</div>`
    })

    content += `</div>`
  })

  content += `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #999; font-size: 10px;">
      <p>Згенеровано інструментом оцінки доступності UNDP Ukraine</p>
      <p>Всього питань: ${Object.keys(answers).length}</p>
    </div>
  `

  container.innerHTML = content
  document.body.appendChild(container)

  const opt = {
    margin: [12, 12, 12, 12],
    image: { type: 'jpeg', quality: 0.6 },
    html2canvas: {
      scale: 1.2,
      useCORS: true,
      letterRendering: true,
      allowTaint: false,
      logging: false,
      windowWidth: 1024
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true,
      putOnlyUsedFonts: true
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
      avoid: ['div', 'p', 'h3', 'h2']
    }
  }

  try {
    const pdf = await html2pdf().set(opt).from(container).outputPdf('datauristring')
    document.body.removeChild(container)
    return pdf
  } catch (error) {
    console.error('PDF generation error:', error)
    document.body.removeChild(container)
    throw error
  }
}
