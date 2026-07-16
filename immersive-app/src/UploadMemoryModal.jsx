import { useEffect, useState } from "react";

const ROOMS = [
  {
    name: "Identity",
    icon: "🪞",
    color: "#d7b56d",
    description:
      "Share a memory connected to your identity, culture, roots or personal story.",
  },
  {
    name: "Love",
    icon: "❤️",
    color: "#ff9fbd",
    description:
      "Share a memory about family, friendship, affection, passions or meaningful bonds.",
  },
  {
    name: "Creativity",
    icon: "🎨",
    color: "#9fc3ff",
    description:
      "Share photography, art, drawings, concepts or other forms of human creativity.",
  },
];

export default function UploadMemoryModal({
  open,
  onClose,
}) {
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    if (!open) {
      setSelectedRoom(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      style={overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-memory-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div style={panel}>
        <button
          type="button"
          onClick={onClose}
          style={closeButton}
          aria-label="Close Upload Memory"
        >
          ×
        </button>

        <header style={header}>
          <div style={eyebrow}>THE HUMAN MOSAIC</div>

          <h1 id="upload-memory-title" style={title}>
            Upload a Memory
          </h1>

          <p style={subtitle}>
            Choose the Room where your memory will become part of the
            permanent global artwork.
          </p>
        </header>

        <section style={section}>
          <div style={sectionEyebrow}>STEP 1 OF 4</div>
          <h2 style={sectionTitle}>Choose Your Room</h2>

          <div style={roomGrid}>
            {ROOMS.map((room) => {
              const selected = selectedRoom === room.name;

              return (
                <button
                  key={room.name}
                  type="button"
                  onClick={() => setSelectedRoom(room.name)}
                  style={{
                    ...roomCard,
                    borderColor: selected
                      ? room.color
                      : "rgba(215,181,109,0.22)",
                    boxShadow: selected
                      ? `0 0 0 1px ${room.color}, 0 20px 55px rgba(0,0,0,0.35)`
                      : "none",
                    transform: selected
                      ? "translateY(-3px)"
                      : "none",
                  }}
                  aria-pressed={selected}
                >
                  <div style={roomIcon}>{room.icon}</div>

                  <div
                    style={{
                      ...roomName,
                      color: selected ? room.color : "#ffffff",
                    }}
                  >
                    {room.name}
                  </div>

                  <div style={roomDescription}>
                    {room.description}
                  </div>

                  <div
                    style={{
                      ...selectionBadge,
                      color: selected ? room.color : "#968b7c",
                      borderColor: selected
                        ? room.color
                        : "rgba(255,255,255,0.1)",
                    }}
                  >
                    {selected ? "SELECTED" : "SELECT ROOM"}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section style={summaryCard}>
          <div>
            <div style={summaryLabel}>CURRENT SELECTION</div>
            <div style={summaryValue}>
              {selectedRoom || "No Room selected"}
            </div>
          </div>

          <button
            type="button"
            disabled={!selectedRoom}
            style={{
              ...continueButton,
              opacity: selectedRoom ? 1 : 0.45,
              cursor: selectedRoom ? "pointer" : "not-allowed",
            }}
            onClick={() => {
              console.log("Selected upload room:", selectedRoom);
            }}
          >
            Continue
          </button>
        </section>

        <p style={testNote}>
          Wall, Section and Spot selection will be connected in the next
          step.
        </p>
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
  background: "rgba(0,0,0,0.8)",
  backdropFilter: "blur(14px)",
};

const panel = {
  position: "relative",
  width: "min(930px, 96vw)",
  maxHeight: "92vh",
  overflowY: "auto",
  padding: "38px",
  boxSizing: "border-box",
  borderRadius: "30px",
  border: "1px solid rgba(215,181,109,0.5)",
  background:
    "linear-gradient(155deg, rgba(28,19,10,0.99), rgba(7,7,7,0.99) 50%)",
  boxShadow: "0 40px 130px rgba(0,0,0,0.85)",
  color: "#ffffff",
  fontFamily: "Arial, sans-serif",
};

const closeButton = {
  position: "absolute",
  top: "18px",
  right: "20px",
  width: "42px",
  height: "42px",
  borderRadius: "999px",
  border: "1px solid rgba(215,181,109,0.4)",
  background: "rgba(255,255,255,0.06)",
  color: "#f2c879",
  cursor: "pointer",
  fontSize: "28px",
  lineHeight: 1,
};

const header = {
  padding: "8px 42px 30px",
  textAlign: "center",
};

const eyebrow = {
  color: "#d7b56d",
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "0.24em",
};

const title = {
  margin: "12px 0 10px",
  color: "#ffffff",
  fontSize: "clamp(34px, 6vw, 54px)",
  lineHeight: 1.05,
};

const subtitle = {
  maxWidth: "620px",
  margin: "0 auto",
  color: "#cfc5b5",
  fontSize: "15px",
  lineHeight: 1.65,
};

const section = {
  marginTop: "6px",
};

const sectionEyebrow = {
  color: "#d7b56d",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.18em",
};

const sectionTitle = {
  margin: "6px 0 18px",
  color: "#ffffff",
  fontSize: "26px",
};

const roomGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: "14px",
};

const roomCard = {
  minHeight: "270px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "25px 20px",
  borderRadius: "22px",
  border: "1px solid",
  background:
    "linear-gradient(155deg, rgba(255,255,255,0.065), rgba(255,255,255,0.025))",
  color: "#ffffff",
  cursor: "pointer",
  font: "inherit",
  textAlign: "center",
  transition:
    "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
};

const roomIcon = {
  fontSize: "38px",
};

const roomName = {
  marginTop: "14px",
  fontSize: "23px",
  fontWeight: 900,
};

const roomDescription = {
  minHeight: "72px",
  marginTop: "12px",
  color: "#bdb2a2",
  fontSize: "13px",
  lineHeight: 1.55,
};

const selectionBadge = {
  marginTop: "18px",
  padding: "7px 11px",
  borderRadius: "999px",
  border: "1px solid",
  fontSize: "9px",
  fontWeight: 900,
  letterSpacing: "0.12em",
};

const summaryCard = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "18px",
  marginTop: "24px",
  padding: "18px",
  borderRadius: "20px",
  border: "1px solid rgba(215,181,109,0.26)",
  background: "rgba(215,181,109,0.06)",
};

const summaryLabel = {
  color: "#958a7b",
  fontSize: "10px",
  fontWeight: 900,
  letterSpacing: "0.14em",
};

const summaryValue = {
  marginTop: "6px",
  color: "#f2c879",
  fontSize: "19px",
  fontWeight: 900,
};

const continueButton = {
  minWidth: "145px",
  padding: "13px 20px",
  border: "none",
  borderRadius: "999px",
  background: "#d7b56d",
  color: "#111111",
  fontSize: "13px",
  fontWeight: 900,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

const testNote = {
  margin: "16px 0 0",
  color: "#847a6d",
  fontSize: "12px",
  textAlign: "center",
  lineHeight: 1.5,
};
