import { Resend } from 'resend';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
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

function replaceTemplate(html, data) {
  let result = html;

  for (const key in data) {
    result = result.replaceAll(`{{${key}}}`, data[key]);
  }

  return result;
}

async function generatePdfFromHtml(html) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({
    format: 'A4',
    landscape: true,
    printBackground: true
  });

  await browser.close();
  return pdf;
}

export default async function handler(req, res) {
  try {
    const body = await getJsonBody(req);

    const {
      fullName,
      email,
      room,
      wall,
      section,
      spot,
      submissionId
    } = body;

    // 🔗 QR
    const verifyUrl = `https://thehumanmosaic.art/verify.html?id=${submissionId}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl);

    // 📄 TEMPLATE HTML (IMPORTANTE)
    const template = `
      ${await fetch('https://thehumanmosaic.art/certificate-template.html').then(r => r.text())}
    `;

    const html = replaceTemplate(template, {
      FULL_NAME: fullName,
      ROOM_UPPER: room.toUpperCase(),
      WALL_UPPER: wall?.toUpperCase() || '',
      SECTION: section || '',
      SPOT: spot,
      SUBMISSION_ID: submissionId,
      CERTIFICATE_ID: submissionId,
      PARTICIPANT_NUMBER: Math.floor(Math.random() * 1000000),

      QR_URL: qrDataUrl,
      SIGNATURE_URL: 'https://thehumanmosaic.art/signature-clean.png',
      LOGO_URL: 'https://thehumanmosaic.art/logo-cropped.png',
      SEAL_URL: 'https://thehumanmosaic.art/seal.png',
      LAUREL_URL: 'https://thehumanmosaic.art/laurel.png'
    });

    const pdf = await generatePdfFromHtml(html);

    await resend.emails.send({
      from: 'The Human Mosaic <info@mail.thehumanmosaic.art>',
      to: [email],
      subject: 'Your Certificate — The Human Mosaic',
      html: `<p>Your certificate is attached.</p>`,
      attachments: [
        {
          filename: `certificate-${submissionId}.pdf`,
          content: Buffer.from(pdf).toString('base64')
        }
      ]
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
