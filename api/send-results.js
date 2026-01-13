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
      resultsPdfBase64,
      adminPdfBase64,
      completedAt
    } = req.body;

    // Validate required fields
    if (!resultsPdfBase64 || !adminPdfBase64) {
      return res.status(400).json({ error: 'Missing PDF data' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'zvoryhin.hd@gmail.com';

    // Send email with Resend
    const data = await resend.emails.send({
      from: 'UNDP Youth Centers <onboarding@resend.dev>', // You'll change this after domain verification
      to: [adminEmail],
      subject: `Нова самооцінка доступності: ${centerName || 'Молодіжний центр'}`,
      html: `
        <h2>Нова самооцінка доступності молодіжного центру</h2>
        <p><strong>Назва центру:</strong> ${centerName || 'Не вказано'}</p>
        <p><strong>Дата завершення:</strong> ${completedAt || new Date().toLocaleString('uk-UA')}</p>
        <p>У цьому листі знаходяться два PDF документи:</p>
        <ul>
          <li><strong>Звіт з рекомендаціями</strong> - аналіз доступності та практичні поради</li>
          <li><strong>Всі відповіді</strong> - повний перелік відповідей на питання опитування</li>
        </ul>
        <hr />
        <p style="color: #666; font-size: 0.9em;">
          Цей лист було автоматично згенеровано інструментом самооцінки доступності<br />
          © 2026 UNDP Ukraine
        </p>
      `,
      attachments: [
        {
          filename: `${centerName || 'Молодіжний_центр'}_звіт_з_рекомендаціями.pdf`,
          content: resultsPdfBase64.split(',')[1], // Remove data:application/pdf;base64, prefix
        },
        {
          filename: `${centerName || 'Молодіжний_центр'}_повні_відповіді.pdf`,
          content: adminPdfBase64.split(',')[1], // Remove data:application/pdf;base64, prefix
        },
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
