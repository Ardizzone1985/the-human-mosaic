export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  return res.status(410).json({
    error: "Legacy photo checkout is no longer available.",
    code: "LEGACY_CHECKOUT_DISABLED"
  });
}
