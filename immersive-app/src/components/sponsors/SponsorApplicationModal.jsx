import { useState } from "react";
export default function SponsorApplicationModal({ plan, onClose }) {

    const [formData, setFormData] = useState({
    company: "",
    contact_name: "",
    email: "",
    website: "",
    country: "",
    organization_type: "",
    message: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoError, setLogoError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleLogoChange(event) {
    const file = event.target.files?.[0];

    setLogoError("");

    if (!file) {
      setLogoFile(null);
      return;
    }

    const maximumSize = 5 * 1024 * 1024;

    if (file.size > maximumSize) {
      setLogoFile(null);
      setLogoError("The selected logo must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setLogoFile(file);
  }
  
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: plan?.currency || "EUR",
    maximumFractionDigits: 0,
  }).format((plan?.price_cents || 0) / 100);

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
          Tell us about your organization
        </h2>

        <p style={intro}>
          Complete the form below to submit your partnership proposal.
          Every application is reviewed individually by The Human Mosaic.
        </p>

        <div style={selectedPlanCard}>
          <div>
            <div style={selectedPlanLabel}>SELECTED PARTNERSHIP</div>

            <div style={selectedPlanName}>
              {plan?.name || "Partnership Plan"}
            </div>

            <div style={selectedPlanMeta}>
              {plan?.duration_days || 30} days
            </div>
          </div>

          <div style={selectedPlanPrice}>
            {formattedPrice}
          </div>
        </div>

        <form style={form}>
          <div style={formGrid}>
            <label style={field}>
              <span style={label}>Company Name *</span>

              <input
                type="text"
                name="company"
                style={input}
                placeholder="Organization or company name"
                value={formData.company}
onChange={handleChange}
              />
            </label>

            <label style={field}>
              <span style={label}>Contact Person *</span>

              <input
                type="text"
                name="contact_name"
                style={input}
                placeholder="Full name"
                value={formData.contact_name}
onChange={handleChange}
              />
            </label>

            <label style={field}>
              <span style={label}>Business Email *</span>

              <input
                type="email"
                name="email"
                style={input}
                placeholder="name@company.com"
                value={formData.email}
onChange={handleChange}
              />
            </label>

            <label style={field}>
              <span style={label}>Website *</span>

              <input
                type="url"
                name="website"
                style={input}
                placeholder="https://www.company.com"
                value={formData.website}
onChange={handleChange}
              />
            </label>

            <label style={field}>
              <span style={label}>Country</span>

              <input
                type="text"
                name="country"
                style={input}
                placeholder="Country"
                value={formData.country}
onChange={handleChange}
              />
            </label>

            <label style={field}>
              <span style={label}>Organization Type</span>

              <select
                name="organization_type"
                style={input}
                value={formData.organization_type}
onChange={handleChange}
              >
                <option value="" disabled>
                  Select organization type
                </option>

                <option value="museum">Museum</option>
                <option value="university">University</option>
                <option value="ngo">NGO</option>
                <option value="company">Company</option>
                <option value="cultural-institution">
                  Cultural Institution
                </option>
                <option value="foundation">Foundation</option>
                <option value="other">Other</option>
              </select>
            </label>
          </div>

          <label style={field}>
            <span style={label}>Company Logo *</span>

            <div style={uploadBox}>
              <input
                type="file"
                name="logo"
                accept=".svg,.png,.jpg,.jpeg,.webp"
                style={fileInput}
                onChange={handleLogoChange}
              />

              {logoError && (
  <div style={errorText}>
    {logoError}
  </div>
)}

              <div style={uploadTitle}>
  {logoFile ? logoFile.name : "Upload your official logo"}
</div>

<div style={uploadText}>
  {logoFile
    ? `${(logoFile.size / 1024 / 1024).toFixed(2)} MB selected`
    : "SVG, PNG, JPG or WEBP · Maximum 5 MB"}
</div>
            </div>
          </label>

          <label style={field}>
            <span style={label}>
              Why would you like to partner with The Human Mosaic?
            </span>

            <textarea
              name="message"
              style={textarea}
              placeholder="Tell us about your organization, your values and why this partnership would be meaningful."
              value={formData.message}
onChange={handleChange}
            />
          </label>

          <div style={actions}>
            <button
              type="button"
              style={cancelButton}
              onClick={onClose}
            >
              CANCEL
            </button>

            <button
              type="button"
              style={submitButton}
            >
              SUBMIT APPLICATION
            </button>
          </div>
        </form>
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
  overflowY: "auto",
  background: "rgba(5, 3, 2, 0.82)",
  backdropFilter: "blur(10px)",
};

const modal = {
  position: "relative",
  width: "min(100%, 800px)",
  maxHeight: "calc(100vh - 40px)",
  overflowY: "auto",
  padding: "48px 34px 34px",
  boxSizing: "border-box",
  borderRadius: "26px",
  border: "1px solid rgba(215, 181, 109, 0.4)",
  background: "#f7f2e9",
  boxShadow: "0 28px 80px rgba(0, 0, 0, 0.45)",
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
  marginBottom: "14px",
  color: "#a67c31",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.22em",
  textAlign: "center",
};

const title = {
  margin: 0,
  color: "#291b0f",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "clamp(32px, 5vw, 48px)",
  lineHeight: 1.05,
  fontWeight: 500,
  textAlign: "center",
};

const intro = {
  maxWidth: "620px",
  margin: "18px auto 30px",
  color: "#6a5946",
  fontSize: "15px",
  lineHeight: 1.7,
  textAlign: "center",
};

const selectedPlanCard = {
  marginBottom: "30px",
  padding: "22px 24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "20px",
  borderRadius: "18px",
  border: "1px solid rgba(166, 124, 49, 0.3)",
  background: "rgba(215, 181, 109, 0.12)",
};

const selectedPlanLabel = {
  marginBottom: "6px",
  color: "#8d6628",
  fontSize: "10px",
  fontWeight: 900,
  letterSpacing: "0.18em",
};

const selectedPlanName = {
  color: "#2b1b0e",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "24px",
};

const selectedPlanMeta = {
  marginTop: "6px",
  color: "#766552",
  fontSize: "13px",
};

const selectedPlanPrice = {
  flexShrink: 0,
  color: "#9a7028",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "28px",
};

const form = {
  display: "flex",
  flexDirection: "column",
  gap: "22px",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "18px",
};

const field = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const label = {
  color: "#3e2b1a",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "0.05em",
};

const input = {
  width: "100%",
  minHeight: "48px",
  padding: "12px 14px",
  boxSizing: "border-box",
  borderRadius: "12px",
  border: "1px solid rgba(93, 65, 35, 0.22)",
  outline: "none",
  background: "#fffdf9",
  color: "#2b1b0e",
  fontSize: "15px",
};

const uploadBox = {
  position: "relative",
  minHeight: "120px",
  padding: "24px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "16px",
  border: "1px dashed rgba(166, 124, 49, 0.55)",
  background: "rgba(255,255,255,0.45)",
  textAlign: "center",
};

const fileInput = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  opacity: 0,
  cursor: "pointer",
};

const uploadTitle = {
  color: "#2b1b0e",
  fontSize: "15px",
  fontWeight: 800,
};

const uploadText = {
  marginTop: "7px",
  color: "#756451",
  fontSize: "12px",
};

const textarea = {
  ...input,
  minHeight: "130px",
  resize: "vertical",
  fontFamily: "Arial, sans-serif",
};

const actions = {
  marginTop: "4px",
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  gap: "12px",
};

const cancelButton = {
  minHeight: "48px",
  padding: "12px 22px",
  borderRadius: "999px",
  border: "1px solid rgba(83, 56, 29, 0.3)",
  background: "transparent",
  color: "#4a321d",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.08em",
  cursor: "pointer",
};

const submitButton = {
  ...cancelButton,
  border: "none",
  background: "#2b1b0e",
  color: "#ffffff",
};

const errorText = {
  marginTop: "8px",
  color: "#a12f2f",
  fontSize: "13px",
  fontWeight: 700,
};
