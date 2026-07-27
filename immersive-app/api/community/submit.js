import { createClient } from "@supabase/supabase-js";
import { moderateMessage } from "../../lib/ai/moderation.js";

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

function getAccessToken(req) {
  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice(7).trim();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const accessToken = getAccessToken(req);

    if (!accessToken) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const supabase = getSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return res.status(401).json({
        error: "Invalid or expired session",
      });
    }

    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        error: "Message cannot exceed 500 characters",
      });
    }

    const moderation = await moderateMessage(message);

    return res.status(200).json({
      success: true,
      userId: user.id,
      moderation,
    });
  } catch (error) {
    console.error("Community moderation error:", error);

    return res.status(500).json({
      error:
        error?.message ||
        "Moderation could not be completed",
    });
  }
}
