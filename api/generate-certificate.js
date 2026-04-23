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

  const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage([842, 595]);
const { width } = page.getSize();

  page.drawRectangle({
  x: 0,
  y: 0,
  width: 842,
  height: 595,
  color: rgb(0.98, 0.97, 0.94)
});

  page.drawRectangle({
  x: 20,
  y: 20,
  width: 802,
  height: 555,
  borderColor: rgb(0.75, 0.6, 0.2),
  borderWidth: 2
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

  drawCentered("THE HUMAN MOSAIC", 520, 18, fontBold, gold);

drawCentered("PERMANENT POSITION CERTIFICATE", 500, 10, fontRegular, textSoft);

drawCentered("CERTIFICATE OF PARTICIPATION", 470, 26, fontBold, textDark);

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

  const nameSize = fitText(cleanName, 600, 48, fontBold, 28);

drawCentered(cleanName, 400, nameSize, fontBold, gold);

  page.drawLine({
    start: { x: 275, y: 322 },
    end: { x: 567, y: 322 },
    thickness: 1,
    color: lineSoft
  });

  drawCentered(
  `Official Participant • ${roomText} Room`,
  360,
  16,
  fontBold,
  textDark
);

drawCentered(
  "One face. One story. One piece of humanity.",
  335,
  14,
  fontItalic,
  darkGold
);

drawCentered(
  "Permanent position registered in a global collective artwork.",
  310,
  12,
  fontRegular,
  textSoft
);

  drawCentered(
  `Part of a future permanent physical installation.`,
  180,
  11,
  fontItalic,
  textDark
);

  drawCentered(
  `VERIFIED POSITION`,
  120,
  11,
  fontBold,
  darkGold
);

drawCentered(
  `Early Contributor`,
  105,
  9,
  fontItalic,
  darkGold
);

  drawCentered(
  `FROM ${countryText}`,
  240,
  18,
  fontBold,
  textDark
);

  drawCentered(
  `${roomText} ROOM • ${wallText}`,
  215,
  13,
  fontBold,
  textDark
);

drawCentered(
  `SECTION ${sectionText} • SPOT ${spotText}`,
  195,
  11,
  fontRegular,
  textSoft
);

drawCentered(
  `Certificate ID: ${shortId}`,
  175,
  8,
  fontRegular,
  textSoft
);

 page.drawText("Giuseppe Ardizzone", {
  x: 80,
  y: 130,
  size: 20,
  font: fontItalic,
  color: textDark
});

page.drawLine({
  start: { x: 80, y: 122 },
  end: { x: 230, y: 122 },
  thickness: 1,
  color: lineSoft
});

page.drawText("Founder & Curator", {
  x: 80,
  y: 105,
  size: 9,
  font: fontRegular,
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
