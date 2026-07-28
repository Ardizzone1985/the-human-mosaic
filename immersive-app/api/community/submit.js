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

    const { data: latestMessage, error: latestMessageError } =
  await supabase
    .from("community_messages")
    .select("created_at")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

if (latestMessageError) {
  throw latestMessageError;
}

if (latestMessage?.created_at) {
  const lastMessageTime = new Date(
    latestMessage.created_at
  ).getTime();

  const now = Date.now();
  const cooldownMs = 60 * 1000;
  const elapsedMs = now - lastMessageTime;

  if (elapsedMs < cooldownMs) {
    const remainingSeconds = Math.ceil(
      (cooldownMs - elapsedMs) / 1000
    );

    return res.status(429).json({
      error: `Please wait ${remainingSeconds} seconds before posting another message.`,
      retryAfterSeconds: remainingSeconds,
    });
  }
}

    const moderation = await moderateMessage(message);

const { data: profile, error: profileError } = await supabase
  .from("user_profiles")
  .select("nickname, country")
  .eq("id", user.id)
  .single();

if (profileError || !profile) {
  throw new Error("User profile not found.");
}

const approvalStatus = moderation.flagged ? "pending" : "approved";

const { error: insertError } = await supabase
  .from("community_messages")
  .insert({
    user_id: user.id,
    nickname: profile.nickname,
    country: profile.country,
    message,
    approval_status: approvalStatus,
    moderation_flagged: moderation.flagged,
    moderation_categories: moderation.categories,
    moderation_model: moderation.model,
    moderated_at: new Date().toISOString(),
    approved_at: moderation.flagged
      ? null
      : new Date().toISOString(),
  });

if (insertError) {
  throw insertError;
}

return res.status(200).json({
  success: true,
  moderation,
  approvalStatus,
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
