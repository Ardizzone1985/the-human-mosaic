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

    return res.status(501).json({
      error:
        "Replacement database function not yet connected",
      submissionId: safeSubmissionId,
      imageFileName: safeImageFileName,
      imageUrl: safeImageUrl || null,
      note: safeNote,
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
