import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      fullName,
      email,
      room,
      spot,
      submissionId
    } = req.body;

    const response = await resend.emails.send({
      from: 'The Human Mosaic <info@thehumanmosaic.art>',
      to: email,
      subject: 'Welcome to The Human Mosaic',
      html: `
        <h2>Welcome to The Human Mosaic</h2>
        <p>Hi ${fullName},</p>

        <p><strong>You are now part of something that will live forever.</strong></p>

        <p>Your submission has been successfully received and is now under review.</p>

        <p><strong>Submission ID:</strong> ${submissionId}</p>
        <p><strong>Room:</strong> ${room}</p>
        <p><strong>Spot:</strong> ${spot}</p>

        <br/>

        <p>We will contact you once your submission is approved.</p>

        <p>— The Human Mosaic</p>
      `
    });

    return res.status(200).json({ success: true, response });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Email failed' });
  }
}
