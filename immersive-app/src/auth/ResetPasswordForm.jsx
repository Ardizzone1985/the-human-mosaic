import { useState } from "react";
import { supabase } from "../supabaseClient.js";

export default function ResetPasswordForm({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleUpdatePassword(e) {
    e.preventDefault();
    setMessage("");
    setSuccess(false);

    if (!password || !confirmPassword) {
      setMessage("Please complete both password fields.");
      return;
    }

    if (password.length < 6) {
      setMessage("The password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      console.error("Update password error:", error);
      setMessage(error.message);
      return;
    }

    setSuccess(true);
    setMessage("Your password has been updated successfully.");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div style={overlay}>
      <div style={card}>
        <h2 style={title}>Create a New Password</h2>

        <p style={subtitle}>
          Enter and confirm the new password for your Museum Account.
        </p>

        {!success ? (
          <form
            onSubmit={handleUpdatePassword}
            style={{ display: "grid", gap: 12, marginTop: 28 }}
          >
            <div style={passwordWrap}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...input, paddingRight: "48px" }}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                style={eyeButton}
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>

            <div style={passwordWrap}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ ...input, paddingRight: "48px" }}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((current) => !current)
                }
                style={eyeButton}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirmed password"
                    : "Show confirmed password"
                }
              >
                {showConfirmPassword ? "🙈" : "👁"}
              </button>
            </div>

            {message && <div style={errorMessage}>{message}</div>}

            <button
              type="submit"
              style={submitButton}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        ) : (
          <div style={{ marginTop: 26 }}>
            <div style={successMessage}>{message}</div>

            <button
              type="button"
              style={submitButton}
              onClick={onSuccess}
            >
              Continue to the Museum
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 4000000,
  background: "rgba(0,0,0,0.72)",
  backdropFilter: "blur(10px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  boxSizing: "border-box",
};

const card = {
  width: "500px",
  maxWidth: "94vw",
  padding: "40px",
  borderRadius: "24px",
  background: "#111",
  border: "1px solid rgba(215,181,109,0.4)",
  color: "#fff",
  textAlign: "center",
  boxSizing: "border-box",
};

const title = {
  fontSize: "32px",
  marginTop: 0,
  marginBottom: "10px",
};

const subtitle = {
  color: "#cfcfcf",
  lineHeight: 1.5,
  marginBottom: 0,
};

const input = {
  width: "100%",
  padding: "14px",
  borderRadius: "14px",
  border: "1px solid rgba(215,181,109,0.35)",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  boxSizing: "border-box",
  fontSize: "18px",
};

const passwordWrap = {
  position: "relative",
  width: "100%",
};

const eyeButton = {
  position: "absolute",
  right: "12px",
  top: "50%",
  transform: "translateY(-50%)",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "18px",
};

const submitButton = {
  width: "100%",
  padding: "14px",
  borderRadius: "999px",
  border: "none",
  background: "#d7b56d",
  color: "#111",
  fontWeight: 800,
  cursor: "pointer",
};

const errorMessage = {
  color: "#f2c879",
  fontSize: "14px",
  lineHeight: 1.5,
};

const successMessage = {
  color: "#9ee6b0",
  fontSize: "15px",
  lineHeight: 1.5,
  marginBottom: "20px",
};
