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
      resultsPdfUrl,
      adminPdfUrl,
      completedAt
    } = req.body;

    // Validate required fields
    if (!resultsPdfUrl || !adminPdfUrl) {
      return res.status(400).json({ error: 'Missing PDF URLs' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'zvoryhin.hd@gmail.com';

    // Send single email with both download links
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

          <p>Результати самооцінки готові до завантаження. Файли доступні протягом <strong>7 днів</strong>.</p>

          <div style="margin: 30px 0;">
            <h3 style="color: #333; margin-bottom: 15px;">📊 Звіт з рекомендаціями</h3>
            <p style="color: #666; margin-bottom: 15px;">
              Аналітичний звіт з оцінками доступності та практичними рекомендаціями щодо покращення.
            </p>
            <a href="${resultsPdfUrl}"
               style="display: inline-block; background-color: #0468B1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              📥 Завантажити звіт з рекомендаціями
            </a>
          </div>

          <div style="margin: 30px 0; padding-top: 20px; border-top: 1px solid #ddd;">
            <h3 style="color: #333; margin-bottom: 15px;">📝 Повні відповіді</h3>
            <p style="color: #666; margin-bottom: 15px;">
              Детальний звіт з усіма відповідями на питання опитування.
            </p>
            <a href="${adminPdfUrl}"
               style="display: inline-block; background-color: #0468B1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              📥 Завантажити повні відповіді
            </a>
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd;">
            <p style="color: #999; font-size: 0.9em; margin: 5px 0;">
              ⚠️ <strong>Важливо:</strong> Посилання для завантаження дійсні протягом 7 днів. Після цього файли будуть видалені.
            </p>
            <p style="color: #666; font-size: 0.9em; margin-top: 15px;">
              Цей лист було автоматично згенеровано інструментом самооцінки доступності<br />
              © 2026 UNDP Ukraine
            </p>
          </div>
        </div>
      `,
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
