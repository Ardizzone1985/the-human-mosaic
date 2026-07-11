export default function AppDialog({
  open,
  icon = "✦",
  title = "The Human Mosaic",
  message,
  confirmText = "Close",
  cancelText,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      style={overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-dialog-title"
    >
      <div style={card}>
        <div style={brand}>THE HUMAN MOSAIC</div>

        <div style={iconStyle}>{icon}</div>

        <h2 id="app-dialog-title" style={titleStyle}>
          {title}
        </h2>

        <p style={messageStyle}>{message}</p>

        <div style={actions}>
          {cancelText && (
            <button
              type="button"
              style={secondaryButton}
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            style={primaryButton}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 5000000,
  background: "rgba(0,0,0,0.72)",
  backdropFilter: "blur(10px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  boxSizing: "border-box",
};

const card = {
  width: "430px",
  maxWidth: "94vw",
  padding: "34px 30px",
  borderRadius: "24px",
  background: "#111",
  border: "1px solid rgba(215,181,109,0.5)",
  boxShadow: "0 30px 90px rgba(0,0,0,0.75)",
  color: "#fff",
  textAlign: "center",
  boxSizing: "border-box",
  fontFamily: "Arial, sans-serif",
};

const brand = {
  color: "#d7b56d",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.2em",
  marginBottom: "20px",
};

const iconStyle = {
  fontSize: "34px",
  lineHeight: 1,
  marginBottom: "14px",
};

const titleStyle = {
  margin: "0 0 12px",
  fontSize: "28px",
  color: "#fff",
};

const messageStyle = {
  margin: 0,
  color: "#d5d5d5",
  fontSize: "16px",
  lineHeight: 1.6,
};

const actions = {
  display: "flex",
  justifyContent: "center",
  gap: "12px",
  marginTop: "26px",
  flexWrap: "wrap",
};

const primaryButton = {
  minWidth: "120px",
  padding: "12px 24px",
  borderRadius: "999px",
  border: "none",
  background: "#d7b56d",
  color: "#111",
  fontWeight: 800,
  cursor: "pointer",
};

const secondaryButton = {
  minWidth: "120px",
  padding: "12px 24px",
  borderRadius: "999px",
  border: "1px solid rgba(215,181,109,0.55)",
  background: "transparent",
  color: "#d7b56d",
  fontWeight: 700,
  cursor: "pointer",
};
