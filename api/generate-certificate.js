import puppeteer from "puppeteer";

export default async function handler(req, res) {
  const { name, room, wall, section, spot, id } = req.body;

  const verifyLink = `https://thehumanmosaic.art/verify.html?id=${id}`;

  const html = `
  <html>
    <body style="font-family: Arial; text-align:center; padding:40px;">
      
      <h1 style="margin-bottom:20px;">The Human Mosaic</h1>
      
      <h2 style="margin-bottom:10px;">Official Participation Certificate</h2>
      
      <p style="margin-bottom:30px;">This certifies that</p>

      <h2 style="margin-bottom:30px;">${name}</h2>

      <p>${room} Room</p>
      <p>${wall} - ${section}</p>
      <p>Spot: ${spot}</p>

      <p style="margin-top:20px;">ID: ${id}</p>

      <div style="margin-top:40px;">
        <p style="font-size:12px; color:#666;">
          Scan to verify your participation
        </p>

        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${verifyLink}" />
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
