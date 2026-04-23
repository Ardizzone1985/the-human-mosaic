import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import QRCode from "qrcode";

export default async function handler(req, res) {
  try {
    const { name, room, wall, section, spot, id, country } = req.body;

    const verifyLink = `https://thehumanmosaic.art/verify.html?id=${id}`;
    const qrCode = await QRCode.toDataURL(verifyLink);

    const html = `
    <html>
    <head>
      <style>
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #f7f3ea;
        }

        .container {
          width: 1200px;
          height: 850px;
          margin: auto;
          border: 6px solid #c9a64d;
          padding: 40px;
          position: relative;
          background: #fffdf8;
        }

        h1 {
          text-align: center;
          font-size: 40px;
          margin-top: 20px;
        }

        .name {
          text-align: center;
          font-size: 60px;
          color: #a67c00;
          margin: 40px 0;
        }

        .subtitle {
          text-align: center;
          font-size: 20px;
        }

        .country {
          text-align: center;
          margin-top: 40px;
          font-weight: bold;
        }

        .details {
          text-align: center;
          margin-top: 10px;
          font-size: 16px;
        }

        .qr {
          position: absolute;
          top: 40px;
          right: 40px;
        }

        .footer {
          position: absolute;
          bottom: 40px;
          left: 40px;
          font-style: italic;
        }

        .seal {
          position: absolute;
          bottom: 30px;
          right: 50%;
          transform: translateX(50%);
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">

        <div class="qr">
          <img src="${qrCode}" width="120"/>
        </div>

        <h1>CERTIFICATE OF PARTICIPATION</h1>

        <div class="name">${name}</div>

        <div class="subtitle">
          Official Participant • ${room} Room
        </div>

        <div class="country">
          FROM ${country || "UNKNOWN"}
        </div>

        <div class="details">
          ${room} • ${wall} • ${section} • ${spot}
        </div>

        <div class="footer">
          Giuseppe Ardizzone<br/>
          Founder & Curator
        </div>

        <div class="seal">
          VERIFIED POSITION
        </div>

      </div>
    </body>
    </html>
    `;

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Certificate generation failed" });
  }
}
