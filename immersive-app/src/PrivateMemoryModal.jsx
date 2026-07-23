export default function PrivateMemoryModal({
  memory,
  onClose,
  onReplaceImage,
}) {
  if (!memory) return null;

  const normalizedStatus = String(
  memory.approval_status ||
  memory.status ||
  memory.submission_status ||
  memory.review_status ||
  ""
).toLowerCase();

const submittedDate =
  memory.created_at
    ? new Date(memory.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Not available";

const submissionCode =
  memory.museum_id ||
  memory.museum_code ||
  `THM-${String(
    memory.id ||
    memory.submission_id ||
    0
  ).padStart(8, "0")}`;

  const isRejected = normalizedStatus === "rejected";
  const isPending =
    normalizedStatus === "pending" ||
    normalizedStatus === "submitted";

  const publicStorageBase =
    "https://cqpujmwfiqbwdsmuwkmb.supabase.co/storage/v1/object/public/images/";

  const imageUrl =
    memory.image_url ||
    memory.imageUrl ||
    (memory.image_file_name
      ? `${publicStorageBase}${memory.image_file_name}`
      : "");

  const statusLabel = isRejected
    ? "NEEDS AN UPDATE"
    : "WAITING FOR REVIEW";

  const statusMessage = isRejected
    ? "This memory was not approved in its current form. Your position remains connected to your submission, and you can replace the image without making another payment."
    : "Your memory has been received successfully and is currently waiting for human review.";

  return (
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="private-memory-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div style={panelStyle}>
        <button
          type="button"
          onClick={onClose}
          style={closeIconStyle}
          aria-label="Close memory details"
        >
          ×
        </button>

        <div style={eyebrowStyle}>
          THE HUMAN MOSAIC
        </div>

        <h2
          id="private-memory-title"
          style={titleStyle}
        >
          Your Memory
        </h2>

        {imageUrl && (
          <img
            src={imageUrl}
            alt="Submitted memory"
            style={imageStyle}
          />
        )}

        <div
          style={{
            ...statusBoxStyle,
            borderColor: isRejected
              ? "rgba(255, 130, 130, 0.55)"
              : "rgba(215, 181, 109, 0.55)",
          }}
        >
          <div
            style={{
              ...statusLabelStyle,
              color: isRejected
                ? "#ff9f9f"
                : "#f2c879",
            }}
          >
            {statusLabel}
          </div>

          <p style={statusMessageStyle}>
            {statusMessage}
          </p>
        </div>

        <div style={detailsStyle}>
          <DetailItem
  label="ROOM"
  value={memory.room}
/>

<DetailItem
  label="SUBMISSION"
  value={submissionCode}
/>

<DetailItem
  label="COUNTRY"
  value={memory.country}
/>

<DetailItem
  label="SUBMITTED"
  value={submittedDate}
/>
        </div>

        {(memory.note ||
          memory.notes ||
          memory.optional_note) && (
          <div style={noteBoxStyle}>
            <div style={detailLabelStyle}>
              MEMORY NOTE
            </div>

            <div style={noteTextStyle}>
              {memory.note ||
                memory.notes ||
                memory.optional_note}
            </div>
          </div>
        )}

        {isRejected && (
          <button
            type="button"
            onClick={() => onReplaceImage?.(memory)}
            style={replaceButtonStyle}
          >
            Replace Image
          </button>
        )}

        {isPending && (
          <div style={pendingNoticeStyle}>
            You will receive an email after the review has been completed.
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          style={secondaryButtonStyle}
        >
          Close
        </button>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div style={detailItemStyle}>
      <div style={detailLabelStyle}>
        {label}
      </div>

      <div style={detailValueStyle}>
        {value || "—"}
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 2500000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  boxSizing: "border-box",
  background: "rgba(0, 0, 0, 0.76)",
  backdropFilter: "blur(12px)",
};

const panelStyle = {
  position: "relative",
  width: "min(94vw, 520px)",
  maxHeight: "88vh",
  overflowY: "auto",
  padding: "28px 22px",
  boxSizing: "border-box",
  borderRadius: "26px",
  background:
    "linear-gradient(180deg, rgba(24, 14, 9, 0.98), rgba(10, 7, 5, 0.99))",
  border: "1px solid rgba(215, 181, 109, 0.5)",
  boxShadow: "0 35px 100px rgba(0, 0, 0, 0.8)",
  color: "#ffffff",
  fontFamily: "Arial, sans-serif",
};

const closeIconStyle = {
  position: "absolute",
  top: "14px",
  right: "16px",
  width: "38px",
  height: "38px",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "50%",
  background: "rgba(255,255,255,0.06)",
  color: "#ffffff",
  fontSize: "25px",
  lineHeight: 1,
  cursor: "pointer",
};

const eyebrowStyle = {
  color: "#d7b56d",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.2em",
  marginBottom: "9px",
};

const titleStyle = {
  margin: "0 44px 20px 0",
  fontSize: "30px",
  lineHeight: 1.15,
};

const imageStyle = {
  display: "block",
  width: "100%",
  maxHeight: "42vh",
  objectFit: "contain",
  marginBottom: "20px",
  borderRadius: "18px",
  background: "#000000",
  border: "1px solid rgba(215,181,109,0.28)",
};

const statusBoxStyle = {
  padding: "18px",
  marginBottom: "18px",
  border: "1px solid",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.045)",
};

const statusLabelStyle = {
  marginBottom: "8px",
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "0.14em",
};

const statusMessageStyle = {
  margin: 0,
  color: "#ded4c8",
  fontSize: "14px",
  lineHeight: 1.65,
};

const detailsStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(135px, 1fr))",
  gap: "10px",
};

const detailItemStyle = {
  padding: "13px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.09)",
};

const detailLabelStyle = {
  color: "#d7b56d",
  fontSize: "10px",
  fontWeight: 800,
  letterSpacing: "0.12em",
};

const detailValueStyle = {
  marginTop: "6px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 700,
  wordBreak: "break-word",
};

const noteBoxStyle = {
  marginTop: "14px",
  padding: "15px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.045)",
  border: "1px solid rgba(255,255,255,0.09)",
};

const noteTextStyle = {
  marginTop: "8px",
  color: "#ded4c8",
  fontSize: "14px",
  lineHeight: 1.6,
};

const replaceButtonStyle = {
  width: "100%",
  marginTop: "20px",
  padding: "15px",
  border: "none",
  borderRadius: "999px",
  background: "#d7b56d",
  color: "#111111",
  fontSize: "15px",
  fontWeight: 900,
  cursor: "pointer",
};

const pendingNoticeStyle = {
  marginTop: "18px",
  color: "#a99f93",
  fontSize: "13px",
  lineHeight: 1.55,
  textAlign: "center",
};

const secondaryButtonStyle = {
  width: "100%",
  marginTop: "12px",
  padding: "14px",
  border: "1px solid rgba(215,181,109,0.38)",
  borderRadius: "999px",
  background: "transparent",
  color: "#f2c879",
  fontSize: "14px",
  fontWeight: 800,
  cursor: "pointer",
};
