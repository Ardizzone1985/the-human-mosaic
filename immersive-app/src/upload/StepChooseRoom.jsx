export default function StepChooseRoom({
  rooms,
  selectedRoom,
  onSelectRoom,
}) {
  return (
    <section style={section}>
      <div style={sectionEyebrow}>
        YOUR JOURNEY BEGINS
      </div>

      <h2 style={sectionTitle}>
        Choose Your Room
      </h2>

      <div style={cardGrid}>
        {rooms.map((room) => {
          const selected =
            selectedRoom === room.name;

          return (
            <button
              key={room.name}
              type="button"
              onClick={() =>
                onSelectRoom(room.name)
              }
              style={{
                ...selectionCard,
                borderColor: selected
                  ? room.color
                  : "rgba(215,181,109,0.22)",
                boxShadow: selected
                  ? `0 0 0 1px ${room.color},
                     0 20px 55px rgba(0,0,0,0.35)`
                  : "none",
                transform: selected
                  ? "translateY(-3px)"
                  : "none",
              }}
              aria-pressed={selected}
            >
              <div style={cardIcon}>
                {room.icon}
              </div>

              <div
                style={{
                  ...cardName,
                  color: selected
                    ? room.color
                    : "#ffffff",
                }}
              >
                {room.name}
              </div>

              <div style={cardDescription}>
                {room.description}
              </div>

              <div
                style={{
                  ...selectionBadge,
                  color: selected
                    ? room.color
                    : "#968b7c",
                  borderColor: selected
                    ? room.color
                    : "rgba(255,255,255,0.1)",
                }}
              >
                {selected
                  ? "SELECTED"
                  : "SELECT ROOM"}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

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
  margin: "6px 0 8px",
  color: "#ffffff",
  fontSize: "26px",
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(210px, 1fr))",
  gap: "14px",
};

const selectionCard = {
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

const cardIcon = {
  fontSize: "38px",
};

const cardName = {
  marginTop: "14px",
  fontSize: "23px",
  fontWeight: 900,
};

const cardDescription = {
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
