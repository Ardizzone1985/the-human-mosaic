import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function getJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  return await new Promise((resolve, reject) => {
    let data = '';

    req.on('data', chunk => {
      data += chunk;
    });

    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = await getJsonBody(req);

    const {
      fullName,
      email,
      country,
      room,
      wall,
      spot,
      price,
      submissionId
    } = body || {};

    if (!fullName || !email || !room || !spot || !submissionId) {
      return res.status(400).json({
        error: 'Missing required fields',
        received: {
          fullName: !!fullName,
          email: !!email,
          room: !!room,
          spot: !!spot,
          submissionId: !!submissionId
        }
      });
    }

    const safeFullName = escapeHtml(fullName);
    const safeCountry = escapeHtml(country || '—');
    const safeRoom = escapeHtml(room);
    const safeWall = escapeHtml(wall || '—');
    const safeSpot = escapeHtml(spot);
    const safePrice = escapeHtml(price || '€15 — one-time participation fee');
    const safeSubmissionId = escapeHtml(submissionId);

    const { data, error } = await resend.emails.send({
      from: 'The Human Mosaic <noreply@mail.thehumanmosaic.art>',
      to: [email],
      subject: 'Your Submission Has Been Received — The Human Mosaic',
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1f1f1f;">
          <h2>Welcome to The Human Mosaic</h2>

          <p>Hello ${safeFullName},</p>

          <p>Thank you for becoming part of <strong>The Human Mosaic</strong>.</p>

          <p><strong>You are now part of something that will live forever.</strong></p>

          <p>Your participation request has been successfully received and is now entering the official review process.</p>

          <hr style="border:none; border-top:1px solid #e3e3e3; margin:24px 0;">

          <p><strong>Submission ID:</strong> ${safeSubmissionId}</p>
          <p><strong>Room:</strong> ${safeRoom}</p>
          <p><strong>Wall:</strong> ${safeWall}</p>
          <p><strong>Spot:</strong> ${safeSpot}</p>
          <p><strong>Country:</strong> ${safeCountry}</p>
          <p><strong>Participation Fee:</strong> ${safePrice}</p>

          <hr style="border:none; border-top:1px solid #e3e3e3; margin:24px 0;">

          <p><strong>What happens next?</strong></p>
          <p>1. Review — We verify that your submission matches the project guidelines and the selected room.</p>
          <p>2. Confirmation — Your position and participation request are confirmed after review.</p>
          <p>3. Certificate — You will receive your official digital certificate once your participation is validated.</p>

          <p style="margin-top: 24px;">For questions or support: info@thehumanmosaic.art</p>

          <p style="margin-top: 24px;">— The Human Mosaic</p>
        </div>
      `,
      text: `
Welcome to The Human Mosaic

Hello ${fullName},

Thank you for becoming part of The Human Mosaic.

You are now part of something that will live forever.

Your participation request has been successfully received and is now entering the official review process.

Submission ID: ${submissionId}
Room: ${room}
Wall: ${wall || '—'}
Spot: ${spot}
Country: ${country || '—'}
Participation Fee: ${price || '€15 — one-time participation fee'}

What happens next?
1. Review
2. Confirmation
3. Certificate

Support: info@thehumanmosaic.art

— The Human Mosaic
      `.trim()
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({
        error: 'Resend failed',
        details: error
      });
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: 'Email failed',
      details: error.message
    });
  }
}
