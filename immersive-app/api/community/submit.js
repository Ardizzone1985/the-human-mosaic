import { moderateMessage } from "../../lib/ai/moderation.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const message = String(
      req.body?.message || ""
    ).trim();

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        error:
          "Message cannot exceed 500 characters",
      });
    }

    const moderation =
      await moderateMessage(message);

    return res.status(200).json({
      success: true,
      moderation,
    });
  } catch (error) {
    console.error(
      "Community moderation test error:",
      error
    );

    return res.status(500).json({
      error:
        error?.message ||
        "Moderation could not be completed",
    });
  }
}
