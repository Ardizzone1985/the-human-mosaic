import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCurrency(priceCents, currency = "EUR") {
  const amount = Number(priceCents);

  if (!Number.isFinite(amount)) {
    return "To be confirmed";
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency || "EUR",
  }).format(amount / 100);
}

function formatRoom(value) {
  if (!value) {
    return "—";
  }

  return String(value)
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function emailShell(content) {
  return `
    <div style="
      margin:0;
      padding:24px;
      background:#f5f1e8;
      font-family:Arial,Helvetica,sans-serif;
      line-height:1.65;
      color:#211a13;
    ">
      <div style="
        max-width:680px;
        margin:0 auto;
        overflow:hidden;
        border:1px solid #e2d6c0;
        border-radius:22px;
        background:#fffdf8;
        box-shadow:0 14px 40px rgba(45,32,18,0.08);
      ">
        <div style="
          padding:32px;
          border-bottom:1px solid #eadfce;
          background:linear-gradient(135deg,#fffaf0,#f3e8d1);
        ">
          <p style="
            margin:0 0 10px;
            color:#a67c31;
            font-size:12px;
            font-weight:800;
            letter-spacing:0.16em;
          ">
            THE HUMAN MOSAIC
          </p>

          <p style="
            margin:0;
            color:#665b4f;
            font-size:13px;
            letter-spacing:0.1em;
          ">
            ONE HUMANITY. MILLIONS OF FACES. ONE MOSAIC.
          </p>
        </div>

        <div style="padding:34px;">
          ${content}

          <div style="
            margin-top:32px;
            padding-top:22px;
            border-top:1px solid #ebe4d9;
          ">
            <p style="margin:0 0 8px;color:#665f56;">
              For questions or assistance:
            </p>

            <a
              href="mailto:info@thehumanmosaic.art"
              style="
                color:#211a13;
                font-weight:800;
                text-decoration:none;
              "
            >
              info@thehumanmosaic.art
            </a>

            <p style="margin:24px 0 0;font-weight:800;">
              Warm regards,<br />
              The Human Mosaic Team
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function sendSponsorApprovedEmail({
  email,
  contactName,
  company,
  planName,
  preferredRoom,
  approvedPlacement,
  requestedDays,
  quotedPriceCents,
  currency,
  paymentUrl,
}) {
  if (!email || email === "—") {
    throw new Error(
      "Cannot send sponsor approval email: invalid email"
    );
  }

  const safeContactName =
    escapeHtml(contactName || "Partner");

  const safeCompany =
    escapeHtml(company || "Your organization");

  const safePlanName =
    escapeHtml(planName || "Partnership plan");

  const safeRoom =
    escapeHtml(formatRoom(preferredRoom));

  const safePlacement =
    escapeHtml(approvedPlacement || "To be confirmed");

  const safeDuration =
    escapeHtml(requestedDays || "—");

  const safePrice =
    escapeHtml(
      formatCurrency(
        quotedPriceCents,
        currency || "EUR"
      )
    );

  const safePaymentUrl =
    paymentUrl &&
    /^https:\/\/.+/i.test(paymentUrl)
      ? escapeHtml(paymentUrl)
      : "";

  const paymentSection = safePaymentUrl
    ? `
      <div style="
        margin:28px 0;
        padding:22px;
        border:1px solid #ddc797;
        border-radius:16px;
        background:#faf3e3;
        text-align:center;
      ">
        <p style="margin:0 0 16px;font-weight:800;">
          Complete your partnership
        </p>

        <p style="margin:0 0 12px;color:#62594e;">
  Use the secure payment link below to confirm
  the approved placement.
</p>

<p style="
  margin:0 0 20px;
  color:#8a5d13;
  font-weight:700;
  line-height:1.6;
">
  Your approved placement is reserved for 48 hours.
  If payment is not completed within this period,
  the placement will automatically become available again.
</p>

        <a
          href="${safePaymentUrl}"
          style="
            display:inline-block;
            padding:15px 24px;
            border-radius:12px;
            background:#24180e;
            color:#ffffff;
            font-weight:800;
            letter-spacing:0.05em;
            text-decoration:none;
          "
        >
          COMPLETE PARTNERSHIP PAYMENT
        </a>
      </div>
    `
    : `
      <div style="
        margin:28px 0;
        padding:20px;
        border:1px solid #ddc797;
        border-radius:16px;
        background:#faf3e3;
      ">
        <p style="margin:0;font-weight:800;">
          Payment instructions will follow shortly.
        </p>

        <p style="margin:8px 0 0;color:#62594e;">
          Our team is preparing the secure payment step
          required to confirm your partnership.
        </p>
      </div>
    `;

  const html = emailShell(`
    <div style="
      display:inline-block;
      margin-bottom:18px;
      padding:8px 12px;
      border-radius:999px;
      background:#ead6a2;
      color:#6d4d10;
      font-size:12px;
      font-weight:800;
      letter-spacing:0.09em;
    ">
      OFFICIAL PARTNERSHIP APPROVED
    </div>

    <h1 style="
      margin:0 0 18px;
      font-family:Georgia,'Times New Roman',serif;
      font-size:36px;
      line-height:1.15;
      color:#24180e;
    ">
      Welcome to The Human Mosaic
    </h1>

    <p>Dear ${safeContactName},</p>

    <p>
      We are pleased to inform you that the partnership
      application submitted by
      <strong>${safeCompany}</strong> has been approved.
    </p>

    <p style="color:#62594e;">
      Thank you for choosing to support our mission to
      preserve human stories, connect cultures and build
      a permanent global artwork.
    </p>

    <div style="
      margin:26px 0;
      padding:22px;
      border:1px solid #e4d9c8;
      border-radius:16px;
      background:#fffaf1;
    ">
      <h2 style="
        margin:0 0 16px;
        font-size:18px;
        color:#a67c31;
      ">
        Partnership Details
      </h2>

      <p style="margin:7px 0;">
        <strong>Organization:</strong> ${safeCompany}
      </p>

      <p style="margin:7px 0;">
        <strong>Partnership:</strong> ${safePlanName}
      </p>

      <p style="margin:7px 0;">
        <strong>Room:</strong> ${safeRoom}
      </p>

      <p style="margin:7px 0;">
        <strong>Placement:</strong> ${safePlacement}
      </p>

      <p style="margin:7px 0;">
        <strong>Duration:</strong> ${safeDuration} days
      </p>

      <p style="margin:7px 0;">
        <strong>Partnership contribution:</strong>
        ${safePrice}
      </p>
    </div>

    ${paymentSection}

    <p>
      Once payment has been confirmed, our team will
      finalize the campaign and prepare the approved
      panel for publication inside the museum.
    </p>

    <p style="
      margin-top:24px;
      color:#a67c31;
      font-family:Georgia,'Times New Roman',serif;
      font-size:20px;
      font-style:italic;
    ">
      Together, we can inspire millions of people around
      the world.
    </p>
  `);

  const text = `
Partnership Application Approved

Dear ${contactName || "Partner"},

We are pleased to inform you that the partnership application submitted by ${company || "your organization"} has been approved.

Partnership Details
Organization: ${company || "—"}
Partnership: ${planName || "—"}
Room: ${formatRoom(preferredRoom)}
Placement: ${approvedPlacement || "To be confirmed"}
Duration: ${requestedDays || "—"} days
Partnership contribution: ${formatCurrency(
    quotedPriceCents,
    currency || "EUR"
  )}

${
  paymentUrl
    ? `Complete payment securely:
${paymentUrl}

Your approved placement is reserved for 48 hours.
If payment is not completed within this period, the placement will automatically become available again.`
    : "Payment instructions will follow shortly."
}

Once payment has been confirmed, our team will finalize the campaign and prepare the approved panel for publication inside the museum.

Together, we can inspire millions of people around the world.

Support: info@thehumanmosaic.art

Warm regards,
The Human Mosaic Team
  `.trim();

  const { data, error } = await resend.emails.send({
    from:
      "The Human Mosaic <info@mail.thehumanmosaic.art>",
    to: [email],
    subject:
      "Your Partnership Application Has Been Approved",
    html,
    text,
  });

  if (error) {
    throw new Error(
      error.message ||
        "Unable to send sponsor approval email"
    );
  }

  return data;
}

export async function sendSponsorRejectedEmail({
  email,
  contactName,
  company,
  rejectionReason,
}) {
  if (!email || email === "—") {
    throw new Error(
      "Cannot send sponsor rejection email: invalid email"
    );
  }

  if (!rejectionReason) {
    throw new Error(
      "Cannot send sponsor rejection email: missing reason"
    );
  }

  const safeContactName =
    escapeHtml(contactName || "Applicant");

  const safeCompany =
    escapeHtml(company || "Your organization");

  const safeReason =
    escapeHtml(rejectionReason);

  const html = emailShell(`
    <p style="
      margin:0 0 12px;
      color:#a67c31;
      font-size:12px;
      font-weight:800;
      letter-spacing:0.14em;
    ">
      PARTNERSHIP APPLICATION UPDATE
    </p>

    <h1 style="
      margin:0 0 18px;
      font-family:Georgia,'Times New Roman',serif;
      font-size:36px;
      line-height:1.15;
      color:#24180e;
    ">
      Thank You for Your Interest
    </h1>

    <p>Dear ${safeContactName},</p>

    <p>
      Thank you for submitting a partnership application
      on behalf of <strong>${safeCompany}</strong>.
    </p>

    <p>
      After careful review, we are unfortunately unable
      to approve the application at this time.
    </p>

    <div style="
      margin:26px 0;
      padding:20px;
      border-left:4px solid #b42318;
      border-radius:10px;
      background:#fff3f1;
    ">
      <p style="
        margin:0 0 8px;
        color:#8f1d16;
        font-weight:800;
      ">
        Reason for the decision
      </p>

      <p style="margin:0;color:#4d3834;">
        ${safeReason}
      </p>
    </div>

    <p>
      You are welcome to address the issue described
      above and submit a new application for consideration.
    </p>

    <p style="color:#62594e;">
      This decision does not prevent future collaboration.
      We appreciate your interest in supporting
      The Human Mosaic and hope to have another
      opportunity to work together.
    </p>
  `);

  const text = `
Partnership Application Update

Dear ${contactName || "Applicant"},

Thank you for submitting a partnership application on behalf of ${company || "your organization"}.

After careful review, we are unfortunately unable to approve the application at this time.

Reason for the decision:
${rejectionReason}

You are welcome to address the issue described above and submit a new application for consideration.

This decision does not prevent future collaboration. We appreciate your interest in supporting The Human Mosaic.

Support: info@thehumanmosaic.art

Warm regards,
The Human Mosaic Team
  `.trim();

  const { data, error } = await resend.emails.send({
    from:
      "The Human Mosaic <info@mail.thehumanmosaic.art>",
    to: [email],
    subject:
      "Partnership Application Update – The Human Mosaic",
    html,
    text,
  });

  if (error) {
    throw new Error(
      error.message ||
        "Unable to send sponsor rejection email"
    );
  }

  return data;
}
