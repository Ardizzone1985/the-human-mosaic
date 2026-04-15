import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function getJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(JSON.parse(data || '{}')));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  try {
    const body = await getJsonBody(req);

    if (!body.email || body.email === "—") {
      return res.status(400).json({ error: "Invalid email" });
    }

    const uploadLink = `https://thehumanmosaic.art/upload.html?submissionId=${encodeURIComponent(body.submissionId)}&room=${encodeURIComponent(body.room || "")}&wall=${encodeURIComponent(body.wall || "")}&section=${encodeURIComponent(body.section || "")}&spot=${encodeURIComponent(body.spot || "")}&slotCode=${encodeURIComponent(body.slotCode || "")}`;

    await resend.emails.send({
      from: 'The Human Mosaic <info@mail.thehumanmosaic.art>',
      to: [body.email],
      subject: 'Your submission needs a small update',
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1f1f1f; max-width: 680px; margin: 0 auto; padding: 24px;">
          <div style="background: #ffffff; border: 1px solid #e8e8e8; border-radius: 20px; padding: 32px;">
            <p style="font-size: 12px; letter-spacing: 0.14em; color: #777; margin: 0 0 18px;">
              ONE HUMANITY. MILLIONS OF FACES. ONE MOSAIC.
            </p>

            <h2 style="margin: 0 0 18px; font-size: 28px; line-height: 1.2;">
              Your submission needs a small update
            </h2>

            <p>Hello ${body.fullName || 'Participant'},</p>

            <p style="color:#555;">
              Thank you for your contribution to <strong>The Human Mosaic</strong>.
            </p>

            <p>
              After review, your image could not be approved for the selected room because it does not fully match the current project guidelines.
            </p>

            <p>
              This can happen for small reasons such as room criteria, composition, or content alignment.
            </p>

            <hr style="border: none; border-top: 1px solid #e3e3e3; margin: 24px 0;">

            <p><strong>Submission ID:</strong> ${body.submissionId || '—'}</p>
            <p><strong>Room:</strong> ${body.room || '—'}</p>
            <p><strong>Wall:</strong> ${body.wall || '—'}</p>
            <p><strong>Section:</strong> ${body.section || '—'}</p>
            <p><strong>Spot:</strong> ${body.spot || '—'}</p>

            <hr style="border: none; border-top: 1px solid #e3e3e3; margin: 24px 0;">

            <p style="margin-bottom:10px;">
              You can upload a new image here:
            </p>

            <p>
              <a href="${uploadLink}" style="color:#111; font-weight:700; text-decoration:none;">
                Upload a new image
              </a>
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
Your submission needs a small update

Hello ${body.fullName || 'Participant'},

Thank you for your contribution to The Human Mosaic.

After review, your image could not be approved for the selected room because it does not fully match the current project guidelines.

This can happen for small reasons such as room criteria, composition, or content alignment.

Submission ID: ${body.submissionId || '—'}
Room: ${body.room || '—'}
Wall: ${body.wall || '—'}
Section: ${body.section || '—'}
Spot: ${body.spot || '—'}

Upload a new image:
${uploadLink}

Support: info@thehumanmosaic.art

— The Human Mosaic
      `.trim()
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('REJECT EMAIL ERROR:', error);
    return res.status(500).json({ error: error.message });
  }
}
