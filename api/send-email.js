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
    submissionId,
    country
  } = data;

  const baseImageUrl = `https://${req.headers.host}/certificate-base2.png`;
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

  const fitText = (text, maxWidth, startSize, font, minSize = 8) => {
    let size = startSize;
    const safe = String(text || '');
    while (size > minSize && font.widthOfTextAtSize(safe, size) > maxWidth) {
      size -= 0
