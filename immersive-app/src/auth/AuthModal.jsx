import { useEffect, useState } from "react";

export default function AuthModal({ mode, onClose }) {
  const [currentMode, setCurrentMode] = useState(mode ?? "login");

useEffect(() => {
  setCurrentMode(mode ?? "login");
}, [mode]);

  if (!mode) return null;

  return (
    <div style={overlay}>
      <div style={card}>

        <h2 style={title}>
          {currentMode === "login"
            ? "Welcome Back"
            : "Create your Museum Account"}
        </h2>

        <p style={subtitle}>
          {currentMode === "login"
            ? "Sign in to continue your journey."
            : "Become part of The Human Mosaic."}
        </p>

        <div style={{ marginTop: 30 }}>

          {currentMode === "login" ? (

            <button
              style={switchButton}
              onClick={() => setCurrentMode("register")}
            >
              Need an account? Register
            </button>

          ) : (

            <button
              style={switchButton}
              onClick={() => setCurrentMode("login")}
            >
              Already have an account? Login
            </button>

          )}

        </div>

        <button
          style={closeButton}
          onClick={onClose}
        >
          Close
        </button>

      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.65)",
  backdropFilter: "blur(8px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000001,
};

const card = {
  width: 500,
  maxWidth: "94vw",
  padding: 40,
  borderRadius: 24,
  background: "#111",
  border: "1px solid rgba(215,181,109,.4)",
  color: "#fff",
  textAlign: "center",
};

const title = {
  fontSize: 32,
  marginBottom: 10,
};

const subtitle = {
  color: "#cfcfcf",
  marginBottom: 20,
};

const switchButton = {
  background: "transparent",
  border: "none",
  color: "#d7b56d",
  cursor: "pointer",
  fontSize: 15,
};

const closeButton = {
  marginTop: 30,
  padding: "12px 30px",
  borderRadius: 999,
  border: "none",
  background: "#d7b56d",
  color: "#111",
  cursor: "pointer",
  fontWeight: 700,
};
