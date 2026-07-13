export default function MuseumIdentity({
  open,
  user,
  profile,
  onClose,
  onUpload,
  onEditProfile,
  onChangePassword,
  onLogout,
}) {
  if (!open) return null;

  const nickname =
    profile?.nickname ||
    user?.user_metadata?.nickname ||
    profile?.first_name ||
    "Museum Member";

  const country =
    profile?.country ||
    user?.user_metadata?.country ||
    "Country unavailable";

  const email = user?.email || "Email unavailable";

  const memberSince = formatMemberSince(
    profile?.created_at || user?.created_at
  );

  return (
    <div
      style={overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="museum-identity-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div style={panel}>
        <button
          type="button"
          onClick={onClose}
          style={closeButton}
          aria-label="Close Museum Identity"
        >
          ×
        </button>

        <header style={header}>
          <div style={eyebrow}>THE HUMAN MOSAIC</div>

          <h1 id="museum-identity-title" style={title}>
            My Museum Identity
          </h1>

          <p style={subtitle}>
            Your personal place inside the permanent global artwork.
          </p>
        </header>

        <section style={identityCard}>
          <div style={avatar} aria-hidden="true">
            {getInitials(nickname)}
          </div>

          <div style={identityInformation}>
            <div style={nicknameStyle}>{nickname}</div>

            <div style={museumId}>
  {profile?.museum_id || "Museum ID unavailable"}
</div>

            <div style={identityDetails}>
              <span>🌍 {country}</span>
              <span>Member since {memberSince}</span>
            </div>

            <div style={emailStyle}>{email}</div>
          </div>
        </section>

        <section style={section}>
          <div style={sectionHeading}>
            <div>
              <div style={sectionEyebrow}>YOUR ACTIVITY</div>
              <h2 style={sectionTitle}>Museum Statistics</h2>
            </div>

            <div style={comingSoonBadge}>LIVE DATA NEXT</div>
          </div>

          <div style={statsGrid}>
            <StatCard icon="🖼" label="My Memories" value="—" />
            <StatCard icon="❤️" label="Likes Given" value="—" />
            <StatCard icon="💬" label="Comments" value="—" />
            <StatCard icon="👁" label="Views Received" value="—" />
            <StatCard
              icon="🏆"
              label="Community Favorites"
              value="—"
            />
          </div>
        </section>

        <section style={section}>
          <div style={sectionHeading}>
            <div>
              <div style={sectionEyebrow}>YOUR COLLECTION</div>
              <h2 style={sectionTitle}>My Memories</h2>
            </div>
          </div>

          <div style={emptyMemories}>
            <div style={emptyIcon}>🖼</div>

            <div style={emptyTitle}>
              Your memories will appear here
            </div>

            <div style={emptyText}>
              Approved, pending, and rejected submissions will be shown
              in this personal space.
            </div>
          </div>
        </section>

        <section style={actionsSection}>
          <button
            type="button"
            style={uploadButton}
            onClick={onUpload}
          >
            Upload a Memory
          </button>

          <div style={secondaryActions}>
            <button
              type="button"
              style={secondaryButton}
              onClick={onEditProfile}
            >
              Edit Profile
            </button>

            <button
              type="button"
              style={secondaryButton}
              onClick={onChangePassword}
            >
              Change Password
            </button>

            <button
              type="button"
              style={logoutButton}
              onClick={onLogout}
            >
              Log Out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div style={statCard}>
      <div style={statIcon}>{icon}</div>
      <div style={statValue}>{value}</div>
      <div style={statLabel}>{label}</div>
    </div>
  );
}

function getInitials(value) {
  const words = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "THM";

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

function formatMemberSince(value) {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(date);
}

const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 4500000,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  boxSizing: "border-box",
  background: "rgba(0,0,0,0.76)",
  backdropFilter: "blur(12px)",
  animation: "museumIdentityFade 220ms ease",
};

const panel = {
  position: "relative",
  width: "min(960px, 96vw)",
  maxHeight: "92vh",
  overflowY: "auto",
  padding: "38px",
  boxSizing: "border-box",
  borderRadius: "30px",
  border: "1px solid rgba(215,181,109,0.5)",
  background:
    "linear-gradient(160deg, rgba(25,18,10,0.99), rgba(8,8,8,0.99) 46%)",
  boxShadow: "0 40px 130px rgba(0,0,0,0.82)",
  color: "#fff",
  fontFamily: "Arial, sans-serif",
};

const closeButton = {
  position: "absolute",
  top: "18px",
  right: "20px",
  width: "42px",
  height: "42px",
  borderRadius: "999px",
  border: "1px solid rgba(215,181,109,0.4)",
  background: "rgba(255,255,255,0.06)",
  color: "#f2c879",
  cursor: "pointer",
  fontSize: "28px",
  lineHeight: 1,
};

const header = {
  padding: "8px 44px 28px",
  textAlign: "center",
};

const eyebrow = {
  color: "#d7b56d",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.24em",
};

const title = {
  margin: "12px 0 10px",
  fontSize: "clamp(32px, 6vw, 54px)",
  lineHeight: 1.05,
  letterSpacing: "0.04em",
};

const subtitle = {
  margin: 0,
  color: "#cfc5b5",
  fontSize: "15px",
  lineHeight: 1.6,
};

const identityCard = {
  display: "flex",
  alignItems: "center",
  gap: "24px",
  padding: "26px",
  borderRadius: "24px",
  border: "1px solid rgba(215,181,109,0.34)",
  background:
    "linear-gradient(135deg, rgba(215,181,109,0.13), rgba(255,255,255,0.035))",
};

const avatar = {
  width: "94px",
  height: "94px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  border: "2px solid rgba(215,181,109,0.72)",
  background: "#d7b56d",
  color: "#111",
  fontSize: "30px",
  fontWeight: 900,
  letterSpacing: "0.06em",
};

const identityInformation = {
  minWidth: 0,
  flex: 1,
};

const nicknameStyle = {
  color: "#fff",
  fontSize: "30px",
  fontWeight: 900,
  wordBreak: "break-word",
};

const museumId = {
  display: "inline-flex",
  marginTop: "8px",
  padding: "7px 12px",
  borderRadius: "999px",
  background: "rgba(215,181,109,0.13)",
  border: "1px solid rgba(215,181,109,0.32)",
  color: "#f2c879",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const identityDetails = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px 18px",
  marginTop: "14px",
  color: "#d9cdbb",
  fontSize: "14px",
};

const emailStyle = {
  marginTop: "10px",
  color: "#91887c",
  fontSize: "13px",
  overflowWrap: "anywhere",
};

const section = {
  marginTop: "28px",
};

const sectionHeading = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: "18px",
  marginBottom: "14px",
};

const sectionEyebrow = {
  color: "#d7b56d",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.18em",
};

const sectionTitle = {
  margin: "5px 0 0",
  color: "#fff",
  fontSize: "24px",
};

const comingSoonBadge = {
  padding: "7px 11px",
  borderRadius: "999px",
  color: "#a99d8b",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.09)",
  fontSize: "10px",
  fontWeight: 800,
  letterSpacing: "0.1em",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
  gap: "12px",
};

const statCard = {
  minHeight: "132px",
  padding: "18px",
  boxSizing: "border-box",
  borderRadius: "20px",
  border: "1px solid rgba(215,181,109,0.22)",
  background: "rgba(255,255,255,0.045)",
  textAlign: "center",
};

const statIcon = {
  fontSize: "25px",
};

const statValue = {
  marginTop: "9px",
  color: "#f2c879",
  fontSize: "28px",
  fontWeight: 900,
};

const statLabel = {
  marginTop: "5px",
  color: "#c8bcaa",
  fontSize: "13px",
  lineHeight: 1.4,
};

const emptyMemories = {
  padding: "30px 22px",
  borderRadius: "22px",
  border: "1px dashed rgba(215,181,109,0.35)",
  background: "rgba(255,255,255,0.025)",
  textAlign: "center",
};

const emptyIcon = {
  fontSize: "32px",
};

const emptyTitle = {
  marginTop: "12px",
  color: "#fff",
  fontSize: "18px",
  fontWeight: 800,
};

const emptyText = {
  maxWidth: "520px",
  margin: "9px auto 0",
  color: "#9f9588",
  fontSize: "14px",
  lineHeight: 1.6,
};

const actionsSection = {
  marginTop: "30px",
};

const uploadButton = {
  width: "100%",
  padding: "16px 24px",
  border: "none",
  borderRadius: "999px",
  background: "#d7b56d",
  color: "#111",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: 900,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

const secondaryActions = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "10px",
  marginTop: "12px",
};

const secondaryButton = {
  padding: "12px 16px",
  borderRadius: "999px",
  border: "1px solid rgba(215,181,109,0.35)",
  background: "rgba(255,255,255,0.045)",
  color: "#f2c879",
  cursor: "pointer",
  fontWeight: 800,
};

const logoutButton = {
  ...secondaryButton,
  border: "1px solid rgba(255,130,130,0.35)",
  color: "#ffb5b5",
};
