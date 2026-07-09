import { useState } from "react";
import { supabase } from "../supabaseClient.js";
import { COUNTRIES } from "../data/countries.js";

export default function RegisterForm({ onSuccess }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [country, setCountry] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setMessage("You must accept Terms and Privacy Policy.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          nickname: nickname.trim(),
          birth_date: birthDate,
          country: country.trim(),
          accepted_terms: true,
        },
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Account created. Please check your email to confirm your registration.");
    onSuccess?.();
  }

  return (
    <form onSubmit={handleRegister} style={{ display: "grid", gap: 12 }}>
      <input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={input} required />
      <input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} style={input} required />
      <input placeholder="Nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} style={input} required />
      <select
  value={country}
  onChange={(e) => setCountry(e.target.value)}
  style={selectInput}
  required
>
  <option value="">Select your country</option>
  {COUNTRIES.map((countryName) => (
    <option key={countryName} value={countryName}>
      {countryName}
    </option>
  ))}
</select>
      <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} style={input} required />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={input} required />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={input} required minLength={6} />
      <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={input} required minLength={6} />

      <label style={checkboxRow}>
        <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
        <span>I accept Terms and Privacy Policy</span>
      </label>

      {message && <div style={messageStyle}>{message}</div>}

      <button type="submit" style={submitButton} disabled={loading}>
        {loading ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}

const input = {
  width: "100%",
  padding: "13px",
  borderRadius: "14px",
  border: "1px solid rgba(215,181,109,0.35)",
  background: "rgba(255,255,255,0.08)",
  color: "#fff",
  boxSizing: "border-box",
  fontSize: "18px",
  colorScheme: "dark",
};

const checkboxRow = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
  color: "#d8c7ad",
  fontSize: 13,
  textAlign: "left",
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

const selectInput = {
  ...input,
  color: "#fff",
  backgroundColor: "#24211d",
};
