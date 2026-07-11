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

        <div style={tagline}>One Humanity. Millions of Memories. One Mosaic.</div>

        <p style={intro}>
          Explore a permanent global immersive artwork made of real people,
          real memories and real stories from around the world.
        </p>

        <div style={freeNotice}>
          Browsing the museum is completely free. Registration is only required
          to like, comment, upload memories and become part of the artwork.
        </div>

        <div style={sectionTitle}>HOW TO EXPLORE</div>

        <div style={guideGrid}>
          <Info icon="➤" title="Move" text="Click the floor arrows to move through the museum." />
          <Info icon="🖱" title="Look around" text="Click and drag to explore the space around you." />
          <Info icon="🖼" title="View photos" text="Click any photo to open its story, country and details." />
        </div>

        <div style={accountBox}>
          <div style={accountTitle}>WHY CREATE A FREE ACCOUNT?</div>

          <div style={benefitGrid}>
            <Benefit text="Like memories you love" />
            <Benefit text="Leave comments" />
            <Benefit text="Upload your own photo" />
            <Benefit text="Become a Community Favorite" />
            <Benefit text="Create your personal profile" />
          </div>
        </div>

        <div style={journeyText}>Choose how you'd like to begin your journey.</div>

        <div style={buttons}>
          <button style={primaryButton} onClick={onLogin}>LOGIN</button>
          <button style={outlineButton} onClick={onRegister}>REGISTER FOR FREE</button>
          <button style={guestButton} onClick={onEnterGuest}>ENTER MUSEUM AS GUEST</button>
        </div>

        <div style={terms}>
  By continuing, you agree to our{" "}
  <a
    href="https://thehumanmosaic.art/terms.html"
    target="_blank"
    rel="noopener noreferrer"
    style={link}
  >
    Terms of Service
  </a>
  ,{" "}
  <a
    href="https://thehumanmosaic.art/privacy.html"
    target="_blank"
    rel="noopener noreferrer"
    style={link}
  >
    Privacy Policy
  </a>{" "}
  and{" "}
  <button
    type="button"
    style={linkButton}
    onClick={() => {
      window.open(
        "https://thehumanmosaic.art/community-guidelines.html",
        "_blank",
        "noopener,noreferrer"
      );
    }}
  >
    Community Guidelines
  </button>
  .
</div>

        <div style={footerLinks}>
  <a
    href="https://thehumanmosaic.art/terms.html"
    target="_blank"
    rel="noopener noreferrer"
    style={footerLink}
  >
    Terms
  </a>

  <a
    href="https://thehumanmosaic.art/privacy.html"
    target="_blank"
    rel="noopener noreferrer"
    style={footerLink}
  >
    Privacy
  </a>

  <button
    type="button"
    style={footerLinkButton}
    onClick={() => {
      window.open(
        "https://thehumanmosaic.art/community-guidelines.html",
        "_blank",
        "noopener,noreferrer"
      );
    }}
  >
    Community Guidelines
  </button>

  <a
    href="https://thehumanmosaic.art/license.html"
    target="_blank"
    rel="noopener noreferrer"
    style={footerLink}
  >
    License
  </a>

  <a
    href="mailto:info@thehumanmosaic.art"
    style={footerLink}
  >
    Contact
  </a>
</div>
      </div>
    </div>
  );
}

function Info({ icon, title, text }) {
  return (
    <div style={infoCard}>
      <div style={infoIcon}>{icon}</div>
      <div style={infoTitle}>{title}</div>
      <div style={infoText}>{text}</div>
    </div>
  );
}

function Benefit({ text }) {
  return (
    <div style={benefitItem}>
      <span style={check}>✓</span>
      <span>{text}</span>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 1000000,
  background:
    "radial-gradient(circle at top, rgba(215,181,109,0.24), rgba(5,5,5,0.97) 58%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "22px",
  boxSizing: "border-box",
};

const card = {
  width: "min(94vw, 820px)",
  maxHeight: "92vh",
  overflowY: "auto",
  padding: "30px 28px",
  borderRadius: "30px",
  background: "linear-gradient(180deg, rgba(18,10,5,0.98), rgba(8,6,4,0.98))",
  border: "1px solid rgba(215,181,109,0.58)",
  boxShadow: "0 40px 120px rgba(0,0,0,0.78)",
  color: "#fff",
  textAlign: "center",
  fontFamily: "Arial, sans-serif",
};

const logo = {
  width: "150px",
  maxWidth: "66%",
  marginBottom: "14px",
};

const eyebrow = {
  color: "#d7b56d",
  fontSize: "12px",
  letterSpacing: "0.24em",
  fontWeight: 800,
  marginBottom: "10px",
};

const title = {
  margin: 0,
  fontSize: "clamp(30px, 5vw, 52px)",
  lineHeight: 1.05,
  letterSpacing: "0.08em",
};

const tagline = {
  marginTop: "14px",
  color: "#f2c879",
  fontSize: "15px",
  letterSpacing: "0.08em",
  fontWeight: 700,
};

const intro = {
  maxWidth: "610px",
  margin: "18px auto 18px",
  color: "#e8ded0",
  fontSize: "15px",
  lineHeight: 1.65,
};

const freeNotice = {
  maxWidth: "680px",
  margin: "0 auto 22px",
  padding: "14px 16px",
  borderRadius: "18px",
  background: "rgba(215,181,109,0.10)",
  border: "1px solid rgba(215,181,109,0.25)",
  color: "#f2e6cf",
  fontSize: "14px",
  lineHeight: 1.55,
};

const sectionTitle = {
  color: "#d7b56d",
  fontSize: "12px",
  letterSpacing: "0.2em",
  fontWeight: 800,
  margin: "8px 0 14px",
};

const guideGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
  marginBottom: "16px",
};

const infoCard = {
  padding: "16px",
  borderRadius: "18px",
  background: "rgba(255,255,255,0.055)",
  border: "1px solid rgba(215,181,109,0.22)",
};

const infoIcon = {
  color: "#f2c879",
  fontSize: "24px",
  marginBottom: "8px",
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
  margin: "16px 0",
  padding: "18px",
  borderRadius: "20px",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(215,181,109,0.25)",
};

const accountTitle = {
  color: "#f2c879",
  fontSize: "13px",
  letterSpacing: "0.16em",
  fontWeight: 800,
  marginBottom: "12px",
};

const benefitGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "10px",
  textAlign: "left",
};

const benefitItem = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
  color: "#e8ded0",
  fontSize: "14px",
};

const check = {
  width: "22px",
  height: "22px",
  borderRadius: "999px",
  background: "#d7b56d",
  color: "#111",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  flexShrink: 0,
};

const journeyText = {
  marginTop: "18px",
  color: "#f2c879",
  fontSize: "14px",
  letterSpacing: "0.08em",
};

const buttons = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "12px",
  marginTop: "14px",
};

const primaryButton = {
  padding: "15px",
  borderRadius: "999px",
  border: "none",
  background: "#d7b56d",
  color: "#111",
  fontWeight: 900,
  cursor: "pointer",
  letterSpacing: "0.03em",
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
  border: "1px solid rgba(255,255,255,0.20)",
};

const terms = {
  marginTop: "18px",
  color: "#9f9180",
  fontSize: "12px",
  lineHeight: 1.6,
};

const link = {
  color: "#d7b56d",
  textDecoration: "underline",
  cursor: "pointer",
  font: "inherit",
};

const linkButton = {
  ...link,
  padding: 0,
  border: "none",
  background: "transparent",
};

const footerLink = {
  color: "#817568",
  textDecoration: "none",
  cursor: "pointer",
};

const footerLinkButton = {
  ...footerLink,
  padding: 0,
  border: "none",
  background: "transparent",
  font: "inherit",
};

const footerLinks = {
  marginTop: "12px",
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "14px",
  color: "#817568",
  fontSize: "12px",
};
