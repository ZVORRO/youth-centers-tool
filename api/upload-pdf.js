import { put } from '@vercel/blob';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pdfBase64, filename, centerName } = req.body;

    if (!pdfBase64 || !filename) {
      return res.status(400).json({ error: 'Missing PDF data or filename' });
    }

    // Convert base64 to Buffer
    const base64Data = pdfBase64.split(',')[1]; // Remove data:application/pdf;base64, prefix
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedCenterName = (centerName || 'Центр').replace(/[^a-zA-Zа-яА-ЯіІїЇєЄ0-9]/g, '_');
    const uniqueFilename = `${sanitizedCenterName}_${timestamp}_${filename}`;

    // Upload to Vercel Blob
    const blob = await put(uniqueFilename, buffer, {
      access: 'public',
      contentType: 'application/pdf',
      addRandomSuffix: true, // Add random suffix to prevent collisions
    });

    console.log('PDF uploaded to Blob:', blob.url);

    return res.status(200).json({
      success: true,
      url: blob.url,
      filename: uniqueFilename,
    });

  } catch (error) {
    console.error('Error uploading PDF to Blob:', error);
    return res.status(500).json({
      error: 'Failed to upload PDF',
      details: error.message
    });
  }
}
