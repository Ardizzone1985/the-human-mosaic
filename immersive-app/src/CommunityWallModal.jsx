import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";

export default function CommunityWallModal({
  open,
  user,
  profile,
  onClose,
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
const [publishing, setPublishing] = useState(false);
const [publishError, setPublishError] = useState("");
const [publishSuccess, setPublishSuccess] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const displayName =
    profile?.nickname ||
    profile?.first_name ||
    "Participant";

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadMessages() {
      setLoading(true);
      setLoadError("");

      const { data, error } = await supabase
        .from("community_messages")
        .select(`
          id,
          nickname,
          country,
          message,
          created_at
        `)
        .eq("approval_status", "approved")
        .order("created_at", {
          ascending: false,
        });

      if (cancelled) return;

      if (error) {
        console.error("Community messages error:", error);
        setLoadError(
          "Unable to load community messages."
        );
        setLoading(false);
        return;
      }

      setMessages(data || []);
      setLoading(false);
    }

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [open, refreshKey]);

  async function handlePublishMessage() {
    if (publishing) {
  return;
}
  const cleanMessage = draftMessage.trim();

  setPublishError("");
  setPublishSuccess("");

  if (!cleanMessage) {
    setPublishError("Please write a message before publishing.");
    return;
  }

  if (cleanMessage.length > 500) {
    setPublishError("Message cannot exceed 500 characters.");
    return;
  }

  setPublishing(true);

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      setPublishError(
        "Your session has expired. Please log in again."
      );
      return;
    }

    const response = await fetch("/api/community/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        message: cleanMessage,
      }),
    });

    const result = await response.json();

if (!response.ok) {
  throw new Error(
    result?.error || "Unable to publish the message."
  );
}

console.log("Community moderation response:", result);

setDraftMessage("");
setPublishError("");

if (result?.approvalStatus === "approved") {
  setRefreshKey((value) => value + 1);

  setPublishSuccess(
    "Your message has been published successfully."
  );
} else {
  setPublishSuccess(
    "Your message is under review before publication."
  );
}
  } catch (error) {
    console.error("Community publish error:", error);

    setPublishError(
      error?.message || "Unable to publish the message."
    );
  } finally {
    setPublishing(false);
  }
}

  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="community-wall-title"
      style={overlayStyle}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div style={modalStyle}>
        <button
          type="button"
          aria-label="Close Community Wall"
          style={closeButtonStyle}
          onClick={onClose}
        >
          ×
        </button>

        <div style={brandStyle}>
          THE HUMAN MOSAIC
        </div>

        <h2
          id="community-wall-title"
          style={titleStyle}
        >
          COMMUNITY WALL
        </h2>

        <p style={subtitleStyle}>
          Messages from participants around the world
        </p>

        <div style={dividerStyle} />

        <div style={messagesAreaStyle}>
  {loading ? (
    <div style={emptyStateStyle}>
      <div style={emptyIconStyle}>✦</div>

      <div style={emptyTitleStyle}>
        Loading community messages...
      </div>
    </div>
  ) : loadError ? (
    <div style={errorStateStyle}>
      {loadError}
    </div>
  ) : messages.length === 0 ? (
    <div style={emptyStateStyle}>
      <div style={emptyIconStyle}>✦</div>

      <div style={emptyTitleStyle}>
        The wall is waiting for its first messages
      </div>

      <div style={emptyTextStyle}>
        Approved messages from members of The Human Mosaic
        community will appear here.
      </div>
    </div>
  ) : (
    <div style={messagesListStyle}>
      {messages.map((item) => (
        <article
          key={item.id}
          style={messageCardStyle}
        >
          <div style={messageHeaderStyle}>
            <div>
              <div style={messageNicknameStyle}>
                {item.nickname || "Participant"}
              </div>

              {item.country && (
                <div style={messageCountryStyle}>
                  {item.country}
                </div>
              )}
            </div>

            <time style={messageDateStyle}>
              {new Date(item.created_at).toLocaleDateString(
                "en-GB",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              )}
            </time>
          </div>

          <p style={messageTextStyle}>
            {item.message}
          </p>
        </article>
      ))}
    </div>
  )}
</div>

        <div style={dividerStyle} />

        {user ? (
          <div style={composerStyle}>
            <div style={signedInStyle}>
              Posting as{" "}
              <strong style={signedInNameStyle}>
                {displayName}
              </strong>
            </div>

            <textarea
  value={draftMessage}
  onChange={(event) => {
    setDraftMessage(event.target.value);
    setPublishError("");
    setPublishSuccess("");
  }}
  placeholder="Share a message with the global community..."
  maxLength={500}
  disabled={publishing}
  style={{
    ...textareaStyle,
    opacity: publishing ? 0.62 : 1,
  }}
/>

            <div style={composerFooterStyle}>
  <div>
    <span style={helperTextStyle}>
      {draftMessage.length} / 500 characters
    </span>

    <div style={guidelinesStyle}>
      By publishing you agree to our Community Guidelines.
    </div>
  </div>

  <button
    type="button"
    onClick={handlePublishMessage}
    disabled={publishing || !draftMessage.trim()}
    style={
      publishing || !draftMessage.trim()
        ? disabledButtonStyle
        : publishButtonStyle
    }
  >
    {publishing ? "CHECKING..." : "PUBLISH MESSAGE"}
  </button>
</div>
            </div>
            {publishError && (
  <div style={publishErrorStyle}>
    {publishError}
  </div>
)}

{publishSuccess && (
  <div style={publishSuccessStyle}>
    {publishSuccess}
  </div>
)}
          </div>
        ) : (
          <div style={guestNoticeStyle}>
            <div style={guestNoticeTitleStyle}>
              Join the conversation
            </div>

            <div style={guestNoticeTextStyle}>
              Guests can read community messages. Login or register
              to publish a message.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 3000000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  boxSizing: "border-box",
  background: "rgba(5, 3, 2, 0.78)",
  backdropFilter: "blur(12px)",
};

const modalStyle = {
  position: "relative",
  width: "min(94vw, 760px)",
  maxHeight: "88vh",
  overflowY: "auto",
  boxSizing: "border-box",
  padding: "34px 30px 30px",
  borderRadius: "28px",
  background:
    "linear-gradient(180deg, rgba(31, 18, 10, 0.98), rgba(13, 7, 4, 0.98))",
  border: "1px solid rgba(215, 181, 109, 0.62)",
  boxShadow:
    "0 35px 110px rgba(0, 0, 0, 0.82), inset 0 0 45px rgba(215, 181, 109, 0.04)",
  color: "#ffffff",
  fontFamily: "Arial, sans-serif",
};

const closeButtonStyle = {
  position: "absolute",
  top: "16px",
  right: "18px",
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  border: "1px solid rgba(215, 181, 109, 0.42)",
  background: "rgba(255, 255, 255, 0.04)",
  color: "#f2c879",
  fontSize: "26px",
  lineHeight: 1,
  cursor: "pointer",
};

const brandStyle = {
  marginBottom: "10px",
  color: "#d7b56d",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.24em",
  textAlign: "center",
};

const titleStyle = {
  margin: 0,
  color: "#fff4d8",
  fontSize: "clamp(26px, 4vw, 38px)",
  fontWeight: 800,
  letterSpacing: "0.12em",
  textAlign: "center",
};

const subtitleStyle = {
  margin: "12px auto 0",
  maxWidth: "520px",
  color: "#d8c7ad",
  fontSize: "15px",
  lineHeight: 1.6,
  textAlign: "center",
};

const dividerStyle = {
  width: "100%",
  height: "1px",
  margin: "24px 0",
  background:
    "linear-gradient(90deg, transparent, rgba(215,181,109,0.72), transparent)",
};

const messagesAreaStyle = {
  minHeight: "260px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const emptyStateStyle = {
  maxWidth: "460px",
  padding: "28px 22px",
  textAlign: "center",
};

const emptyIconStyle = {
  marginBottom: "14px",
  color: "#d7b56d",
  fontSize: "34px",
};

const emptyTitleStyle = {
  marginBottom: "10px",
  color: "#fff4d8",
  fontSize: "18px",
  fontWeight: 800,
};

const emptyTextStyle = {
  color: "#b9aa94",
  fontSize: "14px",
  lineHeight: 1.7,
};

const errorStateStyle = {
  width: "100%",
  padding: "22px",
  boxSizing: "border-box",
  borderRadius: "16px",
  border: "1px solid rgba(210, 92, 92, 0.45)",
  background: "rgba(130, 35, 35, 0.16)",
  color: "#f0b6b6",
  fontSize: "14px",
  lineHeight: 1.6,
  textAlign: "center",
};

const messagesListStyle = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const messageCardStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "18px",
  borderRadius: "18px",
  border: "1px solid rgba(215, 181, 109, 0.25)",
  background: "rgba(255, 255, 255, 0.035)",
};

const messageHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  marginBottom: "13px",
};

const messageNicknameStyle = {
  color: "#f2c879",
  fontSize: "15px",
  fontWeight: 800,
};

const messageCountryStyle = {
  marginTop: "4px",
  color: "#9f8b6a",
  fontSize: "12px",
};

const messageDateStyle = {
  flexShrink: 0,
  color: "#8f8270",
  fontSize: "11px",
};

const messageTextStyle = {
  margin: 0,
  color: "#e7dcc8",
  fontSize: "14px",
  lineHeight: 1.7,
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
};

const composerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const signedInStyle = {
  color: "#b9aa94",
  fontSize: "13px",
};

const signedInNameStyle = {
  color: "#f2c879",
};

const textareaStyle = {
  width: "100%",
  minHeight: "120px",
  resize: "vertical",
  boxSizing: "border-box",
  padding: "15px 16px",
  borderRadius: "16px",
  border: "1px solid rgba(215, 181, 109, 0.32)",
  outline: "none",
  background: "rgba(255, 255, 255, 0.035)",
  color: "#ffffff",
  fontFamily: "Arial, sans-serif",
  fontSize: "14px",
  lineHeight: 1.6,
  opacity: 0.62,
};

const composerFooterStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
  flexWrap: "wrap",
};

const helperTextStyle = {
  color: "#8f8270",
  fontSize: "12px",
  lineHeight: 1.5,
};

const guidelinesStyle = {
  marginTop: "6px",
  color: "#8f8270",
  fontSize: "11px",
  lineHeight: 1.5,
};

const disabledButtonStyle = {
  border: "none",
  borderRadius: "999px",
  padding: "11px 18px",
  background: "rgba(215, 181, 109, 0.32)",
  color: "rgba(255, 255, 255, 0.5)",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.08em",
  cursor: "not-allowed",
};

const guestNoticeStyle = {
  padding: "20px",
  borderRadius: "18px",
  border: "1px solid rgba(215, 181, 109, 0.24)",
  background: "rgba(215, 181, 109, 0.055)",
  textAlign: "center",
};

const guestNoticeTitleStyle = {
  marginBottom: "8px",
  color: "#f2c879",
  fontSize: "17px",
  fontWeight: 800,
};

const guestNoticeTextStyle = {
  color: "#b9aa94",
  fontSize: "14px",
  lineHeight: 1.65,
};

const publishButtonStyle = {
  border: "none",
  borderRadius: "999px",
  padding: "11px 18px",
  background:
    "linear-gradient(135deg, #d7b56d, #f2c879)",
  color: "#211308",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.08em",
  cursor: "pointer",
  boxShadow: "0 8px 24px rgba(215, 181, 109, 0.22)",
};

const publishErrorStyle = {
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(210, 92, 92, 0.45)",
  background: "rgba(130, 35, 35, 0.16)",
  color: "#f0b6b6",
  fontSize: "13px",
  lineHeight: 1.5,
};

const publishSuccessStyle = {
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(105, 190, 130, 0.38)",
  background: "rgba(45, 125, 70, 0.14)",
  color: "#bce5c5",
  fontSize: "13px",
  lineHeight: 1.5,
};
