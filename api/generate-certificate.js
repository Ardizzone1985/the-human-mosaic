import puppeteer from "puppeteer";

export default async function handler(req, res) {
  const { name, room, wall, section, spot, id } = req.body;

  const html = `
    <html>
      <body>
        <h1>Certificate</h1>
        <h2>${name}</h2>
        <p>${room} - ${wall} - ${section}</p>
        <p>Spot: ${spot}</p>
        <p>ID: ${id}</p>
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
