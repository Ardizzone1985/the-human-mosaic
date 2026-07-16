export default function StepChooseWall({
  room,
  walls,
  selectedWall,
  onSelectWall,
}) {
  return (
    <section style={section}>
      <div style={sectionEyebrow}>
        {room.toUpperCase()} ROOM
      </div>

      <h2 style={sectionTitle}>
        Choose Your Wall
      </h2>

      <div style={sectionSubtitle}>
        Choose where your memory will be exhibited inside the {room} Room.
      </div>

      <div style={cardGrid}>
        {walls.map((wall) => {
          const selected =
            selectedWall === wall.name;

          return (
            <button
              key={wall.name}
              type="button"
              onClick={() =>
                onSelectWall(wall.name)
              }
              style={{
                ...selectionCard,
                borderColor: selected
                  ? "#9fc2ff"
                  : "rgba(215,181,109,0.22)",
                boxShadow: selected
                  ? "0 0 0 1px #9fc2ff, 0 20px 55px rgba(0,0,0,.35)"
                  : "none",
                transform: selected
                  ? "translateY(-3px)"
                  : "none",
              }}
            >
              <div style={cardIcon}>
                {wall.icon}
              </div>

              <div
                style={{
                  ...cardName,
                  color: selected
                    ? "#9fc2ff"
                    : "#fff",
                }}
              >
                {wall.name}
              </div>

              <div style={cardDescription}>
                {wall.description}
              </div>

              <div
                style={{
                  ...selectionBadge,
                  color: selected
                    ? "#9fc2ff"
                    : "#968b7c",
                  borderColor: selected
                    ? "#9fc2ff"
                    : "rgba(255,255,255,.1)",
                }}
              >
                {selected
                  ? "SELECTED"
                  : "SELECT WALL"}
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
  letterSpacing: ".18em",
};

const sectionTitle = {
  margin: "6px 0 8px",
  color: "#fff",
  fontSize: "26px",
};

const sectionSubtitle = {
  color: "#bdb2a2",
  marginBottom: "22px",
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(210px,1fr))",
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
    "linear-gradient(155deg, rgba(255,255,255,.065), rgba(255,255,255,.025))",
  color: "#fff",
  cursor: "pointer",
  font: "inherit",
  textAlign: "center",
  transition:
    "transform .18s,border-color .18s,box-shadow .18s",
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
  letterSpacing: ".12em",
};
