import { useEffect } from "react";

export default function CommunityWallModal({
  open,
  user,
  profile,
  onClose,
}) {
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

  if (!open) {
    return null;
  }

  const displayName =
    profile?.nickname ||
    profile?.first_name ||
    "Participant";

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
              placeholder="Share a message with the global community..."
              maxLength={500}
              disabled
              style={textareaStyle}
            />

            <div style={composerFooterStyle}>
              <span style={helperTextStyle}>
                Message publishing will be activated in the next step.
              </span>

              <button
                type="button"
                disabled
                style={disabledButtonStyle}
              >
                PUBLISH MESSAGE
              </button>
            </div>
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
