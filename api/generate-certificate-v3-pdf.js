import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import QRCode from "qrcode";

async function getJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => (data += chunk));
    req.on("end", () => resolve(JSON.parse(data || "{}")));
    req.on("error", reject);
  });
}

async function generateCertificatePdf(data, req) {
  const { name, room, wall, section, spot, id, country } = data;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]);
  const { width } = page.getSize();

  const baseUrl = `https://${req.headers.host}`;
  const baseImageUrl = `${baseUrl}/certificate-base3.png`;

  const baseImageBytes = await fetch(baseImageUrl).then(res => res.arrayBuffer());
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

  const gold = rgb(0.58, 0.42, 0.08);
  const textDark = rgb(0.12, 0.12, 0.12);
  const textSoft = rgb(0.28, 0.28, 0.28);

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

  const fitText = (text, maxWidth, startSize, font, minSize = 18) => {
    let size = startSize;
    const safe = String(text || "");
    while (size > minSize && font.widthOfTextAtSize(safe, size) > maxWidth) {
      size -= 0.5;
    }
    return size;
  };

  const cleanName = String(name || "Participant").trim().toUpperCase();
  const roomText = String(room || "").toUpperCase().trim();
  const wallText = String(wall || "").toUpperCase().trim();
  const sectionText = String(section || "").toUpperCase().trim();
  const spotText = String(spot || "").toUpperCase().trim();
  const shortId = String(id || "").toUpperCase().trim();

  let countryText = String(country || "UNKNOWN").toUpperCase().trim();
  if (countryText.length > 22) countryText = countryText.slice(0, 22);

  const nameSize = fitText(cleanName, 660, 52, fontBold, 28);

  // Nome partecipante
  drawCentered(cleanName, 360, nameSize, fontBold, gold);

  // Official participant
  drawCentered(
    `Official Participant • ${roomText} Room`,
    316,
    15,
    fontBold,
    textDark
  );

  // Country
  drawCentered(
    `FROM ${countryText}`,
    248,
    17,
    fontBold,
    textDark
  );

  // Room / Wall
  page.drawText(`${roomText} ROOM`, {
    x: 312,
    y: 224,
    size: 10.5,
    font: fontBold,
    color: textDark
  });

  page.drawText(wallText, {
    x: 465,
    y: 224,
    size: 10.5,
    font: fontBold,
    color: textDark
  });

  // Section / Spot
  page.drawText(`SECTION ${sectionText}`, {
    x: 312,
    y: 202,
    size: 10.5,
    font: fontBold,
    color: textDark
  });

  page.drawText(`SPOT ${spotText}`, {
    x: 465,
    y: 202,
    size: 10.5,
    font: fontBold,
    color: textDark
  });

  // Certificate ID
  drawCentered(
    `CERTIFICATE ID: ${shortId}`,
    190,
    8.5,
    fontRegular,
    textSoft
  );

  // QR Code
  const verifyUrl = `https://thehumanmosaic.art/verify.html?id=${encodeURIComponent(id || "")}`;
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
    x: 700,
    y: 468,
    width: 78,
    height: 78
  });

  const qrLabel = "SCAN TO VERIFY";
const qrLabelWidth = fontBold.widthOfTextAtSize(qrLabel, 8);

page.drawText(qrLabel, {
  x: 700 + (78 - qrLabelWidth) / 2,
  y: 455,
  size: 8,
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
      `attachment; filename="certificate-v3-${body.id || "download"}.pdf"`
    );

    return res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("GENERATE CERTIFICATE V3 PDF ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}
