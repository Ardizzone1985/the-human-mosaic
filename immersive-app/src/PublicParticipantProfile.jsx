import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";
import museumLogoUrl from "./logo-cropped.png";

export default function PublicParticipantProfile({
  participantId,
  onClose,
  onMemorySelect,
}) {
  const [profile, setProfile] = useState(null);
  const [memories, setMemories] = useState([]);
const [memoriesLoading, setMemoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!participantId) return;

    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setProfile(null);
      setError("");

      const { data, error: rpcError } = await supabase.rpc(
        "get_public_participant_profile",
        { p_participant_id: participantId }
      );

      if (cancelled) return;

      if (rpcError) {
        console.error("Public profile error:", rpcError);
        setError("Unable to load participant profile.");
      } else {
        setProfile(data?.[0] || null);
      }

      setLoading(false);
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [participantId]);

  useEffect(() => {
  if (!participantId) return;

  let cancelled = false;

  async function loadMemories() {
    setMemoriesLoading(true);
    setMemories([]);

    const { data, error } = await supabase.rpc(
      "get_public_participant_memories",
      { p_participant_id: participantId }
    );

    if (cancelled) return;

    if (error) {
      console.error("Public participant memories error:", error);
      setMemories([]);
    } else {
      setMemories(data ?? []);
    }

    setMemoriesLoading(false);
  }

  loadMemories();

  return () => {
    cancelled = true;
  };
}, [participantId]);

  if (!participantId) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000001,
        background: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "min(94vw, 480px)",
          maxHeight: "85vh",
          overflowY: "auto",
          padding: "26px",
          borderRadius: "24px",
          background: "#140c07",
          border: "1px solid #d7b56d",
          color: "#fff",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            color: "#d7b56d",
            fontSize: "12px",
            letterSpacing: "0.18em",
            marginBottom: "20px",
          }}
        >
          THE HUMAN MOSAIC · PARTICIPANT
        </div>

        {loading ? (
          <p>Loading participant...</p>
        ) : error || !profile ? (
          <p>{error || "Participant not found."}</p>
        ) : (
          <>
            <img
              src={profile.avatar_url || museumLogoUrl}
              alt="Participant avatar"
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #d7b56d",
              }}
            />

            <h2 style={{ color: "#f6d98a" }}>
              @{profile.nickname}
            </h2>

            <p>{profile.country}</p>

            <p style={{ color: "#c9bba7", fontSize: "13px" }}>
              Member since{" "}
              {new Date(profile.member_since).toLocaleDateString(
                "en-US",
                { month: "long", year: "numeric" }
              )}
            </p>

            <div
              style={{
                marginTop: "24px",
                padding: "18px",
                borderTop: "1px solid rgba(215,181,109,0.3)",
              }}
            >
              <h3 style={{ color: "#d7b56d" }}>
                MY MEMORIES
              </h3>

              {memoriesLoading ? (
  <p>Loading memories...</p>
) : memories.length === 0 ? (
  <p style={{ color: "#bdb0a0", fontSize: "14px" }}>
    No published memories yet.
  </p>
) : (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "10px",
      marginTop: "18px",
    }}
  >
    {memories.map((memory) => (
      <button
  key={memory.submission_id}
  type="button"
  onClick={() => onMemorySelect?.(memory.submission_id)}
  style={{
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    minWidth: 0,
    fontFamily: "inherit",
  }}
>
        <img
          src={
            memory.image_url ||
            `https://cqpujmwfiqbwdsmuwkmb.supabase.co/storage/v1/object/public/images/${memory.image_file_name}`
          }
          alt={`Memory in ${memory.room}`}
          loading="lazy"
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            objectFit: "cover",
            borderRadius: "10px",
            border: "1px solid rgba(215,181,109,0.4)",
          }}
        />

        <div
          style={{
            fontSize: "11px",
            color: "#d7b56d",
            marginTop: "5px",
          }}
        >
              {memory.room}
  </div>
</button>
    ))}
  </div>
)}
            </div>
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: "24px",
            width: "100%",
            padding: "14px",
            borderRadius: "999px",
            border: "none",
            background: "#d7b56d",
            color: "#1b0d05",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          RETURN TO MUSEUM
        </button>
      </div>
    </div>
  );
}
