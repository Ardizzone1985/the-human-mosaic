export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { password } = req.body || {};

    if (!password) {
      return res.status(400).json({ error: "Missing password" });
    }

    if (password !== process.env.ADMIN_PANEL_PASSWORD) {
      return res.status(401).json({ error: "Invalid password" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}
