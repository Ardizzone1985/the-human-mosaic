import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

function createAdminToken() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("Missing ADMIN_SESSION_SECRET");
  }

  const issuedAt = Date.now().toString();

  const signature = crypto
    .createHmac("sha256", secret)
    .update(issuedAt)
    .digest("hex");

  return `${issuedAt}.${signature}`;
}

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
    
    // Retired Manual Entry endpoints: return 410 without any database access.
    const disabledManualActions = new Set([
      "manual-gallery-v2-check",
      "manual-gallery-v2-ready",
      "manual-gallery-v2-slots",
      "manual-gallery-v2-prepare",
      "manual-gallery-v2-validate",
      "manual-gallery-v2-upload-url",
      "manual-gallery-v2-verify-image",
    ]);

    if (disabledManualActions.has(req.query?.action)) {
      return res.status(410).json({
        success: false,
        error: "Manual Entry has been permanently discontinued",
      });
    }

    // ---------------------------------------------------------
    // STEP 8.37E — Gallery activation, server-gated and result-verified.
    // OFF by default. Requires explicit server flag AND confirmation.
    // ---------------------------------------------------------
    if (req.method === "POST" && req.query?.action === "gallery-capacity-activate") {
      const token = getAdminTokenFromRequest(req);
      if (!verifyAdminToken(token)) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      // Reject cross-origin or origin-less browser requests for this write endpoint.
      // The admin UI calls this endpoint from the same HTTPS origin.
      const requestOrigin = req.headers.origin;
      const requestHost = req.headers.host;
      if (
        typeof requestOrigin !== "string" ||
        typeof requestHost !== "string" ||
        requestOrigin !== `https://${requestHost}`
      ) {
        return res.status(403).json({ success: false, error: "Invalid request origin" });
      }

      const { room, section, view, confirmation } = req.body || {};
      const sectionNumber = Number(section);
      const viewNumber = Number(view);
      const validSection =
        (typeof section === "number" && Number.isSafeInteger(section)) ||
        (typeof section === "string" && /^[1-9]\d*$/.test(section));
      const validView =
        (typeof view === "number" && Number.isSafeInteger(view)) ||
        (typeof view === "string" && /^[1-5]$/.test(view));

      if (
        typeof room !== "string" || !["Identity", "Love", "Creativity"].includes(room) ||
        !validSection || !Number.isSafeInteger(sectionNumber) ||
        sectionNumber < 1 || sectionNumber > 1667 ||
        !validView || !Number.isSafeInteger(viewNumber) ||
        viewNumber < 1 || viewNumber > (sectionNumber === 1667 ? 4 : 5)
      ) {
        return res.status(400).json({ success: false, error: "Invalid gallery activation parameters" });
      }

      // Do not enable this environment variable during STEP 8.37E.
      // Default behavior preserves the previously tested HTTP 423 handshake.
      if (process.env.GALLERY_VIEW_ACTIVATION_ENABLED !== "true") {
        return res.status(423).json({
          success: false,
          mode: "activation-disabled",
          room,
          sectionNumber,
          viewNumber,
          expectedSlots: 120,
          error: "Gallery activation is not enabled. No slots were created or modified."
        });
      }

      // A second, target-specific server gate is required for LIVE activation.
      // Neither variable should be configured during this protected test.
      const selectedTarget = `${room} S${sectionNumber} V${viewNumber}`;
      if (process.env.GALLERY_VIEW_ACTIVATION_TARGET !== selectedTarget) {
        return res.status(423).json({
          success: false,
          mode: "activation-disabled",
          room,
          sectionNumber,
          viewNumber,
          error: "Gallery activation target is not enabled. No slots were created or modified."
        });
      }

      // This must be supplied in the request body, not just confirmed in the UI.
      const expectedConfirmation = `${room} S${sectionNumber} V${viewNumber}`;
      if (confirmation !== expectedConfirmation) {
        return res.status(400).json({
          success: false,
          error: "Exact server-side activation confirmation is required"
        });
      }

      // Gallery Capacity supports all valid Rooms, Sections and Views.
      // LIVE writes still require BOTH server environment gates above,
      // the exact target-specific confirmation and the atomic SQL RPC.

      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.rpc("admin_activate_gallery_view", {
        p_room: room,
        p_section_number: sectionNumber,
        p_view_number: viewNumber
      });
      if (error) {
        console.error("Gallery activation RPC failed:", error);
        return res.status(409).json({
          success: false,
          error: "Gallery activation failed; check server logs before retrying"
        });
      }

      // Validate every documented RPC result field before reporting success.
      // An unexpected result requires a read-only database inspection before retry.
      const result = data;
      const verifiedResult =
        result !== null &&
        typeof result === "object" &&
        !Array.isArray(result) &&
        result.success === true &&
        result.room === room &&
        result.sectionNumber === sectionNumber &&
        result.viewNumber === viewNumber &&
        result.insertedSlots === 120 &&
        result.frontWall === 40 &&
        result.leftWall === 40 &&
        result.rightWall === 40;

      if (!verifiedResult) {
        console.error("Unexpected gallery activation RPC result:", result);
        return res.status(409).json({
          success: false,
          mode: "activation-result-unverified",
          room,
          sectionNumber,
          viewNumber,
          error: "RPC result could not be verified. Inspect slot counts before any retry."
        });
      }

      return res.status(200).json({
        success: true,
        mode: "activation-result",
        room,
        sectionNumber,
        viewNumber,
        result
      });
    }

    // ---------------------------------------------------------
    // GET ?action=gallery-capacity&room=Identity&section=1&view=1
    // Gallery v2 capacity inspection. Admin-only, read-only.
    // ---------------------------------------------------------
    if (req.method === "GET" && req.query?.action === "gallery-capacity") {
      const token = getAdminTokenFromRequest(req);
      if (!verifyAdminToken(token)) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { room, section, view } = req.query || {};
      const validRooms = ["Identity", "Love", "Creativity"];
      const sectionNumber = Number(section);
      const viewNumber = Number(view);

      if (
        typeof room !== "string" || !validRooms.includes(room) ||
        typeof section !== "string" || !/^[1-9]\d*$/.test(section) ||
        !Number.isSafeInteger(sectionNumber) || sectionNumber > 1667 ||
        typeof view !== "string" || !/^[1-5]$/.test(view) ||
        !Number.isSafeInteger(viewNumber)
      ) {
        return res.status(400).json({ success: false, error: "Invalid gallery capacity parameters" });
      }

      const supabase = getSupabaseAdmin();
      const prefix = `${room}-S${sectionNumber}-V${viewNumber}-`;
      const { data, error } = await supabase
        .from("slots")
        .select("slot_code, wall, status, payment_confirmed, section_number, view_number")
        .eq("room", room)
        .like("slot_code", `${prefix}%`)
        .limit(500);

      if (error) {
        console.error("Gallery capacity read error:", error);
        return res.status(500).json({ success: false, error: "Failed to load gallery capacity" });
      }

      const slots = (data || []).filter((slot) =>
        slot.slot_code.startsWith(prefix) &&
        slot.section_number === sectionNumber &&
        slot.view_number === viewNumber
      );
      const walls = ["Front Wall", "Left Wall", "Right Wall"].map((wall) => {
        const items = slots.filter((slot) => slot.wall === wall);
        return {
          wall,
          total: items.length,
          available: items.filter((slot) => slot.status === "available" && slot.payment_confirmed !== true).length,
          reserved: items.filter((slot) => slot.status === "reserved").length,
          submitted: items.filter((slot) => slot.status === "submitted").length,
          paid: items.filter((slot) => slot.payment_confirmed === true).length,
        };
      });

      return res.status(200).json({
        success: true,
        mode: "read-only",
        room,
        sectionNumber,
        viewNumber,
        total: slots.length,
        expected: 120,
        walls,
        warning: (data || []).length === 500 ? "Result limit reached; counts may be incomplete" : null,
      });
    }

    // ---------------------------------------------------------
    // GET ?action=gallery-capacity-preview&room=Identity&section=1&view=2
    // Admin-only preview. Reads slots; never writes to the database.
    // ---------------------------------------------------------
    if (req.method === "GET" && req.query?.action === "gallery-capacity-preview") {
      const token = getAdminTokenFromRequest(req);
      if (!verifyAdminToken(token)) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { room, section, view } = req.query || {};
      const sectionNumber = Number(section);
      const viewNumber = Number(view);
      if (
        typeof room !== "string" || !["Identity", "Love", "Creativity"].includes(room) ||
        typeof section !== "string" || !/^[1-9]\d*$/.test(section) ||
        !Number.isSafeInteger(sectionNumber) || sectionNumber > 1667 ||
        typeof view !== "string" || !/^[1-5]$/.test(view) ||
        !Number.isSafeInteger(viewNumber)
      ) {
        return res.status(400).json({ success: false, error: "Invalid gallery capacity parameters" });
      }

      const supabase = getSupabaseAdmin();
      const prefix = `${room}-S${sectionNumber}-V${viewNumber}-`;
      const [positionResult, codeResult] = await Promise.all([
        supabase.from("slots")
          .select("slot_code, wall, row_number, col_number")
          .eq("room", room)
          .eq("section_number", sectionNumber)
          .eq("view_number", viewNumber)
          .limit(1000),
        supabase.from("slots")
          .select("slot_code")
          .like("slot_code", `${prefix}%`)
          .limit(1000),
      ]);

      if (positionResult.error || codeResult.error) {
        console.error("Gallery capacity preview read error:", positionResult.error || codeResult.error);
        return res.status(500).json({ success: false, error: "Failed to load gallery preview" });
      }
      // Fail closed if a result might be truncated.
      if ((positionResult.data || []).length >= 1000 || (codeResult.data || []).length >= 1000) {
        return res.status(409).json({ success: false, error: "Preview data limit reached; cannot safely assess conflicts" });
      }

      const occupiedPositions = new Set((positionResult.data || []).map(
        (s) => `${s.wall}|${s.row_number}|${s.col_number}`
      ));
      const occupiedCodes = new Set((codeResult.data || []).map((s) => s.slot_code));
      const wallDefinitions = [
        { wall: "Front Wall", code: "F" },
        { wall: "Left Wall", code: "L" },
        { wall: "Right Wall", code: "R" },
      ];
      const walls = wallDefinitions.map(({ wall, code }) => {
        let coordinateConflicts = 0;
        let slotCodeConflicts = 0;
        const examples = [];
        for (let row = 1; row <= 4; row++) {
          for (let col = 1; col <= 10; col++) {
            const slotCode = `${prefix}${code}-R${row}-C${col}`;
            const coordinateConflict = occupiedPositions.has(`${wall}|${row}|${col}`);
            const slotCodeConflict = occupiedCodes.has(slotCode);
            if (coordinateConflict) coordinateConflicts++;
            if (slotCodeConflict) slotCodeConflicts++;
            if ((coordinateConflict || slotCodeConflict) && examples.length < 5) {
              examples.push({ slotCode, coordinateConflict, slotCodeConflict });
            }
          }
        }
        return {
          wall,
          proposedSlots: 40,
          coordinateConflicts,
          slotCodeConflicts,
          exampleFirstCode: `${prefix}${code}-R1-C1`,
          exampleLastCode: `${prefix}${code}-R4-C10`,
          conflictExamples: examples,
        };
      });
      const coordinateConflicts = walls.reduce((sum, w) => sum + w.coordinateConflicts, 0);
      const slotCodeConflicts = walls.reduce((sum, w) => sum + w.slotCodeConflicts, 0);
      return res.status(200).json({
        success: true,
        mode: "read-only-preview",
        room,
        sectionNumber,
        viewNumber,
        proposedSlots: 120,
        coordinateConflicts,
        slotCodeConflicts,
        readyForActivation: coordinateConflicts === 0 && slotCodeConflicts === 0,
        walls,
        message: "Preview only: no slots created or modified",
      });
    }

    // ---------------------------------------------------------
    // GET ?action=impact-donations
    // Load Humanity Impact donations for the authenticated admin.
    // ---------------------------------------------------------
    if (
      req.method === "GET" &&
      req.query?.action === "impact-donations"
    ) {
      const token = getAdminTokenFromRequest(req);

      if (!verifyAdminToken(token)) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase
        .from("impact_donations")
        .select(
          "id, title, organization_name, cause, description, amount, currency, donation_date, is_published, created_at, updated_at"
        )
        .order("donation_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "Admin impact donations query error:",
          error
        );

        return res.status(500).json({
          error: "Failed to load impact donations",
        });
      }

      return res.status(200).json({
        success: true,
        donations: data || [],
      });
    }

    // ---------------------------------------------------------
    // POST ?action=create-impact-donation
    // Create a Humanity Impact donation as authenticated admin.
    // ---------------------------------------------------------
    if (
      req.method === "POST" &&
      req.query?.action === "create-impact-donation"
    ) {
      const token = getAdminTokenFromRequest(req);

      if (!verifyAdminToken(token)) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const {
        title,
        organizationName,
        cause,
        description,
        amount,
        currency,
        donationDate,
        isPublished,
      } = req.body || {};

      const cleanTitle =
        typeof title === "string" ? title.trim() : "";

      const cleanOrganizationName =
        typeof organizationName === "string"
          ? organizationName.trim()
          : "";

      const cleanCause =
        typeof cause === "string" && cause.trim()
          ? cause.trim()
          : null;

      const cleanDescription =
        typeof description === "string" && description.trim()
          ? description.trim()
          : null;

      const numericAmount = Number(amount);

      const cleanCurrency =
        typeof currency === "string"
          ? currency.trim().toUpperCase()
          : "";

      const cleanDonationDate =
        typeof donationDate === "string"
          ? donationDate.trim()
          : "";

      if (!cleanTitle) {
        return res.status(400).json({
          error: "Title is required",
        });
      }

      if (!cleanOrganizationName) {
        return res.status(400).json({
          error: "Organization name is required",
        });
      }

      if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        return res.status(400).json({
          error: "Amount must be greater than zero",
        });
      }

      if (!/^[A-Z]{3}$/.test(cleanCurrency)) {
        return res.status(400).json({
          error: "Currency must be a valid 3-letter code",
        });
      }

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(cleanDonationDate)
      ) {
        return res.status(400).json({
          error: "Donation date must use YYYY-MM-DD format",
        });
      }

      const parsedDate = new Date(
        `${cleanDonationDate}T00:00:00Z`
      );

      if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !==
          cleanDonationDate
      ) {
        return res.status(400).json({
          error: "Invalid donation date",
        });
      }

      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase
        .from("impact_donations")
        .insert({
          title: cleanTitle,
          organization_name: cleanOrganizationName,
          cause: cleanCause,
          description: cleanDescription,
          amount: numericAmount,
          currency: cleanCurrency,
          donation_date: cleanDonationDate,
          is_published: isPublished === true,
        })
        .select(
          "id, title, organization_name, cause, description, amount, currency, donation_date, is_published, created_at, updated_at"
        )
        .single();

      if (error) {
        console.error(
          "Admin impact donation create error:",
          error
        );

        return res.status(500).json({
          error: "Failed to create impact donation",
        });
      }

      return res.status(201).json({
        success: true,
        donation: data,
      });
    }

        // ---------------------------------------------------------
    // POST ?action=update-impact-donation
    // Update a Humanity Impact donation as authenticated admin.
    // ---------------------------------------------------------
    if (
      req.method === "POST" &&
      req.query?.action === "update-impact-donation"
    ) {
      const token = getAdminTokenFromRequest(req);

      if (!verifyAdminToken(token)) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const {
        id,
        title,
        organizationName,
        cause,
        description,
        amount,
        currency,
        donationDate,
        isPublished,
      } = req.body || {};

      const cleanId =
        typeof id === "string" ? id.trim() : "";

      const cleanTitle =
        typeof title === "string" ? title.trim() : "";

      const cleanOrganizationName =
        typeof organizationName === "string"
          ? organizationName.trim()
          : "";

      const cleanCause =
        typeof cause === "string" && cause.trim()
          ? cause.trim()
          : null;

      const cleanDescription =
        typeof description === "string" && description.trim()
          ? description.trim()
          : null;

      const numericAmount = Number(amount);

      const cleanCurrency =
        typeof currency === "string"
          ? currency.trim().toUpperCase()
          : "";

      const cleanDonationDate =
        typeof donationDate === "string"
          ? donationDate.trim()
          : "";

      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          cleanId
        )
      ) {
        return res.status(400).json({
          error: "Invalid donation ID",
        });
      }

      if (!cleanTitle) {
        return res.status(400).json({
          error: "Title is required",
        });
      }

      if (!cleanOrganizationName) {
        return res.status(400).json({
          error: "Organization name is required",
        });
      }

      if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        return res.status(400).json({
          error: "Amount must be greater than zero",
        });
      }

      if (!/^[A-Z]{3}$/.test(cleanCurrency)) {
        return res.status(400).json({
          error: "Currency must be a valid 3-letter code",
        });
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDonationDate)) {
        return res.status(400).json({
          error: "Donation date must use YYYY-MM-DD format",
        });
      }

      const parsedDate = new Date(
        `${cleanDonationDate}T00:00:00Z`
      );

      if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !==
          cleanDonationDate
      ) {
        return res.status(400).json({
          error: "Invalid donation date",
        });
      }

      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase
        .from("impact_donations")
        .update({
          title: cleanTitle,
          organization_name: cleanOrganizationName,
          cause: cleanCause,
          description: cleanDescription,
          amount: numericAmount,
          currency: cleanCurrency,
          donation_date: cleanDonationDate,
          is_published: isPublished === true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", cleanId)
        .select(
          "id, title, organization_name, cause, description, amount, currency, donation_date, is_published, created_at, updated_at"
        )
        .maybeSingle();

      if (error) {
        console.error(
          "Admin impact donation update error:",
          error
        );

        return res.status(500).json({
          error: "Failed to update impact donation",
        });
      }

      if (!data) {
        return res.status(404).json({
          error: "Impact donation not found",
        });
      }

      return res.status(200).json({
        success: true,
        donation: data,
      });
    }

        // ---------------------------------------------------------
    // POST ?action=delete-impact-donation
    // Delete a Humanity Impact donation as authenticated admin.
    // ---------------------------------------------------------
    if (
      req.method === "POST" &&
      req.query?.action === "delete-impact-donation"
    ) {
      const token = getAdminTokenFromRequest(req);

      if (!verifyAdminToken(token)) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const { id } = req.body || {};

      const cleanId =
        typeof id === "string" ? id.trim() : "";

      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          cleanId
        )
      ) {
        return res.status(400).json({
          error: "Invalid donation ID",
        });
      }

      const supabase = getSupabaseAdmin();

      const { data, error } = await supabase
        .from("impact_donations")
        .delete()
        .eq("id", cleanId)
        .select("id, title")
        .maybeSingle();

      if (error) {
        console.error(
          "Admin impact donation delete error:",
          error
        );

        return res.status(500).json({
          error: "Failed to delete impact donation",
        });
      }

      if (!data) {
        return res.status(404).json({
          error: "Impact donation not found",
        });
      }

      return res.status(200).json({
        success: true,
        deletedDonation: data,
      });
    }

        // ---------------------------------------------------------
    // GET ?action=submissions
    // Secure Admin submissions read.
    // Read-only: no database modifications.
    // ---------------------------------------------------------
    
    // ---------------------------------------------------------
    // GET ?action=submissions
    // Secure Admin submissions read with filters.
    // Read-only: no database modifications.
    // ---------------------------------------------------------
    if (
      req.method === "GET" &&
      req.query?.action === "submissions"
    ) {
      const token = getAdminTokenFromRequest(req);

      if (!verifyAdminToken(token)) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      const status = req.query?.status || "pending";
      const room = req.query?.room || "ALL";

      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Invalid submission status",
        });
      }

      if (!["ALL", "Identity", "Love", "Creativity"].includes(room)) {
        return res.status(400).json({
          success: false,
          error: "Invalid room",
        });
      }

      const supabase = getSupabaseAdmin();

      let query = supabase
        .from("submissions")
        .select(
          "submission_id, full_name, room, slot_code, image_file_name, approval_status, created_at, note, moderation_status, moderation_reason, note_flagged, image_moderation_status, image_moderation_reason, image_flagged"
        )
        .eq("approval_status", status)
        .order("created_at", { ascending: false })
        .limit(1000);

      if (room !== "ALL") {
        query = query.eq("room", room);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Admin submissions query error:", error);

        return res.status(500).json({
          success: false,
          error: "Failed to load submissions",
        });
      }

      return res.status(200).json({
        success: true,
        mode: "read-only",
        status,
        room,
        total: data?.length || 0,
        submissions: data || [],
      });
    }

    // ---------------------------------------------------------
    // GET ?action=comments
    
    // ---------------------------------------------------------
    // GET ?action=comments
    // Load comments for the authenticated admin.
    // ---------------------------------------------------------
    
    // ---------------------------------------------------------
    // GET ?action=approval-inspect&submissionId=...
    // Secure read-only inspection of one submission and slot.
    // ---------------------------------------------------------
    if (
      req.method === "GET" &&
      req.query?.action === "approval-inspect"
    ) {
      const token = getAdminTokenFromRequest(req);

      if (!verifyAdminToken(token)) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      const submissionId = req.query?.submissionId;

      if (
        typeof submissionId !== "string" ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(submissionId)
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid submission ID",
        });
      }

      const supabase = getSupabaseAdmin();

      const { data: submission, error: submissionError } =
        await supabase
          .from("submissions")
          .select(
            "submission_id, slot_code, room, wall, section, spot, approval_status, section_number, view_number"
          )
          .eq("submission_id", submissionId)
          .maybeSingle();

      if (submissionError) {
        console.error("Approval inspection error:", submissionError);

        return res.status(500).json({
          success: false,
          error: "Failed to inspect submission",
        });
      }

      if (!submission) {
        return res.status(404).json({
          success: false,
          error: "Submission not found",
        });
      }

      if (!submission.slot_code) {
        return res.status(409).json({
          success: false,
          error: "Submission has no linked slot",
        });
      }

      const { data: slot, error: slotError } =
        await supabase
          .from("slots")
          .select(
            "slot_code, room, wall, section, row_number, col_number, status, submission_id, payment_confirmed, section_number, view_number"
          )
          .eq("slot_code", submission.slot_code)
          .maybeSingle();

      if (slotError) {
        console.error("Approval slot inspection error:", slotError);

        return res.status(500).json({
          success: false,
          error: "Failed to inspect slot",
        });
      }

      if (!slot) {
        return res.status(409).json({
          success: false,
          error: "Linked slot not found",
        });
      }

      const slotLinkedCorrectly =
        slot.submission_id === submission.submission_id;

      const positionMatches =
        slot.room === submission.room &&
        slot.wall === submission.wall &&
        slot.section === submission.section &&
        submission.spot ===
          `R${slot.row_number}-C${slot.col_number}`;

      const galleryV2Position =
        /^(F([1-9]|10)|L[1-6]|R[1-6])$/.test(
          slot.section || ""
        ) &&
        /^(F([1-9]|10)|L[1-6]|R[1-6])$/.test(
          submission.section || ""
        );

      return res.status(200).json({
        success: true,
        mode: "read-only",
        submission,
        slot,
        checks: {
          slotLinkedCorrectly,
          positionMatches,
          galleryV2Position,
          readyForApproval:
            submission.approval_status === "pending" &&
            slot.status === "submitted" &&
            slotLinkedCorrectly &&
            positionMatches,
        },
      });
    }

    // ---------------------------------------------------------
// POST ?action=approval-prepare
// Verify Admin session before future approval operations.
// No database changes and no emails.
// ---------------------------------------------------------
if (
  req.method === "POST" &&
  req.query?.action === "approval-prepare"
) {
  const token = getAdminTokenFromRequest(req);

  if (!verifyAdminToken(token)) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  
const { submissionId } = req.body || {};

if (
  typeof submissionId !== "string" ||
  !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(submissionId)
) {
  return res.status(400).json({
    success: false,
    error: "Invalid submission ID",
  });
}

const supabase = getSupabaseAdmin();

const { data: submission, error: submissionError } =
  await supabase
    .from("submissions")
    .select("submission_id, slot_code, room, wall, section, spot, approval_status")
    .eq("submission_id", submissionId)
    .maybeSingle();

if (submissionError) {
  console.error("Approval preparation submission error:", submissionError);
  return res.status(500).json({
    success: false,
    error: "Failed to inspect submission",
  });
}

if (!submission) {
  return res.status(404).json({
    success: false,
    error: "Submission not found",
  });
}

if (!submission.slot_code) {
  return res.status(409).json({
    success: false,
    error: "Submission has no linked slot",
  });
}

const { data: slot, error: slotError } =
  await supabase
    .from("slots")
    .select("slot_code, room, wall, section, row_number, col_number, status, submission_id, payment_confirmed, section_number, view_number")
    .eq("slot_code", submission.slot_code)
    .maybeSingle();

if (slotError) {
  console.error("Approval preparation slot error:", slotError);
  return res.status(500).json({
    success: false,
    error: "Failed to inspect slot",
  });
}

if (!slot) {
  return res.status(409).json({
    success: false,
    error: "Linked slot not found",
  });
}

const checks = {
  pending: submission.approval_status === "pending",
  slotSubmitted: slot.status === "submitted",
  slotLinkedCorrectly:
    slot.submission_id === submission.submission_id,
  roomMatches: slot.room === submission.room,
  wallMatches: slot.wall === submission.wall,
  sectionMatches: slot.section === submission.section,
  paymentFlagConfirmed: slot.payment_confirmed === true,
};

const readyForFurtherReview =
  checks.pending &&
  checks.slotSubmitted &&
  checks.slotLinkedCorrectly &&
  checks.roomMatches &&
  checks.wallMatches &&
  checks.sectionMatches;

return res.status(200).json({
  success: true,
  mode: "read-only",
  submissionId: submission.submission_id,
  slotCode: slot.slot_code,
  checks,
  readyForFurtherReview,
  message: "Submission inspected; approval not executed",
});

}
    
    // ---------------------------------------------------------
    // GET ?action=approval-check
    // Secure read-only approval test.
    // ---------------------------------------------------------
    if (
      req.method === "GET" &&
      req.query?.action === "approval-check"
    ) {
      const token = getAdminTokenFromRequest(req);

      if (!verifyAdminToken(token)) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      return res.status(200).json({
        success: true,
        mode: "read-only",
        message: "Secure approval endpoint ready",
      });
    }

    if (req.method === "GET") {
      if (req.query?.action !== "comments") {
        return res.status(400).json({
          error: "Invalid action",
        });
      }

      const token = getAdminTokenFromRequest(req);

      if (!verifyAdminToken(token)) {
        return res.status(401).json({
          error: "Unauthorized",
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
    }
    
    // ---------------------------------------------------------
    // GET ?action=approval-check
    // STEP 7.75 — Read-only approval verification.
    // No database updates and no emails.
    // ---------------------------------------------------------
    if (
      req.method === "GET" &&
      req.query?.action === "approval-check"
    ) {
      const token = getAdminTokenFromRequest(req);

      if (!verifyAdminToken(token)) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
        });
      }

      return res.status(200).json({
        success: true,
        mode: "read-only",
        message: "Secure approval endpoint ready",
      });
    }

    // ---------------------------------------------------------
    // POST ?action=moderate-comment
    // Approve or reject a photo comment.
    // ---------------------------------------------------------
    if (
      req.method === "POST" &&
      req.query?.action === "moderate-comment"
    ) {
      const token = getAdminTokenFromRequest(req);

      if (!verifyAdminToken(token)) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      const { commentId, decision } = req.body || {};

      if (!commentId) {
        return res.status(400).json({
          error: "Missing commentId",
        });
      }

      if (decision !== "approve" && decision !== "reject") {
        return res.status(400).json({
          error: "Invalid decision",
        });
      }

      const supabase = getSupabaseAdmin();

      const updateData =
        decision === "approve"
          ? {
              approval_status: "approved",
              approved_at: new Date().toISOString(),
            }
          : {
              approval_status: "rejected",
              approved_at: null,
            };

      const { data, error } = await supabase
        .from("photo_comments")
        .update(updateData)
        .eq("id", commentId)
        .select(
          "id, submission_id, comment, approval_status, moderation_flagged, approved_at"
        )
        .maybeSingle();

      if (error) {
        console.error("Admin comment moderation error:", error);

        return res.status(500).json({
          error: "Failed to moderate comment",
        });
      }

      if (!data) {
        return res.status(404).json({
          error: "Comment not found",
        });
      }

      return res.status(200).json({
        success: true,
        comment: data,
      });
    }

    // ---------------------------------------------------------
    // POST
    // Existing admin login.
    // ---------------------------------------------------------
    if (req.method === "POST") {
      const { password } = req.body || {};

      if (!password) {
        return res.status(400).json({
          error: "Missing password",
        });
      }

      if (
        !process.env.ADMIN_PANEL_PASSWORD ||
        password !== process.env.ADMIN_PANEL_PASSWORD
      ) {
        return res.status(401).json({
          error: "Invalid password",
        });
      }

      const token = createAdminToken();

      res.setHeader(
        "Set-Cookie",
        [
          `thm_admin_session=${token}`,
          "Path=/",
          "HttpOnly",
          "Secure",
          "SameSite=Strict",
          "Max-Age=28800",
        ].join("; ")
      );

      return res.status(200).json({
        success: true,
      });
    }

    return res.status(405).json({
      error: "Method not allowed",
    });
  } catch (error) {
    console.error("Admin API error:", error);

    return res.status(500).json({
      error: "Server error",
    });
  }
}
