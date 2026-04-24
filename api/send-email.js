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

  const baseImageUrl = `https://${req.headers.host}/certificate-base3.png`;
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
  const darkGold = rgb(0.50, 0.37, 0.08);
  const textDark = rgb(0.18, 0.18, 0.18);
  const textSoft = rgb(0.35, 0.35, 0.35);
  const lineSoft = rgb(0.78, 0.78, 0.78);

  const drawCentered = (text, y, size, font, color = textDark) => {
    const safe = String(text || "");
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
    const safe = String(text || "");
    while (size > minSize && font.widthOfTextAtSize(safe, size) > maxWidth) {
      size -= 0.5;
    }
    return size;
  };

  const cleanName = String(fullName || "").trim();
  const roomText = String(room || "").toUpperCase().trim();
  const wallText = String(wall || "").toUpperCase().trim();
  const sectionText = String(section || "").toUpperCase().trim();
  const spotText = String(spot || "").toUpperCase().trim();
  const shortId = String(submissionId || "").toUpperCase().trim();

  let countryText = String(country || "ITALY").toUpperCase().trim();
  if (countryText.length > 20) {
    countryText = countryText.slice(0, 18);
  }

  // --- NAME ---
  const nameSize = fitText(cleanName, 430, 34, fontBold, 22);
  drawCentered(cleanName, 332, nameSize, fontBold, gold);

  // underline under name
  page.drawLine({
    start: { x: 275, y: 322 },
    end: { x: 567, y: 322 },
    thickness: 1,
    color: lineSoft
  });

  // --- MAIN TITLE LINE ---
  drawCentered(
    `Official Participant • ${String(room || "").trim()} Room`,
    288,
    16,
    fontBold,
    textDark
  );

  // --- WOW LINE ---
  drawCentered(
    `One face. One story. One piece of humanity.`,
    268,
    12,
    fontItalic,
    darkGold
  );

  // --- GLOBAL VALUE LINE ---
  drawCentered(
    `One of 1,000,000 participants in a permanent global artwork.`,
    246,
    11,
    fontRegular,
    textSoft
  );

  // --- LEGACY LINE ---
  drawCentered(
    `This contribution becomes part of a future permanent physical installation.`,
    186,
    10.5,
    fontItalic,
    textDark
  );

  // --- SIGNATURE BLOCK BOOST ---
  drawCentered(
    `Permanent Position Verified`,
    120,
    10,
    fontBold,
    darkGold
  );

  // --- INFO BLOCK BOTTOM RIGHT ---
  const headerY = 94;
  const valueY = 48;

  // country centered over block
  const countrySize = fitText(countryText, 150, 11, fontBold, 8);
  const countryWidth = fontBold.widthOfTextAtSize(countryText, countrySize);

  page.drawText(countryText, {
    x: 640 - (countryWidth / 2),
    y: headerY,
    size: countrySize,
    font: fontBold,
    color: textDark
  });

  // participant id label line under the bottom block title
  page.drawLine({
    start: { x: 455, y: 89 },
    end: { x: 780, y: 89 },
    thickness: 0.8,
    color: lineSoft
  });

  page.drawText(roomText, {
    x: 520,
    y: valueY,
    size: fitText(roomText, 65, 12, fontBold, 9),
    font: fontBold,
    color: textDark
  });

  page.drawText(wallText, {
    x: 598,
    y: valueY,
    size: fitText(wallText, 62, 11.5, fontBold, 8.5),
    font: fontBold,
    color: textDark
  });

  page.drawText(sectionText, {
    x: 675,
    y: valueY,
    size: fitText(sectionText, 42, 12, fontBold, 9),
    font: fontBold,
    color: textDark
  });

  page.drawText(spotText, {
    x: 744,
    y: valueY,
    size: fitText(spotText, 48, 12, fontBold, 8.5),
    font: fontBold,
    color: textDark
  });

  page.drawText(shortId, {
    x: 618,
    y: 31,
    size: fitText(shortId, 165, 9, fontBold, 7),
    font: fontBold,
    color: textSoft
  });

  // --- QR ---
  const verifyUrl = `https://thehumanmosaic.art/verify.html?id=${submissionId}`;
  const qrData = await QRCode.toDataURL(verifyUrl, {
    margin: 1,
    width: 220,
    color: {
      dark: "#1f1f1f",
      light: "#FFFFFF"
    }
  });

  const qrImageBytes = await fetch(qrData).then(res => res.arrayBuffer());
  const qrImage = await pdfDoc.embedPng(qrImageBytes);

  page.drawImage(qrImage, {
    x: 690,
    y: 465,
    width: 88,
    height: 88
  });

  page.drawText("SCAN TO VERIFY", {
    x: 694,
    y: 448,
    size: 7,
    font: fontBold,
    color: textSoft
  });

  return await pdfDoc.save();
}

export default async function handler(req, res) {
  try {
    const body = await getJsonBody(req);

    if (!body.email || body.email === "—") {
      return res.status(400).json({ error: "Invalid email" });
    }

    const emailType = body.type || "approved";
    const galleryLink = `https://thehumanmosaic.art/gallery.html?id=${body.submissionId}`;

    // ✅ EMAIL 1: SUBMITTED (immediata dopo upload, SENZA certificato)
    if (emailType === "submitted") {
      await resend.emails.send({
        from: 'The Human Mosaic <info@mail.thehumanmosaic.art>',
        to: [body.email],
        subject: 'Your submission has been received',
        html: `
          <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1f1f1f; max-width: 680px; margin: 0 auto; padding: 24px;">
            <div style="background: #ffffff; border: 1px solid #e8e8e8; border-radius: 20px; padding: 32px;">
              <p style="font-size: 12px; letter-spacing: 0.14em; color: #777; margin: 0 0 18px;">
                ONE HUMANITY. MILLIONS OF FACES. ONE MOSAIC.
              </p>

              <h2 style="margin: 0 0 18px; font-size: 28px; line-height: 1.2;">
                Your submission has been received
              </h2>

              <p>Hello ${body.fullName || 'Participant'},</p>

              <p style="color:#555;">
                Thank you for taking part in <strong>The Human Mosaic</strong>.
              </p>

              <p>
                Your image has been successfully submitted and is now in the official review process.
              </p>

              <hr style="border: none; border-top: 1px solid #e3e3e3; margin: 24px 0;">

              <p><strong>Submission ID:</strong> ${body.submissionId || '—'}</p>
              <p><strong>Room:</strong> ${body.room || '—'}</p>
              <p><strong>Wall:</strong> ${body.wall || '—'}</p>
              <p><strong>Section:</strong> ${body.section || '—'}</p>
              <p><strong>Spot:</strong> ${body.spot || '—'}</p>

              <hr style="border: none; border-top: 1px solid #e3e3e3; margin: 24px 0;">

              <p><strong>What happens next?</strong></p>
              <p>1. Review — We check that your image matches the selected room and project guidelines.</p>
              <p>2. Approval — Once approved, your image will become part of the live gallery.</p>
              <p>3. Certificate — After approval, you will receive your official certificate by email.</p>

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
Your submission has been received

Hello ${body.fullName || 'Participant'},

Thank you for taking part in The Human Mosaic.

Your image has been successfully submitted and is now in the official review process.

Submission ID: ${body.submissionId || '—'}
Room: ${body.room || '—'}
Wall: ${body.wall || '—'}
Section: ${body.section || '—'}
Spot: ${body.spot || '—'}

What happens next?
1. Review — We check that your image matches the selected room and project guidelines.
2. Approval — Once approved, your image will become part of the live gallery.
3. Certificate — After approval, you will receive your official certificate by email.

Support: info@thehumanmosaic.art

— The Human Mosaic
        `.trim()
      });

      return res.status(200).json({ success: true, type: "submitted" });
    }

    // ✅ EMAIL 2: APPROVED (dopo approvazione, CON certificato)
    const certificateResponse = await fetch(`https://${req.headers.host}/api/generate-certificate-v3-pdf`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: body.fullName,
    room: body.room,
    wall: body.wall,
    section: body.section,
    spot: body.spot,
    id: body.submissionId,
    country: body.country
  })
});

if (!certificateResponse.ok) {
  throw new Error("Failed to generate certificate via V3 API");
}

const pdfBytes = await certificateResponse.arrayBuffer();

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
              Your image has been approved and is now part of this global artwork.
            </p>

            <p><strong>Your contribution is now officially included.</strong></p>

            <hr style="border: none; border-top: 1px solid #e3e3e3; margin: 24px 0;">

            <p><strong>Submission ID:</strong> ${body.submissionId}</p>
            <p><strong>Room:</strong> ${body.room}</p>
            <p><strong>Wall:</strong> ${body.wall || '—'}</p>
            <p><strong>Section:</strong> ${body.section || '—'}</p>
            <p><strong>Spot:</strong> ${body.spot}</p>

            <hr style="border: none; border-top: 1px solid #e3e3e3; margin: 24px 0;">

            <p style="margin-bottom:10px;">
              <strong>View your contribution in the live gallery:</strong>
            </p>

            <p>
              <a href="${galleryLink}" style="color:#111; font-weight:700; text-decoration:none;">
                Open your personal gallery link
              </a>
            </p>

            <p style="margin-top: 24px;">
              Your official certificate is attached to this email.
            </p>

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

Your image has been approved and is now part of this global artwork.

Your contribution is now officially included.

Submission ID: ${body.submissionId}
Room: ${body.room}
Wall: ${body.wall || '—'}
Section: ${body.section || '—'}
Spot: ${body.spot}

View your contribution in the live gallery:
${galleryLink}

Your official certificate is attached to this email.

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

    return res.status(200).json({ success: true, type: "approved" });
  } catch (error) {
    console.error('PDF / EMAIL ERROR:', error);
    return res.status(500).json({ error: error.message });
  }
}
