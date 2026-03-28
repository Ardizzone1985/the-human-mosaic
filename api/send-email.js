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

  const baseImageUrl = `https://${req.headers.host}/certificate-base1.png`;
  const baseImageBytes = await fetch(baseImageUrl).then(res => res.arrayBuffer());

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]);
  const { width } = page.getSize();

  const baseImage = await pdfDoc.embedPng(baseImageBytes);

  page.drawImage(baseImage, {
    x: 0,
    y: 0,
    width: 842,
    height: 595
  });

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const gold = rgb(0.60, 0.45, 0.10);
  const textDark = rgb(0.22, 0.22, 0.22);
  const textSoft = rgb(0.33, 0.33, 0.33);

  const drawCentered = (text, y, size, font, color = textDark) => {
    const safe = String(text || '');
    const textWidth = font.widthOfTextAtSize(safe, size);
    page.drawText(safe, {
      x: (width - textWidth) / 2,
      y,
      size,
      font,
      color
    });
  };

  // ===== NOME =====
  const cleanName = String(fullName || '').trim();
  const nameSize =
    cleanName.length > 24 ? 26 :
    cleanName.length > 18 ? 30 : 34;

  drawCentered(cleanName, 332, nameSize, fontBold, gold);

  // ===== SOTTOTITOLO =====
  drawCentered(
    `Official Participant • ${String(room || '').trim()} Room`,
    275,
    16,
    fontBold,
    textDark
  );

  // ===== TESTO CENTRALE =====
  drawCentered(
    'has permanently secured a position within The Human Mosaic,',
    238,
    11.5,
    fontItalic,
    textSoft
  );

  drawCentered(
    'a global collective artwork composed of one million participants worldwide.',
    219,
    11.5,
    fontItalic,
    textSoft
  );

  drawCentered(
    'This position is permanently recorded within The Human Mosaic.',
    175,
    12.5,
    fontItalic,
    textSoft
  );

  // ===== DATI BASSI PERFETTI =====
  const baseY = 95;

  page.drawText(String(room || '').toUpperCase(), {
    x: 160,
    y: baseY,
    size: 13,
    font: fontBold,
    color: textDark
  });

  page.drawText(String(wall || '').toUpperCase(), {
    x: 275,
    y: baseY,
    size: 13,
    font: fontBold,
    color: textDark
  });

  page.drawText(String(section || '').toUpperCase(), {
    x: 390,
    y: baseY,
    size: 13,
    font: fontBold,
    color: textDark
  });

  page.drawText(String(spot || '').toUpperCase(), {
    x: 495,
    y: baseY,
    size: 13,
    font: fontBold,
    color: textDark
  });

  const shortId = String(submissionId || '').toUpperCase();

  page.drawText(shortId, {
    x: 595,
    y: baseY,
    size: 10,
    font: fontBold,
    color: textDark
  });

  // ===== BLOCCO DESTRA =====
  page.drawText('ITALY', {
    x: 600,
    y: 70,
    size: 12,
    font: fontBold,
    color: textDark
  });

  page.drawText(shortId, {
    x: 585,
    y: 40,
    size: 9,
    font: fontBold,
    color: textDark
  });

  // ===== QR =====
  const verifyUrl = `https://thehumanmosaic.art/verify.html?id=${submissionId}`;
  const qrData = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 220
  });

  const qrImageBytes = await fetch(qrData).then(res => res.arrayBuffer());
  const qrImage = await pdfDoc.embedPng(qrImageBytes);

  page.drawImage(qrImage, {
    x: 720,
    y: 60,
    width: 90,
    height: 90
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
