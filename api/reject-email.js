import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

function createReplacementToken(submissionId) {
  const secret = process.env.REPLACEMENT_LINK_SECRET;

  if (!secret) {
    throw new Error(
      "Missing REPLACEMENT_LINK_SECRET environment variable"
    );
  }

  const payload = {
    submissionId: String(submissionId || "").trim(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  };

  if (!payload.submissionId) {
    throw new Error(
      "A valid submission ID is required to create the replacement link"
    );
  }

  const encodedPayload = Buffer.from(
    JSON.stringify(payload)
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

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

    const replacementLink =
  `https://www.thehumanmosaic.art/?replacementSubmissionId=${encodeURIComponent(
    body.submissionId || ""
  )}`;
    
    await resend.emails.send({
      from: 'The Human Mosaic <info@mail.thehumanmosaic.art>',
      to: [body.email],
      subject: 'Your submission requires a replacement',
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #1f1f1f; max-width: 680px; margin: 0 auto; padding: 24px;">
          <div style="background: #ffffff; border: 1px solid #e8e8e8; border-radius: 20px; padding: 32px;">
            <p style="font-size: 12px; letter-spacing: 0.14em; color: #777; margin: 0 0 18px;">
              ONE HUMANITY. MILLIONS OF FACES. ONE MOSAIC.
            </p>

            <h2 style="margin: 0 0 18px; font-size: 28px; line-height: 1.2;">
              Your submission requires a replacement
            </h2>

            <p>Hello ${body.fullName || 'Participant'},</p>

            <p style="color:#555;">
              Thank you for your contribution to <strong>The Human Mosaic</strong>.
            </p>

            <p>
  After careful human review, your image could not be approved for exhibition in its current form.
</p>

<p>
  <strong>Your original position has been preserved.</strong>
  You may upload a replacement image without making another payment.
</p>

${body.rejectionReason ? `
  <div style="margin: 22px 0; padding: 16px 18px; background: #f7f7f7; border-left: 4px solid #111; border-radius: 8px;">
    <strong>Review note</strong>
    <p style="margin: 8px 0 0; color: #555;">
      ${body.rejectionReason}
    </p>
  </div>
` : ''}

            <hr style="border: none; border-top: 1px solid #e3e3e3; margin: 24px 0;">

            <p><strong>Submission ID:</strong> ${body.submissionId || '—'}</p>
            <p><strong>Room:</strong> ${body.room || '—'}</p>
            <p><strong>Wall:</strong> ${body.wall || '—'}</p>
            <p><strong>Section:</strong> ${body.section || '—'}</p>
            <p><strong>Spot:</strong> ${body.spot || '—'}</p>

            <hr style="border: none; border-top: 1px solid #e3e3e3; margin: 24px 0;">

            <p style="margin-bottom: 14px;">
  Use the button below to submit your replacement image:
</p>

<p style="margin: 0 0 24px;">
  <a
    href="${replacementLink}"
    style="
      display: inline-block;
      padding: 14px 22px;
      background: #111;
      color: #fff;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 700;
      letter-spacing: 0.04em;
    "
  >
    UPLOAD REPLACEMENT IMAGE
  </a>
</p>

<p style="color: #555;">
  Your room, wall, section and position will remain unchanged.
  No additional payment is required.
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
Your submission requires a replacement

Hello ${body.fullName || 'Participant'},

Thank you for contributing to The Human Mosaic.

After careful human review, your image could not be approved for exhibition in its current form.

Your original position has been preserved.
You may upload a replacement image without making another payment.

${body.rejectionReason
  ? `Review note: ${body.rejectionReason}\n`
  : ""}

Submission ID: ${body.submissionId || '—'}
Room: ${body.room || '—'}
Wall: ${body.wall || '—'}
Section: ${body.section || '—'}
Spot: ${body.spot || '—'}

Upload your replacement image:
${replacementLink}

Your room, wall, section and position will remain unchanged.
No additional payment is required.

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
