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

  // 📥 carica immagine base
  const baseImageUrl = `https://${req.headers.host}/certificate-base.png`;
const baseImageResponse = await fetch(baseImageUrl);
const baseImageBytes = await baseImageResponse.arrayBuffer();

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 landscape

  const baseImage = await pdfDoc.embedPng(baseImageBytes);

  page.drawImage(baseImage, {
    x: 0,
    y: 0,
    width: 842,
    height: 595
  });

  // 🔤 font
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // 🎯 NOME (centrato)
  page.drawText(fullName, {
    x: 421 - (fullName.length * 8),
    y: 300,
    size: 36,
    font: fontBold,
    color: rgb(0.6, 0.45, 0.1)
  });

  // 📍 ROOM
  page.drawText(room.toUpperCase(), {
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
  page.drawText(spot, {
    x: 450,
    y: 130,
    size: 12,
    font: fontBold
  });

  // 📍 ID
  page.drawText(submissionId, {
    x: 580,
    y: 130,
    size: 10,
    font: fontRegular
  });

  // 🔗 QR
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
      subject: 'Your Certificate — The Human Mosaic',
      html: `<p>Your certificate is attached.</p>`,
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
