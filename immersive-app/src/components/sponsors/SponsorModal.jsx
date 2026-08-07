export default function SponsorModal({
  sponsor,
  onClose,
}) {
  if (!sponsor) {
    return null;
  }

  const {
    company,
    logo_url: logoUrl,
    campaign_image_url: campaignImageUrl,
    website,
    description,
    room,
  } = sponsor;

  function handleVisitWebsite() {
    if (!website) {
      return;
    }

    window.open(
      website,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <button
          type="button"
          style={closeButton}
          onClick={onClose}
          aria-label="Close sponsor"
        >
          ×
        </button>

        <div style={eyebrow}>
          THE HUMAN MOSAIC
        </div>

        <div style={partnerLabel}>
          MUSEUM PARTNER
        </div>

        {logoUrl && (
          <img
            src={logoUrl}
            alt={`${company || "Partner"} logo`}
            style={logo}
          />
        )}

        {campaignImageUrl && (
          <div style={campaignWrap}>
            <img
              src={campaignImageUrl}
              alt={`${company || "Partner"} campaign`}
              style={campaignImage}
            />
          </div>
        )}

        <h2 style={title}>
          {company || "Museum Partner"}
        </h2>

        {description && (
          <p style={descriptionStyle}>
            {description}
          </p>
        )}

        {room && (
          <div style={roomBox}>
            <span style={roomLabel}>
              PRESENT IN
            </span>

            <strong style={roomValue}>
              {formatRoom(room)}
            </strong>
          </div>
        )}

        <div style={actions}>
          <button
            type="button"
            style={secondaryButton}
            onClick={onClose}
          >
            RETURN TO MUSEUM
          </button>

          {website && (
            <button
              type="button"
              style={primaryButton}
              onClick={handleVisitWebsite}
            >
              VISIT OFFICIAL WEBSITE
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatRoom(room) {
  if (!room) {
    return "";
  }

  if (room === "lobby") {
    return "Museum Lobby";
  }

  return `${String(room)
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ")} Room`;
}

const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 5000000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  boxSizing: "border-box",
  overflowY: "auto",
  background: "rgba(5, 3, 2, 0.84)",
  backdropFilter: "blur(12px)",
};

const modal = {
  position: "relative",
  width: "min(100%, 760px)",
  maxHeight: "calc(100vh - 40px)",
  overflowY: "auto",
  padding: "46px 34px 34px",
  boxSizing: "border-box",
  borderRadius: "28px",
  border:
    "1px solid rgba(215, 181, 109, 0.42)",
  background:
    "linear-gradient(160deg, #fffaf1, #f3eadc)",
  boxShadow:
    "0 30px 90px rgba(0, 0, 0, 0.48)",
  color: "#2b1b0e",
};

const closeButton = {
  position: "absolute",
  top: "16px",
  right: "16px",
  width: "40px",
  height: "40px",
  borderRadius: "999px",
  border:
    "1px solid rgba(100, 70, 35, 0.25)",
  background: "transparent",
  color: "#2b1b0e",
  fontSize: "27px",
  lineHeight: 1,
  cursor: "pointer",
};

const eyebrow = {
  marginBottom: "8px",
  color: "#a67c31",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.22em",
  textAlign: "center",
};

const partnerLabel = {
  marginBottom: "24px",
  color: "#79634a",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.16em",
  textAlign: "center",
};

const logo = {
  display: "block",
  width: "min(220px, 60%)",
  maxHeight: "110px",
  margin: "0 auto 24px",
  objectFit: "contain",
};

const campaignWrap = {
  overflow: "hidden",
  marginBottom: "28px",
  borderRadius: "20px",
  border:
    "1px solid rgba(120, 86, 48, 0.16)",
  background: "#ffffff",
};

const campaignImage = {
  display: "block",
  width: "100%",
  maxHeight: "360px",
  objectFit: "contain",
  background: "#ffffff",
};

const title = {
  margin: "0 0 16px",
  color: "#291b0f",
  fontFamily:
    "Georgia, 'Times New Roman', serif",
  fontSize: "clamp(32px, 5vw, 46px)",
  lineHeight: 1.08,
  fontWeight: 500,
  textAlign: "center",
};

const descriptionStyle = {
  maxWidth: "620px",
  margin: "0 auto",
  color: "#675744",
  fontSize: "15px",
  lineHeight: 1.75,
  textAlign: "center",
  whiteSpace: "pre-wrap",
};

const roomBox = {
  margin: "28px auto 0",
  padding: "16px 18px",
  maxWidth: "420px",
  borderRadius: "16px",
  border:
    "1px solid rgba(166, 124, 49, 0.26)",
  background:
    "rgba(215, 181, 109, 0.10)",
  textAlign: "center",
};

const roomLabel = {
  display: "block",
  marginBottom: "6px",
  color: "#9a7028",
  fontSize: "10px",
  fontWeight: 900,
  letterSpacing: "0.16em",
};

const roomValue = {
  color: "#2b1b0e",
  fontSize: "16px",
};

const actions = {
  marginTop: "30px",
  display: "flex",
  justifyContent: "center",
  gap: "12px",
  flexWrap: "wrap",
};

const secondaryButton = {
  minHeight: "50px",
  padding: "13px 22px",
  borderRadius: "999px",
  border:
    "1px solid rgba(83, 56, 29, 0.32)",
  background: "transparent",
  color: "#4a321d",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.08em",
  cursor: "pointer",
};

const primaryButton = {
  ...secondaryButton,
  border: "none",
  background: "#2b1b0e",
  color: "#f2dfbd",
};
