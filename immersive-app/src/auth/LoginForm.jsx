import { useState } from "react";
import { supabase } from "../supabaseClient.js";

export default function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Login successful.");
    onSuccess?.();
  }

  return (
    <form onSubmit={handleLogin} style={{ display: "grid", gap: 12 }}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={input}
        required
      />

      <div style={passwordWrap}>
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    style={{ ...input, paddingRight: "48px" }}
    required
  />

  <button
    type="button"
    onClick={() => setShowPassword((v) => !v)}
    style={eyeButton}
  >
    {showPassword ? "🙈" : "👁"}
  </button>
</div>

      {message && <div style={messageStyle}>{message}</div>}

      <button type="submit" style={submitButton} disabled={loading}>
        {loading ? "Signing in..." : "Login"}
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

const messageStyle = {
  color: "#f2c879",
  fontSize: 13,
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
  color: "#f2c879",
  cursor: "pointer",
  fontSize: "18px",
};
