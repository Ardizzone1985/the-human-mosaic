import { Resend } from 'resend';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import QRCode from 'qrcode';

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

function wrapText(text, maxCharsPerLine = 65) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length <= maxCharsPerLine) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
}

async function fetchAsBytes(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch asset: ${url} (${response.status})`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

async function generateCertificatePdf({
  fullName,
  room,
  wall,
  section,
  spot,
  submissionId
}) {
  const verifyUrl = `https://thehumanmosaic.art/verify.html?id=${encodeURIComponent(submissionId || '')}`;
  const signatureUrl = 'https://thehumanmosaic.art/signature-clean.png';

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 landscape
  const { width, height } = page.getSize();

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // fallback semplice e stabile
  const timesRoman = helvetica;
  const timesBold = helveticaBold;
  const timesItalic = helvetica;

  const bg = rgb(0.973, 0.965, 0.93);
  const gold = rgb(0.78, 0.67, 0.42);
  const goldDark = rgb(0.55, 0.42, 0.14);
  const textDark = rgb(0.18, 0.18, 0.18);
  const textMid = rgb(0.35, 0.35, 0.35);
  const line = rgb(0.84, 0.82, 0.76);
  const navy = rgb(0.15, 0.19, 0.28);

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: bg
  });

  page.drawRectangle({
    x: 12,
    y: 12,
    width: width - 24,
    height: height - 24,
    borderColor: gold,
    borderWidth: 2
  });

  page.drawRectangle({
    x: 18,
    y: 18,
    width: width - 36,
    height: height - 36,
    borderColor: rgb(0.86, 0.79, 0.61),
    borderWidth: 1
  });

  page.drawText('THE HUMAN MOSAIC', {
    x: 305,
    y: 545,
    size: 24,
    font: helveticaBold,
    color: textMid
  });

  page.drawText('PERMANENT POSITION CERTIFICATE', {
    x: 255,
    y: 502,
    size: 12,
    font: helvetica,
    color: goldDark
  });

  page.drawLine({
    start: { x: 170, y: 500 },
    end: { x: 245, y: 500 },
    thickness: 1,
    color: gold
  });

  page.drawLine({
    start: { x: 555, y: 500 },
    end: { x: 630, y: 500 },
    thickness: 1,
    color: gold
  });

  page.drawText('CERTIFICATE OF PARTICIPATION', {
    x: 215,
    y: 438,
    size: 30,
    font: helveticaBold,
    color: textDark
  });

  page.drawLine({
    start: { x: 170, y: 435 },
    end: { x: 630, y: 435 },
    thickness: 1,
    color: line
  });

  page.drawText('THIS CERTIFIES THAT', {
    x: 351,
    y: 398,
    size: 11,
    font: helvetica,
    color: textMid
  });

  const nameText = String(fullName || 'Participant Name');
  const nameSize = Math.min(30, Math.max(20, 520 / Math.max(nameText.length, 10)));
  const nameWidth = helvetica.widthOfTextAtSize(nameText, nameSize);

  page.drawText(nameText, {
    x: (width - nameWidth) / 2,
    y: 346,
    size: nameSize,
    font: helvetica,
    color: goldDark
  });

  page.drawLine({
    start: { x: 200, y: 342 },
    end: { x: 600, y: 342 },
    thickness: 1,
    color: line
  });

  const participantLine = `Official Participant • ${room} Room`;
  const participantWidth = helveticaBold.widthOfTextAtSize(participantLine, 12);

  page.drawText(participantLine, {
    x: (width - participantWidth) / 2,
    y: 285,
    size: 12,
    font: helveticaBold,
    color: textDark
  });

  const statement =
    'has officially secured a permanent position within The Human Mosaic, a global collective artwork composed of millions of participants.';
  const statementLines = wrapText(statement, 58);

  let statementY = 250;
  for (const lineText of statementLines) {
    const lineWidth = helvetica.widthOfTextAtSize(lineText, 10);
    page.drawText(lineText, {
      x: (width - lineWidth) / 2,
      y: statementY,
      size: 10,
      font: helvetica,
      color: textMid
    });
    statementY -= 18;
  }

  const recorded = 'This position is permanently recorded within The Human Mosaic.';
  const recordedWidth = helvetica.widthOfTextAtSize(recorded, 10.5);

  page.drawText(recorded, {
    x: (width - recordedWidth) / 2,
    y: 160,
    size: 10.5,
    font: helvetica,
    color: textDark
  });

  // tabella dettagli
  const tableTop = 122;
  const tableLeft = 150;
  const tableWidth = 540;
  const colWidth = tableWidth / 5;

  page.drawLine({
    start: { x: tableLeft, y: tableTop },
    end: { x: tableLeft + tableWidth, y: tableTop },
    thickness: 1,
    color: line
  });

  page.drawLine({
    start: { x: tableLeft, y: tableTop - 46 },
    end: { x: tableLeft + tableWidth, y: tableTop - 46 },
    thickness: 1,
    color: line
  });

  const detailItems = [
    ['ROOM', room || '—'],
    ['WALL', wall || '—'],
    ['SECTION', section || '—'],
    ['SPOT', spot || '—'],
    ['SUBMISSION ID', submissionId || '—']
  ];

  detailItems.forEach((item, i) => {
    const x = tableLeft + i * colWidth;

    if (i > 0) {
      page.drawLine({
        start: { x, y: tableTop - 4 },
        end: { x, y: tableTop - 42 },
        thickness: 1,
        color: line
      });
    }

    page.drawText(item[0], {
      x: x + 8,
      y: tableTop - 14,
      size: 7,
      font: helvetica,
      color: textMid
    });

    const rawValue = String(item[1]);
    const value = item[0] === 'SUBMISSION ID' && rawValue.length > 14
      ? rawValue.slice(0, 14)
      : rawValue;

    page.drawText(value, {
      x: x + 8,
      y: tableTop - 32,
      size: item[0] === 'SUBMISSION ID' ? 8.5 : 11.5,
      font: helveticaBold,
      color: textDark
    });
  });

  const bottomY = 68;

  // firma
  try {
    const signatureBytes = await fetchAsBytes(signatureUrl);
    const signatureImage = await pdfDoc.embedPng(signatureBytes);

    const originalWidth = signatureImage.width;
    const originalHeight = signatureImage.height;
    const targetWidth = 150;
    const targetHeight = (originalHeight / originalWidth) * targetWidth;

    page.drawImage(signatureImage, {
      x: 70,
      y: bottomY + 18,
      width: targetWidth,
      height: targetHeight
    });
  } catch (error) {
    page.drawText('Giuseppe Ardizzone', {
      x: 82,
      y: bottomY + 36,
      size: 18,
      font: timesItalic,
      color: navy
    });
  }

  page.drawLine({
    start: { x: 62, y: bottomY + 2 },
    end: { x: 230, y: bottomY + 2 },
    thickness: 1,
    color: line
  });

  page.drawText('Giuseppe Ardizzone', {
    x: 86,
    y: bottomY - 16,
    size: 10.5,
    font: helveticaBold,
    color: textDark
  });

  page.drawText('Founder & Curator', {
    x: 102,
    y: bottomY - 32,
    size: 8.5,
    font: helvetica,
    color: textMid
  });

  page.drawText('The Human Mosaic', {
    x: 96,
    y: bottomY - 46,
    size: 8.5,
    font: helvetica,
    color: textMid
  });

  // sigillo
  page.drawCircle({
    x: 420,
    y: 85,
    size: 42,
    borderColor: gold,
    borderWidth: 5,
    color: rgb(0.95, 0.87, 0.58)
  });

  page.drawText('CERTIFIED', {
    x: 390,
    y: 106,
    size: 10,
    font: helveticaBold,
    color: goldDark
  });

  // meta + qr
  page.drawText('PROJECT ORIGIN', {
    x: 560,
    y: 120,
    size: 7,
    font: helvetica,
    color: textMid
  });

  page.drawText('Italy', {
    x: 560,
    y: 102,
    size: 11.5,
    font: helveticaBold,
    color: textDark
  });

  page.drawText('CERTIFICATE ID', {
    x: 560,
    y: 80,
    size: 7,
    font: helvetica,
    color: textMid
  });

  page.drawText(String(submissionId || '—').slice(0, 18), {
    x: 560,
    y: 62,
    size: 9.5,
    font: helveticaBold,
    color: textDark
  });

  try {
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 220,
      color: {
        dark: '#1f1f1f',
        light: '#FFFFFF'
      }
    });

    const qrBase64 = qrDataUrl.split(',')[1];
    const qrBytes = Uint8Array.from(Buffer.from(qrBase64, 'base64'));
    const qrImage = await pdfDoc.embedPng(qrBytes);

    page.drawImage(qrImage, {
      x: 704,
      y: 56,
      width: 74,
      height: 74
    });

    page.drawText('Verify Certificate', {
      x: 685,
      y: 42,
      size: 8.5,
      font: helvetica,
      color: textMid
    });
  } catch (error) {
    page.drawText('QR unavailable', {
      x: 700,
      y: 84,
      size: 9,
      font: helvetica,
      color: textMid
    });
  }

  return await pdfDoc.save();
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
    const verifyUrl = `https://thehumanmosaic.art/verify.html?id=${encodeURIComponent(submissionId)}`;

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
            <p>3. Certificate — Your certificate PDF is attached when available.</p>
            <p>4. Verification — In the future your certificate will be verifiable online from this link:</p>

            <p style="word-break: break-all;">
              <a href="${verifyUrl}" style="color: #111; text-decoration: underline;">
                ${verifyUrl}
              </a>
            </p>

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
3. Certificate — Your certificate PDF is attached when available.
4. Verification — Future verification link:
${verifyUrl}

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
