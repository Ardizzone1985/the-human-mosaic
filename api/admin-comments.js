import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

function getAdminTokenFromRequest(req) {
  const cookieHeader = req.headers.cookie || "";

  const cookies = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean);

  const adminCookie = cookies.find((cookie) =>
    cookie.startsWith("thm_admin_session=")
  );

  if (!adminCookie) {
    return null;
  }

  return adminCookie.substring("thm_admin_session=".length);
}

function verifyAdminToken(token) {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || !token) {
    return false;
  }

  const separatorIndex = token.indexOf(".");

  if (separatorIndex === -1) {
    return false;
  }

  const issuedAt = token.substring(0, separatorIndex);
  const receivedSignature = token.substring(separatorIndex + 1);

  if (!issuedAt || !receivedSignature) {
    return false;
  }

  const timestamp = Number(issuedAt);

  if (!Number.isFinite(timestamp)) {
    return false;
  }

  const maxAge = 8 * 60 * 60 * 1000;

  if (Date.now() - timestamp > maxAge || timestamp > Date.now()) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(issuedAt)
    .digest("hex");

  const receivedBuffer = Buffer.from(receivedSignature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export default async function handler(req, res) {
  try {
    const token = getAdminTokenFromRequest(req);

    if (!verifyAdminToken(token)) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (req.method !== "GET") {
      return res.status(405).json({
        error: "Method not allowed",
      });
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("photo_comments")
      .select(
        "id, submission_id, user_id, comment, created_at, approval_status, moderation_flagged, moderation_categories, moderation_model, moderated_at, approved_at"
      )
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Admin comments query error:", error);

      return res.status(500).json({
        error: "Failed to load comments",
      });
    }

    return res.status(200).json({
      success: true,
      comments: data || [],
    });
  } catch (error) {
    console.error("Admin comments error:", error);

    return res.status(500).json({
      error: "Server error",
    });
  }
}
