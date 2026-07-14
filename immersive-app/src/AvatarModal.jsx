import { useEffect, useMemo, useState } from "react";

export default function AvatarModal({
  open,
  currentAvatarUrl,
  museumLogoUrl,
  saving,
  errorMessage,
  onClose,
  onSave,
  onUseMuseumLogo,
}) {
  const [selectedFile, setSelectedFile] = useState(null);

  const previewUrl = useMemo(() => {
    if (!selectedFile) return null;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
    }
  }, [open]);

  if (!open) return null;

  const displayedAvatar =
    previewUrl || currentAvatarUrl || museumLogoUrl;

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      event.target.value = "";
      setSelectedFile(null);
      window.alert("Please choose a JPG, PNG or WEBP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      event.target.value = "";
      setSelectedFile(null);
      window.alert("The avatar must be smaller than 2 MB.");
      return;
    }

    setSelectedFile(file);
  }

  return (
    <div
      style={overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="avatar-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose?.();
        }
      }}
    >
      <div style={panel}>
        <button
          type="button"
          onClick={onClose}
          style={closeButton}
          disabled={saving}
          aria-label="Close avatar window"
        >
          ×
        </button>

        <div style={eyebrow}>THE HUMAN MOSAIC</div>

        <h2 id="avatar-modal-title" style={title}>
          Change Avatar
        </h2>

        <p style={subtitle}>
          Choose how you want to appear in your Museum Identity.
        </p>

        <div style={avatarPreview}>
          <img
            src={displayedAvatar}
            alt="Avatar preview"
            style={avatarImage}
          />
        </div>

        <label style={uploadLabel}>
          Choose Personal Avatar

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            style={hiddenInput}
            disabled={saving}
          />
        </label>

        <div style={helperText}>
          JPG, PNG or WEBP · Maximum 2 MB
        </div>

        {selectedFile && (
          <div style={selectedFileName}>
            Selected: {selectedFile.name}
          </div>
        )}

        {errorMessage && (
          <div style={errorText}>
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          style={{
            ...saveButton,
            opacity: !selectedFile || saving ? 0.55 : 1,
            cursor:
              !selectedFile || saving
                ? "not-allowed"
                : "pointer",
          }}
          disabled={!selectedFile || saving}
          onClick={() => onSave?.(selectedFile)}
        >
          {saving ? "Saving..." : "Save Avatar"}
        </button>

        <button
          type="button"
          style={museumLogoButton}
          disabled={saving}
          onClick={onUseMuseumLogo}
        >
          Use Museum Logo
        </button>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 4700000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  boxSizing: "border-box",
  background: "rgba(0,0,0,0.78)",
  backdropFilter: "blur(12px)",
};

const panel = {
  position: "relative",
  width: "min(92vw, 440px)",
  padding: "34px 28px 28px",
  boxSizing: "border-box",
  borderRadius: "28px",
  border: "1px solid rgba(215,181,109,0.5)",
  background:
    "linear-gradient(160deg, rgba(25,18,10,0.99), rgba(8,8,8,0.99) 48%)",
  boxShadow: "0 40px 120px rgba(0,0,0,0.82)",
  color: "#fff",
  textAlign: "center",
  fontFamily: "Arial, sans-serif",
};

const closeButton = {
  position: "absolute",
  top: "14px",
  right: "16px",
  width: "40px",
  height: "40px",
  borderRadius: "999px",
  border: "1px solid rgba(215,181,109,0.4)",
  background: "rgba(255,255,255,0.05)",
  color: "#f2c879",
  fontSize: "26px",
  cursor: "pointer",
};

const eyebrow = {
  color: "#d7b56d",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.22em",
};

const title = {
  margin: "12px 0 8px",
  fontSize: "32px",
};

const subtitle = {
  margin: "0 auto",
  maxWidth: "320px",
  color: "#bdb3a4",
  fontSize: "14px",
  lineHeight: 1.6,
};

const avatarPreview = {
  width: "140px",
  height: "140px",
  margin: "26px auto 22px",
  borderRadius: "50%",
  overflow: "hidden",
  border: "2px solid rgba(215,181,109,0.72)",
  background: "#111",
};

const avatarImage = {
  width: "100%",
  height: "100%",
  display: "block",
  objectFit: "cover",
};

const uploadLabel = {
  display: "block",
  width: "100%",
  padding: "14px 18px",
  boxSizing: "border-box",
  borderRadius: "999px",
  border: "1px solid rgba(215,181,109,0.38)",
  background: "rgba(255,255,255,0.05)",
  color: "#f2c879",
  cursor: "pointer",
  fontWeight: 800,
};

const hiddenInput = {
  display: "none",
};

const helperText = {
  marginTop: "10px",
  color: "#8f867a",
  fontSize: "12px",
};

const selectedFileName = {
  marginTop: "12px",
  color: "#d8cdbd",
  fontSize: "12px",
  overflowWrap: "anywhere",
};

const errorText = {
  marginTop: "14px",
  padding: "10px 12px",
  borderRadius: "12px",
  background: "rgba(255,80,80,0.08)",
  border: "1px solid rgba(255,120,120,0.28)",
  color: "#ffb5b5",
  fontSize: "13px",
};

const saveButton = {
  width: "100%",
  marginTop: "20px",
  padding: "14px 18px",
  border: "none",
  borderRadius: "999px",
  background: "#d7b56d",
  color: "#111",
  fontWeight: 900,
};

const museumLogoButton = {
  width: "100%",
  marginTop: "10px",
  padding: "13px 18px",
  borderRadius: "999px",
  border: "1px solid rgba(215,181,109,0.34)",
  background: "transparent",
  color: "#f2c879",
  cursor: "pointer",
  fontWeight: 800,
};
