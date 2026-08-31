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

    const submissionId = Number(req.body?.submissionId);
    const comment = String(req.body?.comment || "").trim();

    if (!Number.isInteger(submissionId) || submissionId <= 0) {
      return res.status(400).json({
        error: "Valid submission ID is required",
      });
    }

    if (!comment) {
      return res.status(400).json({
        error: "Comment is required",
      });
    }

    if (comment.length > 500) {
      return res.status(400).json({
        error: "Comment cannot exceed 500 characters",
      });
    }

    const { data: submission, error: submissionError } =
      await supabase
        .from("submissions")
        .select("id")
        .eq("id", submissionId)
        .maybeSingle();

    if (submissionError) {
      throw submissionError;
    }

    if (!submission) {
      return res.status(404).json({
        error: "Photo not found",
      });
    }

    const { data: latestComment, error: latestCommentError } =
      await supabase
        .from("photo_comments")
        .select("created_at")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

    if (latestCommentError) {
      throw latestCommentError;
    }

    if (latestComment?.created_at) {
      const lastCommentTime = new Date(
        latestComment.created_at
      ).getTime();

      const now = Date.now();
      const cooldownMs = 10 * 1000;
      const elapsedMs = now - lastCommentTime;

      if (elapsedMs < cooldownMs) {
        const remainingSeconds = Math.ceil(
          (cooldownMs - elapsedMs) / 1000
        );

        return res.status(429).json({
          error: `Please wait ${remainingSeconds} seconds before posting another comment.`,
          retryAfterSeconds: remainingSeconds,
        });
      }
    }

    const moderation = await moderateMessage(comment);

    const approvalStatus = moderation.flagged
      ? "pending"
      : "approved";

    const nowIso = new Date().toISOString();

    const { data: insertedComment, error: insertError } =
      await supabase
        .from("photo_comments")
        .insert({
          submission_id: submissionId,
          user_id: user.id,
          comment,
          approval_status: approvalStatus,
          moderation_flagged: moderation.flagged,
          moderation_categories: moderation.categories,
          moderation_model: moderation.model,
          moderated_at: nowIso,
          approved_at: moderation.flagged ? null : nowIso,
        })
        .select("id, submission_id, created_at, approval_status")
        .single();

    if (insertError) {
      throw insertError;
    }

    return res.status(200).json({
      success: true,
      moderation,
      approvalStatus,
      comment: insertedComment,
    });
  } catch (error) {
    console.error("Photo comment moderation error:", error);

    return res.status(500).json({
      error:
        error?.message ||
        "Comment moderation could not be completed",
    });
  }
}