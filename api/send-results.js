import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      centerName,
      pdfBase64,
      pdfType, // 'results' or 'admin'
      completedAt
    } = req.body;

    // Validate required fields
    if (!pdfBase64 || !pdfType) {
      return res.status(400).json({ error: 'Missing PDF data or type' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'zvoryhin.hd@gmail.com';

    // Prepare email content based on PDF type
    let subject, htmlContent, filename;

    if (pdfType === 'results') {
      subject = `Нова самооцінка доступності: ${centerName || 'Молодіжний центр'} (Рекомендації)`;
      filename = `${centerName || 'Молодіжний_центр'}_звіт_з_рекомендаціями.pdf`;
      htmlContent = `
        <h2>Нова самооцінка доступності молодіжного центру</h2>
        <p><strong>Назва центру:</strong> ${centerName || 'Не вказано'}</p>
        <p><strong>Дата завершення:</strong> ${completedAt || new Date().toLocaleString('uk-UA')}</p>
        <p><strong>📊 Звіт з рекомендаціями</strong></p>
        <p>У вкладенні знаходиться аналітичний звіт з оцінками доступності та практичними рекомендаціями щодо покращення.</p>
        <p><em>Примітка: Наступним листом ви отримаєте повний звіт з усіма відповідями на питання опитування.</em></p>
        <hr />
        <p style="color: #666; font-size: 0.9em;">
          Цей лист було автоматично згенеровано інструментом самооцінки доступності<br />
          © 2026 UNDP Ukraine
        </p>
      `;
    } else if (pdfType === 'admin') {
      subject = `Нова самооцінка доступності: ${centerName || 'Молодіжний центр'} (Повні відповіді)`;
      filename = `${centerName || 'Молодіжний_центр'}_повні_відповіді.pdf`;
      htmlContent = `
        <h2>Нова самооцінка доступності молодіжного центру</h2>
        <p><strong>Назва центру:</strong> ${centerName || 'Не вказано'}</p>
        <p><strong>Дата завершення:</strong> ${completedAt || new Date().toLocaleString('uk-UA')}</p>
        <p><strong>📝 Повний звіт з відповідями</strong></p>
        <p>У вкладенні знаходиться детальний звіт з усіма відповідями на питання опитування.</p>
        <hr />
        <p style="color: #666; font-size: 0.9em;">
          Цей лист було автоматично згенеровано інструментом самооцінки доступності<br />
          © 2026 UNDP Ukraine
        </p>
      `;
    } else {
      return res.status(400).json({ error: 'Invalid PDF type' });
    }

    // Send email with Resend
    const data = await resend.emails.send({
      from: 'UNDP Youth Centers <onboarding@resend.dev>',
      to: [adminEmail],
      subject: subject,
      html: htmlContent,
      attachments: [
        {
          filename: filename,
          content: pdfBase64.split(',')[1], // Remove data:application/pdf;base64, prefix
        }
      ],
    });

    console.log('Email sent successfully:', data);

    return res.status(200).json({
      success: true,
      messageId: data.id,
      message: 'Результати успішно відправлено на email'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    });
  }
}
