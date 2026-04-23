import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import QRCode from "qrcode";
chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default async function handler(req, res) {
  try {
    const { name, room, wall, section, spot, id, country } = req.body || {};

    const safeName = escapeHtml(name || "Participant");
    const safeRoom = escapeHtml(room || "Room");
    const safeWall = escapeHtml(wall || "Wall");
    const safeSection = escapeHtml(section || "Section");
    const safeSpot = escapeHtml(spot || "Spot");
    const safeId = escapeHtml(id || "UNKNOWN");
    const safeCountry = escapeHtml((country || "Unknown").toUpperCase());

    const verifyLink = `https://thehumanmosaic.art/verify.html?id=${encodeURIComponent(id || "")}`;
    const qrCode = await QRCode.toDataURL(verifyLink, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 220
    });

    const logoUrl = "https://thehumanmosaic.art/logo.png";
    const signatureUrl = "https://thehumanmosaic.art/signature.png";
    const sealUrl = "https://thehumanmosaic.art/sigillo.png";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Certificate</title>
<style>
  * {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    background: #f5f0e6;
    font-family: Georgia, "Times New Roman", serif;
    color: #1d1d1b;
  }

  body {
    width: 1400px;
    height: 990px;
  }

  .certificate {
    position: relative;
    width: 1400px;
    height: 990px;
    margin: 0 auto;
    overflow: hidden;
    background:
      radial-gradient(circle at 20% 20%, rgba(201,166,77,0.08), transparent 18%),
      radial-gradient(circle at 80% 18%, rgba(201,166,77,0.07), transparent 20%),
      radial-gradient(circle at 15% 85%, rgba(88,65,29,0.05), transparent 16%),
      radial-gradient(circle at 85% 82%, rgba(88,65,29,0.05), transparent 18%),
      linear-gradient(180deg, #fcf8f0 0%, #f7f1e4 100%);
  }

  .paper-noise {
    position: absolute;
    inset: 0;
    opacity: 0.08;
    background-image:
      radial-gradient(rgba(0,0,0,0.5) 0.4px, transparent 0.6px),
      radial-gradient(rgba(0,0,0,0.35) 0.3px, transparent 0.55px);
    background-size: 18px 18px, 24px 24px;
    background-position: 0 0, 9px 11px;
    pointer-events: none;
  }

  .border-outer,
  .border-inner {
    position: absolute;
    inset: 26px;
    border: 3px solid #be8f2d;
    pointer-events: none;
  }

  .border-inner {
    inset: 38px;
    border-width: 1.5px;
    opacity: 0.85;
  }

  .corner {
    position: absolute;
    width: 110px;
    height: 110px;
    border-color: #be8f2d;
    pointer-events: none;
  }

  .corner.tl {
    top: 22px;
    left: 22px;
    border-top: 4px solid #be8f2d;
    border-left: 4px solid #be8f2d;
    border-top-left-radius: 6px;
  }

  .corner.tr {
    top: 22px;
    right: 22px;
    border-top: 4px solid #be8f2d;
    border-right: 4px solid #be8f2d;
    border-top-right-radius: 6px;
  }

  .corner.bl {
    bottom: 22px;
    left: 22px;
    border-bottom: 4px solid #be8f2d;
    border-left: 4px solid #be8f2d;
    border-bottom-left-radius: 6px;
  }

  .corner.br {
    bottom: 22px;
    right: 22px;
    border-bottom: 4px solid #be8f2d;
    border-right: 4px solid #be8f2d;
    border-bottom-right-radius: 6px;
  }

  .content {
    position: absolute;
    inset: 58px 74px;
  }

  .top {
    position: relative;
    text-align: center;
    padding-top: 8px;
  }

  .logo {
    width: 320px;
    height: auto;
    display: block;
    margin: 0 auto 6px;
  }

  .kicker-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    margin-top: 8px;
  }

  .kicker-line {
    width: 150px;
    height: 1px;
    background: #be8f2d;
  }

  .kicker {
    font-size: 22px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: #a87a1c;
  }

  .title {
    margin-top: 10px;
    font-size: 72px;
    line-height: 1.02;
    letter-spacing: 1px;
    color: #242424;
    text-transform: uppercase;
  }

  .title-divider {
    width: 820px;
    height: 1px;
    background: #cfb27a;
    margin: 14px auto 0;
    position: relative;
  }

  .title-divider::after {
    content: "✧";
    position: absolute;
    top: -16px;
    left: 50%;
    transform: translateX(-50%);
    color: #be8f2d;
    font-size: 22px;
    background: #faf5ea;
    padding: 0 10px;
  }

  .qr-box {
    position: absolute;
    top: 8px;
    right: 0;
    text-align: center;
  }

  .qr-frame {
    background: rgba(255,255,255,0.78);
    border: 2px solid #d2b57a;
    padding: 10px;
    box-shadow: 0 4px 18px rgba(0,0,0,0.08);
  }

  .qr-frame img {
    display: block;
    width: 138px;
    height: 138px;
  }

  .qr-label {
    margin-top: 10px;
    font-family: Arial, sans-serif;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: #313131;
    text-transform: uppercase;
  }

  .center {
    text-align: center;
    margin-top: 58px;
    position: relative;
  }

  .laurel {
    position: absolute;
    inset: 110px 0 auto 0;
    display: flex;
    justify-content: center;
    gap: 280px;
    opacity: 0.08;
    pointer-events: none;
  }

  .laurel span {
    font-size: 260px;
    line-height: 1;
    color: #b08a3c;
  }

  .participant-name {
    position: relative;
    z-index: 2;
    margin: 0;
    font-size: 96px;
    line-height: 1;
    font-weight: 700;
    color: #b2821e;
    letter-spacing: 0.5px;
    text-shadow: 0 1px 0 rgba(255,255,255,0.85);
  }

  .name-line {
    width: 700px;
    height: 1px;
    background: #ceb686;
    margin: 18px auto 24px;
  }

  .subtitle {
    font-size: 30px;
    font-weight: 700;
    color: #202020;
    margin-bottom: 12px;
  }

  .tagline {
    font-size: 28px;
    font-style: italic;
    color: #a77818;
    margin-bottom: 14px;
  }

  .desc {
    font-family: Arial, sans-serif;
    font-size: 17px;
    color: #434343;
    margin-bottom: 40px;
  }

  .origin-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-bottom: 14px;
  }

  .origin-line {
    width: 120px;
    height: 1px;
    background: #c7a45b;
  }

  .origin {
    font-size: 34px;
    font-weight: 700;
    color: #222;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 34px;
    width: 560px;
    margin: 0 auto 18px;
    font-family: Arial, sans-serif;
    font-size: 16px;
    color: #2a2a2a;
  }

  .meta-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .meta-label {
    color: #8f6e22;
    font-weight: 700;
  }

  .meta-value {
    font-weight: 700;
  }

  .legacy {
    font-size: 18px;
    font-style: italic;
    color: #4a4a4a;
    margin-bottom: 8px;
  }

  .certificate-id {
    font-family: Arial, sans-serif;
    font-size: 14px;
    letter-spacing: 0.08em;
    color: #666;
    text-transform: uppercase;
  }

  .bottom {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 10px;
    height: 240px;
  }

  .signature-block {
    position: absolute;
    left: 40px;
    bottom: 16px;
    width: 430px;
    text-align: center;
  }

  .signature-img {
    width: 340px;
    height: auto;
    display: block;
    margin: 0 auto 6px;
  }

  .signature-line {
    width: 250px;
    height: 1px;
    background: #c3a35e;
    margin: 0 auto 12px;
  }

  .signature-name {
    font-size: 22px;
    color: #2b2b2b;
  }

  .signature-role {
    font-size: 16px;
    color: #5a5a5a;
    margin-top: 6px;
  }

  .signature-project {
    font-size: 18px;
    color: #7c6a46;
    font-style: italic;
    margin-top: 6px;
  }

  .seal-block {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 0;
    width: 260px;
    text-align: center;
  }

  .seal-img {
    width: 220px;
    height: 220px;
    object-fit: contain;
    display: block;
    margin: 0 auto;
    filter: drop-shadow(0 10px 18px rgba(0,0,0,0.18));
  }

  .seal-caption {
    margin-top: -10px;
    font-family: Arial, sans-serif;
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #8b6820;
    font-weight: 700;
  }

  .brand-block {
    position: absolute;
    right: 40px;
    bottom: 24px;
    width: 360px;
    text-align: center;
  }

  .brand-mini {
    width: 165px;
    height: auto;
    display: block;
    margin: 0 auto 8px;
  }

  .brand-text {
    font-family: Arial, sans-serif;
    font-size: 18px;
    line-height: 1.35;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #2f2f2f;
  }

  .brand-divider {
    width: 240px;
    height: 1px;
    background: #c7a45b;
    margin: 16px auto 0;
    position: relative;
  }

  .brand-divider::after {
    content: "✧";
    position: absolute;
    top: -11px;
    left: 50%;
    transform: translateX(-50%);
    color: #be8f2d;
    font-size: 16px;
    background: #faf5ea;
    padding: 0 8px;
  }
</style>
</head>
<body>
<div style="font-size:42px; color:red; text-align:center; font-weight:700;">
    PUPPETEER V3 ATTIVO
  </div>
  <div class="certificate">
    <div class="paper-noise"></div>
    <div class="border-outer"></div>
    <div class="border-inner"></div>
    <div class="corner tl"></div>
    <div class="corner tr"></div>
    <div class="corner bl"></div>
    <div class="corner br"></div>

    <div class="content">
      <div class="top">
        <img class="logo" src="${logoUrl}" alt="The Human Mosaic logo" />

        <div class="qr-box">
          <div class="qr-frame">
            <img src="${qrCode}" alt="QR code" />
          </div>
          <div class="qr-label">Scan to verify</div>
        </div>

        <div class="kicker-row">
          <div class="kicker-line"></div>
          <div class="kicker">Permanent Position Certificate</div>
          <div class="kicker-line"></div>
        </div>

<div style="font-size:40px; color:red; text-align:center;">PUPPETEER V2 PREMIUM</div>
        <div class="title">Certificate of Participation</div>
        <div class="title-divider"></div>
      </div>

      <div class="center">
        <div class="laurel">
          <span>❦</span>
          <span>❦</span>
        </div>

        <h1 class="participant-name">${safeName}</h1>
        <div class="name-line"></div>

        <div class="subtitle">Official Participant • ${safeRoom.toUpperCase()} Room</div>
        <div class="tagline">One face. One story. One piece of humanity.</div>
        <div class="desc">Permanent position registered in a global collective artwork.</div>

        <div class="origin-row">
          <div class="origin-line"></div>
          <div class="origin">From ${safeCountry}</div>
          <div class="origin-line"></div>
        </div>

        <div class="meta-grid">
          <div class="meta-item"><span class="meta-label">Room</span><span class="meta-value">${safeRoom.toUpperCase()} Room</span></div>
          <div class="meta-item"><span class="meta-label">Wall</span><span class="meta-value">${safeWall.toUpperCase()}</span></div>
          <div class="meta-item"><span class="meta-label">Section</span><span class="meta-value">${safeSection.toUpperCase()}</span></div>
          <div class="meta-item"><span class="meta-label">Spot</span><span class="meta-value">${safeSpot.toUpperCase()}</span></div>
        </div>

        <div class="legacy">Part of a future permanent physical installation.</div>
        <div class="certificate-id">Certificate ID: ${safeId}</div>
      </div>

      <div class="bottom">
        <div class="signature-block">
          <img class="signature-img" src="${signatureUrl}" alt="Signature" />
          <div class="signature-line"></div>
          <div class="signature-name">Giuseppe Ardizzone</div>
          <div class="signature-role">Founder & Curator</div>
          <div class="signature-project">The Human Mosaic</div>
        </div>

        <div class="seal-block">
          <img class="seal-img" src="${sealUrl}" alt="Seal" />
          <div class="seal-caption">Verified Position</div>
        </div>

        <div class="brand-block">
          <img class="brand-mini" src="${logoUrl}" alt="The Human Mosaic" />
          <div class="brand-text">A global collective artwork<br/>of one million human faces.</div>
          <div class="brand-divider"></div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const browser = await puppeteer.launch({
  args: [
    ...chromium.args,
    "--hide-scrollbars",
    "--disable-web-security"
  ],
  defaultViewport: chromium.defaultViewport,
  executablePath: await chromium.executablePath(),
  headless: chromium.headless,
  ignoreHTTPSErrors: true,
});

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      landscape: true,
      printBackground: true,
      preferCSSPageSize: true
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="PUPPETEER-V2-${id || "download"}.pdf"`
    );
    res.send(pdf);
  } catch (err) {
    console.error("V2 CERTIFICATE ERROR:", err);
    res.status(500).json({ error: "Certificate generation failed" });
  }
}
