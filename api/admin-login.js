import crypto from "crypto";

function createAdminToken() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("Missing ADMIN_SESSION_SECRET");
  }

  const issuedAt = Date.now().toString();

  const signature = crypto
    .createHmac("sha256", secret)
    .update(issuedAt)
    .digest("hex");

  return `${issuedAt}.${signature}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { password } = req.body || {};

    if (!password) {
      return res.status(400).json({
        error: "Missing password",
      });
    }

    if (
      !process.env.ADMIN_PANEL_PASSWORD ||
      password !== process.env.ADMIN_PANEL_PASSWORD
    ) {
      return res.status(401).json({
        error: "Invalid password",
      });
    }

    const token = createAdminToken();

    res.setHeader(
      "Set-Cookie",
      [
        `thm_admin_session=${token}`,
        "Path=/",
        "HttpOnly",
        "Secure",
        "SameSite=Strict",
        "Max-Age=28800",
      ].join("; ")
    );

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      error: "Server error",
    });
  }
}
