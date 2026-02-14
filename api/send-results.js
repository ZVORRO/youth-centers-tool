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

    // Clean center name for filename
    const cleanCenterName = (centerName || 'Молодіжний_центр')
      .replace(/[^a-zA-Zа-яА-ЯіІїЇєЄґҐ0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);

    // Extract base64 content (remove data:application/pdf;base64, prefix if present)
    const resultsContent = resultsPdfBase64.includes(',')
      ? resultsPdfBase64.split(',')[1]
      : resultsPdfBase64;
    const adminContent = adminPdfBase64.includes(',')
      ? adminPdfBase64.split(',')[1]
      : adminPdfBase64;

    // Send email with PDF attachments
    const data = await resend.emails.send({
      from: 'UNDP Youth Centers <onboarding@resend.dev>',
      to: [adminEmail],
      subject: `Нова самооцінка доступності: ${centerName || 'Молодіжний центр'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0468B1; border-bottom: 3px solid #0468B1; padding-bottom: 10px;">
            Нова самооцінка доступності молодіжного центру
          </h2>

          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Назва центру:</strong> ${centerName || 'Не вказано'}</p>
            <p style="margin: 5px 0;"><strong>Дата завершення:</strong> ${completedAt || new Date().toLocaleString('uk-UA')}</p>
          </div>

          <p>Результати самооцінки доступні у вкладених PDF файлах.</p>

          <div style="margin: 30px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">📎 Вкладені файли:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li><strong>📊 Звіт з рекомендаціями</strong> — аналітичний звіт з оцінками доступності та практичними рекомендаціями</li>
              <li><strong>📝 Повні відповіді</strong> — детальний звіт з усіма відповідями на питання опитування</li>
            </ul>
          </div>

          <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0468B1;">
            <p style="margin: 0; color: #0468B1;">
              ✅ <strong>Файли прикріплені до цього листа</strong> — вони залишаться доступними назавжди у вашій поштовій скриньці.
            </p>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd;">
            <p style="color: #666; font-size: 0.9em; margin-top: 15px;">
              Цей лист було автоматично згенеровано інструментом самооцінки доступності<br />
              © 2026 UNDP Ukraine
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `${cleanCenterName}_звіт_з_рекомендаціями.pdf`,
          content: resultsContent,
          content_type: 'application/pdf'
        },
        {
          filename: `${cleanCenterName}_повні_відповіді.pdf`,
          content: adminContent,
          content_type: 'application/pdf'
        }
      ]
    });

    console.log('Email with attachments sent successfully:', data);

    return res.status(200).json({
      success: true,
      messageId: data.id,
      message: 'Результати успішно відправлено на email з вкладеними PDF файлами'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    });
  }
}
