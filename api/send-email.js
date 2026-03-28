import { Resend } from 'resend';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

const resend = new Resend(process.env.RESEND_API_KEY);

async function getJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(JSON.parse(data || '{}')));
    req.on('error', reject);
  });
}

async function generateCertificatePdf(data, req) {
  const {
    fullName,
    room,
    wall,
    section,
    spot,
    submissionId
  } = data;

  // 🔥 CARICA IMMAGINE BASE (FIX VERCEL)
  const baseImageUrl = `https://${req.headers.host}/certificate-base1.png`;
  const baseImageResponse = await fetch(baseImageUrl);
  const baseImageBytes = await baseImageResponse.arrayBuffer();

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]);

  const baseImage = await pdfDoc.embedPng(baseImageBytes);

  page.drawImage(baseImage, {
    x: 0,
    y: 0,
    width: 842,
    height: 595
  });

  // 🔤 FONT
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // 🎯 NOME (centrato approx)
  page.drawText(fullName, {
    x: 421 - (fullName.length * 8),
    y: 300,
    size: 36,
    font: fontBold,
    color: rgb(0.6, 0.45, 0.1)
  });

  // 📍 ROOM
  page.drawText((room || '').toUpperCase(), {
    x: 120,
    y: 130,
    size: 12,
    font: fontBold
  });

  // 📍 WALL
  page.drawText(wall || '', {
    x: 230,
    y: 130,
    size: 12,
    font: fontBold
  });

  // 📍 SECTION
  page.drawText(section || '', {
    x: 340,
    y: 130,
    size: 12,
    font: fontBold
  });

  // 📍 SPOT
  page.drawText(spot || '', {
    x: 450,
    y: 130,
    size: 12,
    font: fontBold
  });

  // 📍 ID
  page.drawText(submissionId || '', {
    x: 580,
    y: 130,
    size: 10,
    font: fontRegular
  });

  // 🔗 QR CODE
  const verifyUrl = `https://thehumanmosaic.art/verify.html?id=${submissionId}`;
  const qrData = await QRCode.toDataURL(verifyUrl);

  const qrImageBytes = await fetch(qrData).then(res => res.arrayBuffer());
  const qrImage = await pdfDoc.embedPng(qrImageBytes);

  page.drawImage(qrImage, {
    x: 700,
    y: 90,
    width: 100,
    height: 100
  });

  return await pdfDoc.save();
}

export default async function handler(req, res) {
  try {
    const body = await getJsonBody(req);

    const pdfBytes = await generateCertificatePdf(body, req);

    await resend.emails.send({
  from: 'The Human Mosaic <info@mail.thehumanmosaic.art>',
  to: [body.email],
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

        <p>Hello ${body.fullName},</p>

        <p style="color:#555;">
          We’re glad to have you in this global artwork.
        </p>

        <p>Thank you for becoming part of <strong>The Human Mosaic</strong>.</p>

        <p><strong>You are now part of something that will live forever.</strong></p>

        <p>Your participation request has been successfully received and is now entering the official review process.</p>

        <hr style="border: none; border-top: 1px solid #e3e3e3; margin: 24px 0;">

        <p><strong>Submission ID:</strong> ${body.submissionId}</p>
        <p><strong>Room:</strong> ${body.room}</p>
        <p><strong>Wall:</strong> ${body.wall || '—'}</p>
        <p><strong>Section:</strong> ${body.section || '—'}</p>
        <p><strong>Spot:</strong> ${body.spot}</p>

        <hr style="border: none; border-top: 1px solid #e3e3e3; margin: 24px 0;">

        <p><strong>What happens next?</strong></p>
        <p>1. Review — We verify that your submission matches the project guidelines and the selected room.</p>
        <p>2. Confirmation — Your position and participation request are confirmed after review.</p>
        <p>3. Certificate — Your official certificate prototype is attached to this email.</p>

        <p style="margin-top: 24px;">
          For questions or support:
          <a href="mailto:info@thehumanmosaic.art" style="color: #111; text-decoration: none; font-weight: 700;">
            info@thehumanmosaic.art
          </a>
        </p>

        <p style="margin-top: 24px; font-weight: 700;">— The Human Mosaic</p>
      </div>
    </div>
  `,
  text: `
Welcome to The Human Mosaic

Hello ${body.fullName},

Thank you for becoming part of The Human Mosaic.

You are now part of something that will live forever.

Your participation request has been successfully received and is now entering the official review process.

Submission ID: ${body.submissionId}
Room: ${body.room}
Wall: ${body.wall || '—'}
Section: ${body.section || '—'}
Spot: ${body.spot}

What happens next?
1. Review — We verify that your submission matches the project guidelines and the selected room.
2. Confirmation — Your position and participation request are confirmed after review.
3. Certificate — Your official certificate prototype is attached to this email.

Support: info@thehumanmosaic.art

— The Human Mosaic
  `.trim(),
  attachments: [
        {
          filename: `certificate-${body.submissionId}.pdf`,
          content: Buffer.from(pdfBytes).toString('base64')
        }
      ]
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('PDF ERROR:', error);
    return res.status(500).json({ error: error.message });
  }
}
