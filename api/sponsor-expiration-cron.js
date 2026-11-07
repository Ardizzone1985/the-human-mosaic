export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error(
      "Sponsor expiration cron: CRON_SECRET missing"
    );

    return res.status(503).json({
      error: "Cron not configured",
    });
  }

  const authorization = req.headers.authorization;

  if (authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  return res.status(200).json({
    ok: true,
    mode: "safe-check",
    message: "Sponsor expiration endpoint ready",
  });
}
