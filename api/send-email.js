import { Resend } from 'resend';
import puppeteer from 'puppeteer';

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

async function generateCertificatePdf({
  fullName,
  room,
  wall,
  section,
  spot,
  submissionId
}) {
  const safeFullName = escapeHtml(fullName);
  const safeRoom = escapeHtml(room || '—');
  const safeWall = escapeHtml(wall || '—');
  const safeSection = escapeHtml(section || '—');
  const safeSpot = escapeHtml(spot || '—');
  const safeSubmissionId = escapeHtml(submissionId || '—');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          padding: 0;
          background: #f6f3eb;
          font-family: Georgia, "Times New Roman", serif;
        }

        .page {
          width: 1600px;
          height: 1130px;
          margin: 0 auto;
          padding: 28px;
          background: #f6f3eb;
        }

        .certificate {
          width: 100%;
          height: 100%;
          border: 6px solid #cdbb8a;
          position: relative;
          padding: 54px 64px;
          background:
            radial-gradient(circle at center, rgba(255,255,255,0.55), rgba(255,255,255,0.88)),
            #f9f7f2;
        }

        .inner-border {
          position: absolute;
          inset: 10px;
          border: 2px solid #d8c79c;
          pointer-events: none;
        }

        .header {
          text-align: center;
          margin-bottom: 26px;
        }

        .brand {
          font-size: 34px;
          letter-spacing: 0.08em;
          color: #3a3a3a;
          margin-bottom: 10px;
          text-transform: uppercase;
        }

        .pretitle {
          font-size: 22px;
          letter-spacing: 0.16em;
          color: #8c6a2c;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .title {
          font-size: 66px;
          line-height: 1;
          color: #2b2b2b;
          margin: 0 0 14px;
          font-weight: 700;
        }

        .divider {
          width: 72%;
          margin: 0 auto;
          border-top: 2px solid #d7d1c6;
        }

        .certifies {
          text-align: center;
          font-size: 22px;
          color: #5a5a5a;
          margin-top: 30px;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .name {
          text-align: center;
          font-size: 78px;
          line-height: 1.1;
          color: #6e5220;
          font-style: italic;
          margin: 10px 0 16px;
        }

        .participant-line {
          text-align: center;
          font-size: 28px;
          font-weight: 700;
          color: #333;
          margin-bottom: 18px;
        }

        .statement {
          max-width: 920px;
          margin: 0 auto 22px;
          text-align: center;
          font-size: 20px;
          line-height: 1.6;
          color: #444;
        }

        .recorded {
          text-align: center;
          font-size: 20px;
          font-style: italic;
          color: #444;
          margin: 20px 0 26px;
        }

        .details {
          width: 100%;
          border-collapse: collapse;
          margin: 0 auto 34px;
          table-layout: fixed;
        }

        .details td {
          width: 20%;
          border-top: 1px solid #ddd5c7;
          border-bottom: 1px solid #ddd5c7;
          padding: 18px 8px;
          text-align: center;
          vertical-align: top;
        }

        .details-label {
          font-size: 14px;
          letter-spacing: 0.14em;
          color: #777;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .details-value {
          font-size: 21px;
          font-weight: 700;
          color: #2f2f2f;
        }

        .bottom {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 28px;
          margin-top: 10px;
        }

        .signature-block {
          width: 38%;
          text-align: left;
        }

        .signature-script {
          font-size: 34px;
          font-style: italic;
          color: #243047;
          margin-bottom: 10px;
        }

        .signature-name {
          font-size: 24px;
          font-weight: 700;
          color: #2f2f2f;
          margin-bottom: 4px;
        }

        .signature-role {
          font-size: 18px;
          color: #666;
          line-height: 1.5;
        }

        .seal-block {
          width: 24%;
          text-align: center;
        }

        .seal {
          width: 150px;
          height: 150px;
          margin: 0 auto 10px;
          border-radius: 50%;
          border: 10px solid #caa347;
          background: radial-gradient(circle, #f7e3a5 0%, #d6af4f 68%, #ae8222 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #7c5a16;
          font-size: 20px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          box-shadow: inset 0 0 0 4px rgba(255,255,255,0.25);
        }

        .seal-caption {
          font-size: 15px;
          color: #8c6a2c;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .meta-block {
          width: 28%;
          text-align: left;
        }

        .meta-group {
          margin-bottom: 16px;
        }

        .meta-title {
          font-size: 14px;
          letter-spacing: 0.14em;
          color: #777;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .meta-value {
          font-size: 22px;
          font-weight: 700;
          color: #2f2f2f;
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="certificate">
          <div class="inner-border"></div>

          <div class="header">
            <div class="brand">The Human Mosaic</div>
            <div class="pretitle">Permanent Position Certificate</div>
            <div class="title">Certificate of Participation</div>
            <div class="divider"></div>
          </div>

          <div class="certifies">This certifies that</div>
          <div class="name">${safeFullName}</div>

          <div class="participant-line">
            Official Participant • ${safeRoom} Room
          </div>

          <div class="statement">
            has officially secured a permanent position within The Human Mosaic,
            a global collective artwork composed of millions of participants.
          </div>

          <div class="recorded">
            This position is permanently recorded within The Human Mosaic.
          </div>

          <table class="details">
            <tr>
              <td>
                <div class="details-label">Room</div>
                <div class="details-value">${safeRoom}</div>
              </td>
              <td>
                <div class="details-label">Wall</div>
                <div class="details-value">${safeWall}</div>
              </td>
              <td>
                <div class="details-label">Section</div>
                <div class="details-value">${safeSection}</div>
              </td>
              <td>
                <div class="details-label">Spot</div>
                <div class="details-value">${safeSpot}</div>
              </td>
              <td>
                <div class="details-label">Submission ID</div>
                <div class="details-value">${safeSubmissionId}</div>
              </td>
            </tr>
          </table>

          <div class="bottom">
            <div class="signature-block">
              <div class="signature-script">Giuseppe Ardizzone</div>
              <div class="signature-name">Giuseppe Ardizzone</div>
              <div class="signature-role">
                Founder & Curator<br>
                The Human Mosaic
              </div>
            </div>

            <div class="seal-block">
              <div class="seal">Certified</div>
              <div class="seal-caption">Official Seal</div>
            </div>

            <div class="meta-block">
              <div class="meta-group">
                <div class="meta-title">Project Origin</div>
                <div class="meta-value">Italy</div>
              </div>

              <div class="meta-group">
                <div class="meta-title">Certificate ID</div>
                <div class="meta-value">${safeSubmissionId}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0'
      }
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
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
      section,
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
    const safeSection = escapeHtml(section || '—');
    const safeSpot = escapeHtml(spot);
    const safePrice = escapeHtml(price || '€15 — one-time participation fee');
    const safeSubmissionId = escapeHtml(submissionId);

    let certificatePdf = null;

    try {
      certificatePdf = await generateCertificatePdf({
        fullName,
        room,
        wall,
        section,
        spot,
        submissionId
      });
    } catch (pdfError) {
      console.error('Certificate PDF generation failed:', pdfError);
    }

    const { data, error } = await resend.emails.send({
      from: 'The Human Mosaic <info@mail.thehumanmosaic.art>',
      to: [email],
      subject: 'Welcome to The Human Mosaic — Your place is reserved',
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1f1f1f; max-width: 680px; margin: 0 auto; padding: 24px;">
          <div style="background: #ffffff; border: 1px solid #e8e8e8; border-radius: 20px; padding: 32px;">
            <p style="font-size: 12px; letter-spacing: 0.14em; color: #777; margin: 0 0 18px;">
              ONE HUMANITY. MILLIONS OF FACES. ONE MOSAIC.
            </p>

            <h2 style="margin: 0 0 18px; font-size: 28px; line-height: 1.2;">
              Welcome to The Human Mosaic
            </h2>

            <p>Hello ${safeFullName},</p>

            <p style="color:#555;">
              We’re glad to have you in this global artwork.
            </p>

            <p>Thank you for becoming part of <strong>The Human Mosaic</strong>.</p>

            <p><strong>You are now part of something that will live forever.</strong></p>

            <p>Your participation request has been successfully received and is now entering the official review process.</p>

            <hr style="border: none; border-top: 1px solid #e3e3e3; margin: 24px 0;">

            <p><strong>Submission ID:</strong> ${safeSubmissionId}</p>
            <p><strong>Room:</strong> ${safeRoom}</p>
            <p><strong>Wall:</strong> ${safeWall}</p>
            <p><strong>Section:</strong> ${safeSection}</p>
            <p><strong>Spot:</strong> ${safeSpot}</p>
            <p><strong>Country:</strong> ${safeCountry}</p>
            <p><strong>Participation Fee:</strong> ${safePrice}</p>

            <hr style="border: none; border-top: 1px solid #e3e3e3; margin: 24px 0;">

            <p><strong>What happens next?</strong></p>
            <p>1. Review — We verify that your submission matches the project guidelines and the selected room.</p>
            <p>2. Confirmation — Your position and participation request are confirmed after review.</p>
            <p>3. Certificate — Your certificate PDF is attached to this email as your official prototype record when available.</p>

            <p style="margin-top: 24px;">
              For questions or support:
              <a href="mailto:info@thehumanmosaic.art" style="color: #111; text-decoration: none; font-weight: 700;">
                info@thehumanmosaic.art
              </a>
            </p>

            <p style="margin-top: 24px; font-weight: 700;">— The Human Mosaic</p>

            <hr style="border: none; border-top: 1px solid #efefef; margin: 24px 0 16px;">

            <p style="font-size: 12px; color: #777; margin: 0 0 8px;">
              You are receiving this email because you participated in The Human Mosaic.
            </p>

            <p style="font-size: 12px; color: #777; margin: 0;">
              If you did not submit this request, please ignore this email.
            </p>
          </div>
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
Section: ${section || '—'}
Spot: ${spot}
Country: ${country || '—'}
Participation Fee: ${price || '€15 — one-time participation fee'}

What happens next?
1. Review — We verify that your submission matches the project guidelines and the selected room.
2. Confirmation — Your position and participation request are confirmed after review.
3. Certificate — Your certificate PDF is attached to this email as your official prototype record when available.

Support: info@thehumanmosaic.art

You are receiving this email because you participated in The Human Mosaic.
If you did not submit this request, please ignore this email.

— The Human Mosaic
      `.trim(),
      attachments: certificatePdf
        ? [
            {
              filename: `THM-Certificate-${submissionId}.pdf`,
              content: Buffer.from(certificatePdf).toString('base64')
            }
          ]
        : []
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
