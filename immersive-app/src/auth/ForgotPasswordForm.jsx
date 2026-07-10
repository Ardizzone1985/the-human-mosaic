import { useState } from "react";
import { supabase } from "../supabaseClient.js";

export default function ForgotPasswordForm({ onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleResetPassword(e) {
    e.preventDefault();

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setMessage("Please enter your email address.");
      return;
    }

    setMessage("");
    setLoading(true);
    setSuccess(false);

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/?reset-password=true`,
    });

    setLoading(false);

    if (error) {
      console.error("Password reset email error:", error);
      setMessage(error.message);
      return;
    }

    setSuccess(true);
    setMessage(
      "Password reset link sent. Please check your email and spam folder."
    );
  }

  return (
    <form onSubmit={handleResetPassword} style={{ display: "grid", gap: 12 }}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={input}
        autoComplete="email"
        disabled={loading || success}
        required
      />

      {message && (
        <div style={success ? successMessageStyle : messageStyle}>
          {message}
        </div>
      )}

      {!success && (
        <button type="submit" style={submitButton} disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      )}

      <button
        type="button"
        onClick={onBackToLogin}
        style={backButton}
        disabled={loading}
      >
        Back to Login
      </button>
    </form>
  );
}

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

const submitButton = {
  padding: "14px",
  borderRadius: "999px",
  border: "none",
  background: "#d7b56d",
  color: "#111",
  fontWeight: 800,
  cursor: "pointer",
};

const backButton = {
  padding: 0,
  border: "none",
  background: "transparent",
  color: "#d7b56d",
  cursor: "pointer",
  fontSize: "15px",
};

const messageStyle = {
  color: "#f2c879",
  fontSize: "14px",
  lineHeight: 1.5,
};

const successMessageStyle = {
  color: "#9ee6b0",
  fontSize: "14px",
  lineHeight: 1.5,
};
