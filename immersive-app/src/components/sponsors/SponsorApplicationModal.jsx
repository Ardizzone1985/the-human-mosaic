export default function SponsorApplicationModal({ plan, onClose }) {
  return (
    <div style={overlay}>
      <div style={modal}>
        <button
          type="button"
          style={closeButton}
          onClick={onClose}
          aria-label="Close application form"
        >
          ×
        </button>

        <div style={eyebrow}>PARTNERSHIP APPLICATION</div>

        <h2 style={title}>
          Sponsor Application Modal
        </h2>

        <p style={text}>
          Selected plan:
        </p>

        <strong style={planName}>
          {plan?.name || "Partnership plan"}
        </strong>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 4000000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  boxSizing: "border-box",
  background: "rgba(5, 3, 2, 0.82)",
  backdropFilter: "blur(10px)",
};

const modal = {
  position: "relative",
  width: "min(100%, 560px)",
  padding: "50px 34px",
  boxSizing: "border-box",
  borderRadius: "26px",
  border: "1px solid rgba(215, 181, 109, 0.4)",
  background: "#f7f2e9",
  boxShadow: "0 28px 80px rgba(0, 0, 0, 0.45)",
  textAlign: "center",
};

const closeButton = {
  position: "absolute",
  top: "16px",
  right: "16px",
  width: "40px",
  height: "40px",
  borderRadius: "999px",
  border: "1px solid rgba(100, 70, 35, 0.25)",
  background: "transparent",
  color: "#2b1b0e",
  fontSize: "27px",
  lineHeight: 1,
  cursor: "pointer",
};

const eyebrow = {
  marginBottom: "16px",
  color: "#a67c31",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.22em",
};

const title = {
  margin: 0,
  color: "#291b0f",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "clamp(30px, 5vw, 44px)",
  fontWeight: 500,
};

const text = {
  margin: "24px 0 8px",
  color: "#6a5946",
  fontSize: "15px",
};

const planName = {
  color: "#9a7028",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "22px",
};
