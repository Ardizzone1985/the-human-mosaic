import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";

export default function MuseumIdentity({
  open,
  user,
  profile,
  museumLogoUrl,
  onClose,
  onUpload,
  onChangeAvatar,
  onChangePassword,
  onMemorySelect,
  onLogout,
}) {

    const [memorySummary, setMemorySummary] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  });

  const [loadingMemories, setLoadingMemories] = useState(false);
  const [memories, setMemories] = useState([]);
  const [likesGiven, setLikesGiven] = useState(0);
const [loadingLikesGiven, setLoadingLikesGiven] = useState(false);
  const [commentsWritten, setCommentsWritten] = useState(0);
const [loadingCommentsWritten, setLoadingCommentsWritten] = useState(false);

    useEffect(() => {
    async function loadMemorySummary() {
      if (!open || !user) return;

      setLoadingMemories(true);

      const { data, error } = await supabase.rpc(
        "get_my_memory_summary"
      );

      setLoadingMemories(false);

      if (error) {
        console.error("Load memory summary error:", error);
        return;
      }

      const summary = data?.[0];

      setMemorySummary({
        total: Number(summary?.total_memories || 0),
        approved: Number(summary?.approved_memories || 0),
        rejected: Number(summary?.rejected_memories || 0),
        pending: Number(summary?.pending_memories || 0),
      });
    }

      async function loadMemories() {
  if (!open || !user) return;

  const { data, error } = await supabase.rpc("get_my_memories");

  if (error) {
    console.error("Load personal memories error:", error);
    setMemories([]);
    return;
  }

  setMemories(Array.isArray(data) ? data : []);
}

      async function loadLikesGiven() {
  if (!open || !user) return;

  setLoadingLikesGiven(true);

  const { data, error } = await supabase.rpc(
    "get_my_likes_given_count"
  );

  setLoadingLikesGiven(false);

  if (error) {
    console.error("Load likes given error:", error);
    setLikesGiven(0);
    return;
  }

  setLikesGiven(Number(data || 0));
}

      async function loadCommentsWritten() {
  if (!open || !user) return;

  setLoadingCommentsWritten(true);

  const { data, error } = await supabase.rpc(
    "get_my_comments_written_count"
  );

  setLoadingCommentsWritten(false);

  if (error) {
    console.error("Load comments written error:", error);
    setCommentsWritten(0);
    return;
  }

  setCommentsWritten(Number(data || 0));
}

    loadMemorySummary();
      loadMemories();
      loadLikesGiven();
      loadCommentsWritten();
  }, [open, user?.id]);
  
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
          <div style={avatar}>
  <img
  src={profile?.avatar_url || museumLogoUrl}
  alt={`${nickname} avatar`}
  style={{
    ...avatarImage,
    objectFit: profile?.avatar_url ? "cover" : "contain",
    padding: profile?.avatar_url ? 0 : "8px",
    boxSizing: "border-box",
  }}
/>
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
            <StatCard
  icon="🖼"
  label="My Memories"
  value={loadingMemories ? "…" : memorySummary.total}
/>
            <StatCard
  icon="❤️"
  label="Likes Given"
  value={loadingLikesGiven ? "…" : likesGiven}
/>
            <StatCard
  icon="💬"
  label="Comments Written"
  value={loadingCommentsWritten ? "…" : commentsWritten}
/>
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

<div style={memoriesContainer}>
  <div style={memorySummaryHeader}>
    <div>
      <div style={emptyTitle}>
        {loadingMemories
          ? "Loading your memories..."
          : `${memorySummary.total} ${
              memorySummary.total === 1 ? "Memory" : "Memories"
            }`}
      </div>

      <div style={emptyText}>
        Your personal collection inside The Human Mosaic.
      </div>
    </div>

    {!loadingMemories && (
      <div style={memoryStatusGrid}>
        <div style={memoryStatusItem}>
          <strong style={memoryStatusItemStrong}>
            {memorySummary.approved}
          </strong>
          <span>Approved</span>
        </div>

        <div style={memoryStatusItem}>
          <strong style={memoryStatusItemStrong}>
            {memorySummary.pending}
          </strong>
          <span>Pending</span>
        </div>

        <div style={memoryStatusItem}>
          <strong style={memoryStatusItemStrong}>
            {memorySummary.rejected}
          </strong>
          <span>Rejected</span>
        </div>
      </div>
    )}
  </div>

  {!loadingMemories && memories.length > 0 ? (
    <div style={memoriesGrid}>
      {memories.map((memory) => {
        const status = String(
          memory.approval_status || "pending"
        ).toLowerCase();

        const imageSource =
          memory.image_url ||
          `https://cqpujmwfiqbwdsmuwkmb.supabase.co/storage/v1/object/public/images/${memory.image_file_name}`;

        return (
          <button
  type="button"
  key={memory.id}
  onClick={() => onMemorySelect?.(memory)}
  style={{
    ...memoryCard,
    borderColor: getStatusColor(status),
  }}
  aria-label={`Open ${memory.room || "museum"} memory`}
>
            <div style={memoryImageWrap}>
              <img
                src={imageSource}
                alt={`${memory.room || "Museum"} memory`}
                style={memoryImage}
                loading="lazy"
              />

              <div
                style={{
                  ...memoryStatusBadge,
                  color: getStatusColor(status),
                  borderColor: getStatusColor(status),
                }}
              >
                {formatMemoryStatus(status)}
              </div>
            </div>

            <div style={memoryCardBody}>
              <div style={memoryRoom}>
                {memory.room || "The Human Mosaic"}
              </div>

              <div style={memoryCountry}>
                🌍 {memory.country || "Country unavailable"}
              </div>

              <div style={memorySocialStats}>
                <span>❤️ {memory.likes_count ?? 0}</span>
                <span>💬 {memory.comments_count ?? 0}</span>
                <span>👁 {memory.views_count ?? 0}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  ) : (
    !loadingMemories && (
      <div style={noMemories}>
        <div style={emptyIcon}>🖼</div>
        <div style={emptyTitle}>No memories yet</div>
        <div style={emptyText}>
          Your submitted memories will appear here.
        </div>
      </div>
    )
  )}
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
  onClick={onChangeAvatar}
>
  Change Avatar
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

function getStatusColor(status) {
  if (status === "approved") return "#d7b56d";
  if (status === "rejected") return "#ff8f8f";
  return "#f2c879";
}

function formatMemoryStatus(status) {
  if (status === "approved") return "APPROVED";
  if (status === "rejected") return "REJECTED";
  return "PENDING";
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
  overflow: "hidden",
  borderRadius: "50%",
  border: "2px solid rgba(215,181,109,0.72)",
  background: "#111",
};

const avatarImage = {
  width: "100%",
  height: "100%",
  display: "block",
  objectFit: "cover",
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

const memoryStatusGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(90px, 1fr))",
  gap: "10px",
  maxWidth: "440px",
  margin: "18px auto",
};

const memoryStatusItem = {
  display: "grid",
  gap: "5px",
  padding: "13px 10px",
  borderRadius: "16px",
  border: "1px solid rgba(215,181,109,0.22)",
  background: "rgba(215,181,109,0.06)",
  color: "#b9ae9e",
  fontSize: "12px",
};

const memoryStatusItemStrong = {
  color: "#f2c879",
  fontSize: "22px",
};

const emptyText = {
  maxWidth: "520px",
  margin: "9px auto 0",
  color: "#9f9588",
  fontSize: "14px",
  lineHeight: 1.6,
};

const memoriesContainer = {
  padding: "22px",
  borderRadius: "22px",
  border: "1px solid rgba(215,181,109,0.28)",
  background: "rgba(255,255,255,0.025)",
};

const memorySummaryHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const memoriesGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
  gap: "14px",
};

const memoryCard = {
  width: "100%",
  padding: 0,
  overflow: "hidden",
  borderRadius: "18px",
  border: "1px solid",
  background: "rgba(255,255,255,0.045)",
  color: "inherit",
  font: "inherit",
  textAlign: "left",
  cursor: "pointer",
  appearance: "none",
};

const memoryImageWrap = {
  position: "relative",
  width: "100%",
  aspectRatio: "1 / 1",
  overflow: "hidden",
  background: "#050505",
};

const memoryImage = {
  width: "100%",
  height: "100%",
  display: "block",
  objectFit: "cover",
};

const memoryStatusBadge = {
  position: "absolute",
  top: "10px",
  right: "10px",
  padding: "6px 9px",
  borderRadius: "999px",
  border: "1px solid",
  background: "rgba(0,0,0,0.78)",
  backdropFilter: "blur(8px)",
  fontSize: "9px",
  fontWeight: 900,
  letterSpacing: "0.1em",
};

const memoryCardBody = {
  padding: "13px",
};

const memoryRoom = {
  color: "#f2c879",
  fontSize: "13px",
  fontWeight: 900,
  textTransform: "uppercase",
};

const memoryCountry = {
  marginTop: "7px",
  color: "#c8bcaa",
  fontSize: "12px",
};

const memorySocialStats = {
  display: "flex",
  justifyContent: "space-between",
  gap: "7px",
  marginTop: "12px",
  color: "#ded4c5",
  fontSize: "11px",
};

const noMemories = {
  padding: "28px 20px",
  borderRadius: "18px",
  border: "1px dashed rgba(215,181,109,0.3)",
  textAlign: "center",
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
