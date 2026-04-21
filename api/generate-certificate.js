import puppeteer from "puppeteer";

export default async function handler(req, res) {
  const { name, room, wall, section, spot, id, country } = req.body;

const verifyLink = `https://thehumanmosaic.art/verify.html?id=${id}`;

const html = `
<html>
<head>
<style>
  body {
    font-family: Arial, sans-serif;
    text-align: center;
    padding: 40px;
    background: #f8f8f6;
  }

  .container {
    border: 8px solid #d4af37;
    padding: 40px;
    background: white;
  }

  h1 {
    font-size: 40px;
    margin-bottom: 10px;
  }

  .subtitle {
    font-size: 14px;
    letter-spacing: 2px;
    color: #888;
    margin-bottom: 20px;
  }

  .name {
    font-size: 36px;
    font-weight: bold;
    color: #b8962e;
    margin: 30px 0;
  }

  .big-line {
    font-size: 18px;
    margin: 15px 0;
  }

  .highlight {
    font-weight: bold;
  }

  .footer {
    margin-top: 40px;
    font-size: 12px;
    color: #666;
  }

  .qr {
    margin-top: 30px;
  }
</style>
</head>

<body>
  <div class="container">

    <div class="subtitle">PERMANENT POSITION CERTIFICATE</div>

    <h1>CERTIFICATE OF PARTICIPATION</h1>

    <p class="big-line">This certifies that</p>

    <div class="name">${name}</div>

    <p class="big-line highlight">
      Official Participant • ${room} Room
    </p>

    <p class="big-line">
      You are now part of the largest human artwork ever created.
    </p>

    <p class="big-line">
      Participant #${id.slice(0,6)} of 1,000,000
    </p>

    <p class="big-line">
      Origin: ${country || "Unknown"} 🌍
    </p>

    <p class="big-line">
      ${room} • ${wall} • ${section} • ${spot}
    </p>

    <div class="footer">
      This artwork will exist as a permanent physical installation.
    </div>

    <div class="qr">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${verifyLink}" />
      <p style="font-size:10px;">Scan to verify</p>
    </div>

  </div>
</body>
</html>
`;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(html);

  const pdf = await page.pdf({ format: "A4" });

  await browser.close();

  res.setHeader("Content-Type", "application/pdf");
  res.send(pdf);
}
