import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ALLOWED_ORIGIN =
  "https://the-human-mosaic-immersive-app.vercel.app";

const ALLOWED_ROOMS = [
  "Identity",
  "Love",
  "Creativity",
];

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
      slotCode,
      submissionId,
      fullName,
      email,
      country,
      note,
      imageFileName,
      imageUrl,
      room,
    } = req.body || {};

    const safeSlotCode = cleanText(
      slotCode,
      200
    );

    const safeSubmissionId = cleanText(
      submissionId,
      200
    );

    const safeFullName = cleanText(
      fullName,
      300
    );

    const safeEmail = cleanText(
      email || user.email,
      320
    ).toLowerCase();

    const safeCountry = cleanText(
      country,
      150
    );

    const safeNote = cleanText(
      note,
      500
    );

    const safeImageFileName = cleanText(
      imageFileName,
      500
    );

    const safeImageUrl = cleanText(
      imageUrl,
      1500
    );

    if (
      !safeSlotCode ||
      !safeSubmissionId ||
      !safeFullName ||
      !safeEmail ||
      !safeImageFileName
    ) {
      return res.status(400).json({
        error:
          "Missing required submission data",
      });
    }

    if (
      room &&
      !ALLOWED_ROOMS.includes(room)
    ) {
      return res.status(400).json({
        error: "Invalid Room",
      });
    }

    /*
     * Controlliamo che l'oggetto sia realmente
     * presente nel bucket prima di creare
     * la submission.
     */
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

const { data: storedFiles, error: storageError } =
  await supabaseAdmin.storage
    .from("images")
    .list(expectedFolder, {
      search: fileNameOnly,
      limit: 100,
    });

if (storageError) {
  console.error(
    "Storage object verification error:",
    storageError
  );

  return res.status(500).json({
    error:
      "The uploaded image could not be verified",
  });
}

const storageObject =
  Array.isArray(storedFiles)
    ? storedFiles.find(
        (file) => file.name === fileNameOnly
      )
    : null;

if (!storageObject) {
  return res.status(409).json({
    error:
      "The uploaded image was not found",
  });
}

    /*
     * Usiamo un client autenticato con il token
     * dell'utente affinché auth.uid() funzioni
     * correttamente dentro la funzione SQL.
     */
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
        "create_my_app_submission",
        {
          p_slot_code: safeSlotCode,
          p_submission_id:
            safeSubmissionId,
          p_full_name: safeFullName,
          p_email: safeEmail,
          p_country: safeCountry,
          p_note: safeNote,
          p_image_file_name:
            safeImageFileName,
          p_image_url:
            safeImageUrl || null,
        }
      );

    if (error) {
      console.error(
        "Create app submission RPC error:",
        error
      );

      const { error: cleanupError } =
  await supabaseAdmin.storage
    .from("images")
    .remove([safeImageFileName]);

if (cleanupError) {
  console.error(
    "Uploaded image rollback error:",
    cleanupError
  );
}

      const message =
        error.message ||
        "The memory could not be submitted";

      const conflict =
        message.includes(
          "already has a submission"
        ) ||
        message.includes(
          "does not belong"
        ) ||
        message.includes(
          "Payment has not been confirmed"
        ) ||
        message.includes(
          "not ready for submission"
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
        "The submission was created but no confirmation was returned"
      );
    }

    return res.status(200).json({
      success: true,
      submissionId:
        result.submission_id,
      slotCode: result.slot_code,
      slotStatus: result.slot_status,
    });
  } catch (error) {
    console.error(
      "CREATE APP SUBMISSION ERROR:",
      error
    );

    return res.status(500).json({
      error:
        error.message ||
        "The memory could not be submitted",
    });
  }
}
