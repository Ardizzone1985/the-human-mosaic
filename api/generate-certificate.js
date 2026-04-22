import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

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
    name,
    room,
    wall,
    section,
    spot,
    id,
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

  const cleanName = String(name || "").trim();
  const roomText = String(room || "").toUpperCase().trim();
  const wallText = String(wall || "").toUpperCase().trim();
  const sectionText = String(section || "").toUpperCase().trim();
  const spotText = String(spot || "").toUpperCase().trim();
  const shortId = String(id || "").toUpperCase().trim();

  let countryText = String(country || "ITALY").toUpperCase().trim();
  if (countryText.length > 20) {
    countryText = countryText.slice(0, 18);
  }

  const nameSize = fitText(cleanName, 430, 34, fontBold, 22);
  drawCentered(cleanName, 332, nameSize, fontBold, gold);

  page.drawLine({
    start: { x: 275, y: 322 },
    end: { x: 567, y: 322 },
    thickness: 1,
    color: lineSoft
  });

  drawCentered(
    `Official Participant • ${String(room || "").trim()} Room`,
    288,
    16,
    fontBold,
    textDark
  );

  drawCentered(
    `One face. One story. One piece of humanity.`,
    268,
    12,
    fontItalic,
    darkGold
  );

  drawCentered(
    `One of 1,000,000 participants in a permanent global artwork.`,
    246,
    11,
    fontRegular,
    textSoft
  );

  drawCentered(
    `This contribution becomes part of a future permanent physical installation.`,
    186,
    10.5,
    fontItalic,
    textDark
  );

  drawCentered(
    `Permanent Position Verified`,
    120,
    10,
    fontBold,
    darkGold
  );

  const headerY = 94;
  const valueY = 48;

  const countrySize = fitText(countryText, 150, 11, fontBold, 8);
  const countryWidth = fontBold.widthOfTextAtSize(countryText, countrySize);

  page.drawText(countryText, {
    x: 640 - (countryWidth / 2),
    y: headerY,
    size: countrySize,
    font: fontBold,
    color: textDark
  });

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

  const verifyUrl = `https://thehumanmosaic.art/verify.html?id=${id}`;
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
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const body = await getJsonBody(req);

    const pdfBytes = await generateCertificatePdf(body, req);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="certificate-${body.id || "download"}.pdf"`
    );

    return res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("GENERATE CERTIFICATE ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}
