import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ALLOWED_ORIGIN =
  "https://the-human-mosaic-immersive-app.vercel.app";

function setCorsHeaders(res) {
  res.setHeader(
    "Access-Control-Allow-Origin",
    ALLOWED_ORIGIN
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  res.setHeader("Vary", "Origin");
}

function cleanText(value, maximumLength = 500) {
  return String(value || "")
    .trim()
    .slice(0, maximumLength);
}

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const authorization =
      req.headers.authorization || "";

    const accessToken =
      authorization.startsWith("Bearer ")
        ? authorization.slice(7)
        : "";

    if (!accessToken) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(
      accessToken
    );

    if (userError || !user) {
      return res.status(401).json({
        error:
          "Invalid or expired authentication",
      });
    }

    const {
      submissionId,
      imageFileName,
      imageUrl,
      note,
    } = req.body || {};

    const safeSubmissionId = cleanText(
      submissionId,
      200
    );

    const safeImageFileName = cleanText(
      imageFileName,
      500
    );

    const safeImageUrl = cleanText(
      imageUrl,
      1500
    );

    const safeNote = cleanText(
      note,
      500
    );

    if (
      !safeSubmissionId ||
      !safeImageFileName
    ) {
      return res.status(400).json({
        error:
          "Missing required replacement data",
      });
    }

    const expectedFolder =
      `app/${user.id}`;

    if (
      !safeImageFileName.startsWith(
        `${expectedFolder}/`
      )
    ) {
      return res.status(403).json({
        error:
          "The uploaded image does not belong to the authenticated user",
      });
    }

    const fileNameOnly =
      safeImageFileName.split("/").pop();

    const {
      data: storedFiles,
      error: storageError,
    } = await supabaseAdmin.storage
      .from("images")
      .list(expectedFolder, {
        search: fileNameOnly,
        limit: 100,
      });

    if (storageError) {
      console.error(
        "Replacement storage verification error:",
        storageError
      );

      return res.status(500).json({
        error:
          "The replacement image could not be verified",
      });
    }

    const storageObject =
      Array.isArray(storedFiles)
        ? storedFiles.find(
            (file) =>
              file.name === fileNameOnly
          )
        : null;

    if (!storageObject) {
      return res.status(409).json({
        error:
          "The replacement image was not found",
      });
    }

    const supabaseUser = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    global: {
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

const { data, error } =
  await supabaseUser.rpc(
    "replace_my_rejected_app_submission",
    {
      p_submission_id:
        safeSubmissionId,
      p_image_file_name:
        safeImageFileName,
      p_image_url:
        safeImageUrl || null,
      p_note:
        safeNote || null,
    }
  );

if (error) {
  console.error(
    "Replace app submission RPC error:",
    error
  );

  /*
   * Se il database rifiuta la sostituzione,
   * eliminiamo la nuova immagine appena caricata.
   */
  const { error: cleanupError } =
    await supabaseAdmin.storage
      .from("images")
      .remove([safeImageFileName]);

  if (cleanupError) {
    console.error(
      "Replacement image rollback error:",
      cleanupError
    );
  }

  const message =
    error.message ||
    "The memory could not be replaced";

  const conflict =
    message.includes(
      "Only a rejected memory"
    ) ||
    message.includes(
      "does not belong"
    ) ||
    message.includes(
      "not linked"
    ) ||
    message.includes(
      "Payment has not been confirmed"
    ) ||
    message.includes(
      "Submission not found"
    );

  return res
    .status(conflict ? 409 : 500)
    .json({
      error: message,
    });
}

const result =
  Array.isArray(data) && data.length > 0
    ? data[0]
    : null;

if (!result?.submission_id) {
  throw new Error(
    "The replacement was saved but no confirmation was returned"
  );
}

/*
 * Solo dopo il successo del database eliminiamo
 * la vecchia immagine dallo Storage.
 */
const oldImageFileName =
  result.old_image_file_name;

if (
  oldImageFileName &&
  oldImageFileName !== safeImageFileName
) {
  const { error: oldImageDeleteError } =
    await supabaseAdmin.storage
      .from("images")
      .remove([oldImageFileName]);

  if (oldImageDeleteError) {
    console.error(
      "Old replacement image deletion warning:",
      oldImageDeleteError
    );
  }
}

return res.status(200).json({
  success: true,
  submissionId:
    result.submission_id,
  slotCode:
    result.slot_code,
  slotStatus:
    result.slot_status,
});
  } catch (error) {
    console.error(
      "REPLACE APP SUBMISSION ERROR:",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "The memory could not be replaced",
    });
  }
}
