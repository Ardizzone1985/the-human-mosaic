import logoImage from "./logo-cropped.png";

export default function WelcomeGate({ onEnterGuest, onLogin, onRegister }) {
  return (
    <div style={overlay}>
      <div style={card}>
        <img src={logoImage} alt="The Human Mosaic" style={logo} />

        <div style={eyebrow}>MUSEUM RECEPTION</div>

        <h1 style={title}>
          Welcome to<br />
          THE HUMAN MOSAIC
        </h1>

        <p style={intro}>
          Explore a permanent global immersive artwork made of real people,
          real memories and real stories from around the world.
        </p>

        <div style={guideGrid}>
          <Info title="Move" text="Click the floor arrows to move through the museum." />
          <Info title="Look around" text="Click and drag to explore the space around you." />
          <Info title="View photos" text="Click any photo to open its story, country and details." />
        </div>

        <div style={accountBox}>
          <strong>Free account benefits</strong>
          <p>
            Register for free to like memories, leave comments, upload your photo,
            appear as a Community Favorite and join the global mosaic.
          </p>
        </div>

        <div style={buttons}>
          <button style={primaryButton} onClick={onLogin}>LOGIN</button>
          <button style={outlineButton} onClick={onRegister}>REGISTER FOR FREE</button>
          <button style={guestButton} onClick={onEnterGuest}>ENTER AS GUEST</button>
        </div>

        <div style={terms}>
          By continuing, you agree to our <span>Terms of Service</span>,{" "}
          <span>Privacy Policy</span> and <span>Community Guidelines</span>.
        </div>
      </div>
    </div>
  );
}

function Info({ title, text }) {
  return (
    <div style={infoCard}>
      <div style={infoTitle}>{title}</div>
      <div style={infoText}>{text}</div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 1000000,
  background:
    "radial-gradient(circle at top, rgba(215,181,109,0.22), rgba(5,5,5,0.96) 55%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "22px",
  boxSizing: "border-box",
};

const card = {
  width: "min(94vw, 760px)",
  maxHeight: "92vh",
  overflowY: "auto",
  padding: "34px 28px",
  borderRadius: "30px",
  background: "rgba(14, 8, 4, 0.96)",
  border: "1px solid rgba(215,181,109,0.55)",
  boxShadow: "0 40px 120px rgba(0,0,0,0.75)",
  color: "#fff",
  textAlign: "center",
  fontFamily: "Arial, sans-serif",
};

const logo = {
  width: "180px",
  maxWidth: "70%",
  marginBottom: "18px",
};

const eyebrow = {
  color: "#d7b56d",
  fontSize: "12px",
  letterSpacing: "0.22em",
  fontWeight: 700,
  marginBottom: "12px",
};

const title = {
  margin: 0,
  fontSize: "clamp(34px, 6vw, 64px)",
  lineHeight: 1.02,
  letterSpacing: "0.08em",
};

const intro = {
  maxWidth: "600px",
  margin: "20px auto 28px",
  color: "#e8ded0",
  fontSize: "16px",
  lineHeight: 1.7,
};

const guideGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
  marginBottom: "18px",
};

const infoCard = {
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(215,181,109,0.22)",
};

const infoTitle = {
  color: "#f2c879",
  fontWeight: 800,
  letterSpacing: "0.08em",
  marginBottom: "8px",
};

const infoText = {
  color: "#d8c7ad",
  fontSize: "14px",
  lineHeight: 1.5,
};

const accountBox = {
  margin: "18px 0",
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(215,181,109,0.10)",
  border: "1px solid rgba(215,181,109,0.28)",
  color: "#e8ded0",
  lineHeight: 1.6,
};

const buttons = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
  marginTop: "18px",
};

const primaryButton = {
  padding: "15px",
  borderRadius: "999px",
  border: "none",
  background: "#d7b56d",
  color: "#111",
  fontWeight: 800,
  cursor: "pointer",
};

const outlineButton = {
  ...primaryButton,
  background: "transparent",
  color: "#f2c879",
  border: "1px solid rgba(215,181,109,0.75)",
};

const guestButton = {
  ...primaryButton,
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.18)",
};

const terms = {
  marginTop: "18px",
  color: "#9f9180",
  fontSize: "12px",
  lineHeight: 1.6,
};

terms.span = {};
