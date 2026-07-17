export default function StepChooseSpot({
  room,
  wall,
  sections,
  selectedSection,
  onSelectSection,
  slots,
  loadingSlots,
  slotsError,
  availableSlotsCount,
  unavailableSlotsCount,
  selectedSlotCode,
  accentColor,
  isSlotAvailable,
  onSelectSlot,
}) {
  return (
    <section style={section}>
      <div style={sectionEyebrow}>
        {room?.toUpperCase()} · {wall?.toUpperCase()}
      </div>

      <h2 style={sectionTitle}>
        Choose Your Spot
      </h2>

      <p style={sectionDescription}>
        Select a Section and then choose one real position
        inside the mosaic.
      </p>

      <div style={sectionTabs}>
        {sections.map((sectionName) => {
          const selected =
            selectedSection === sectionName;

          return (
            <button
              key={sectionName}
              type="button"
              onClick={() =>
                onSelectSection(sectionName)
              }
              style={{
                ...sectionTab,
                color: selected
                  ? "#111"
                  : "#cfc4b4",
                background: selected
                  ? accentColor
                  : "rgba(255,255,255,0.04)",
                borderColor: selected
                  ? accentColor
                  : "rgba(215,181,109,0.22)",
              }}
              aria-pressed={selected}
            >
              {sectionName}
            </button>
          );
        })}
      </div>

      <div style={slotPanel}>
        <div style={slotPanelHeader}>
          <div>
            <div style={slotPanelEyebrow}>
              CURRENT SECTION
            </div>

            <div style={slotPanelTitle}>
              {room} · {wall} · {selectedSection}
            </div>
          </div>

          {!loadingSlots && !slotsError && (
            <div style={slotCountBadge}>
              {availableSlotsCount} available ·{" "}
              {unavailableSlotsCount} unavailable
            </div>
          )}
        </div>

        {loadingSlots && (
          <div style={slotMessage}>
            Loading available positions...
          </div>
        )}

        {!loadingSlots && slotsError && (
          <div style={slotErrorMessage}>
            {slotsError}
          </div>
        )}

        {!loadingSlots &&
          !slotsError &&
          slots.length === 0 && (
            <div style={slotMessage}>
              No positions were found in this Section.
            </div>
          )}

        {!loadingSlots &&
          !slotsError &&
          slots.length > 0 && (
            <div style={slotGridScroller}>
              <div style={slotGrid}>
                {slots.map((slot) => {
                  const available =
                    isSlotAvailable(slot);

                  const selected =
                    selectedSlotCode === slot.slot_code;

                  const visibleSpot =
                    `R${slot.row_number}-C${slot.col_number}`;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={!available}
                      title={
                        available
                          ? `Select ${visibleSpot}`
                          : `${visibleSpot} is unavailable`
                      }
                      aria-label={
                        available
                          ? `Select available spot ${visibleSpot}`
                          : `Unavailable spot ${visibleSpot}`
                      }
                      aria-pressed={selected}
                      onClick={() => {
                        if (!available) return;

                        onSelectSlot({
                          slotCode: slot.slot_code,
                          visibleSpot,
                        });
                      }}
                      style={{
                        ...slotButton,
                        borderColor: selected
                          ? accentColor
                          : available
                          ? "rgba(215,181,109,0.36)"
                          : "rgba(255,255,255,0.06)",
                        background: selected
                          ? accentColor
                          : available
                          ? "rgba(255,255,255,0.055)"
                          : "rgba(0,0,0,0.72)",
                        color: selected
                          ? "#111"
                          : available
                          ? "#d8cebf"
                          : "#4d4943",
                        cursor: available
                          ? "pointer"
                          : "not-allowed",
                        boxShadow: selected
                          ? `0 0 0 2px rgba(255,255,255,0.7),
                             0 0 24px ${accentColor}`
                          : "none",
                        transform: selected
                          ? "scale(1.08)"
                          : "none",
                      }}
                    >
                      <span style={slotNumber}>
                        {visibleSpot}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        <div style={slotLegend}>
          <div style={legendItem}>
            <span
              style={{
                ...legendBox,
                background:
                  "rgba(255,255,255,0.055)",
              }}
            />
            Available
          </div>

          <div style={legendItem}>
            <span
              style={{
                ...legendBox,
                background: "rgba(0,0,0,0.72)",
              }}
            />
            Unavailable
          </div>

          <div style={legendItem}>
            <span
              style={{
                ...legendBox,
                background: accentColor,
              }}
            />
            Selected
          </div>
        </div>
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

const sectionDescription = {
  margin: "0 0 18px",
  color: "#a99e8f",
  fontSize: "14px",
  lineHeight: 1.6,
};

const sectionTabs = {
  display: "flex",
  flexWrap: "wrap",
  gap: "9px",
  marginBottom: "18px",
};

const sectionTab = {
  minWidth: "54px",
  padding: "10px 13px",
  borderRadius: "999px",
  border: "1px solid",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 900,
  transition:
    "background 160ms ease, color 160ms ease",
};

const slotPanel = {
  padding: "20px",
  borderRadius: "22px",
  border: "1px solid rgba(215,181,109,0.24)",
  background: "rgba(255,255,255,0.025)",
};

const slotPanelHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "14px",
  marginBottom: "18px",
};

const slotPanelEyebrow = {
  color: "#958a7b",
  fontSize: "10px",
  fontWeight: 900,
  letterSpacing: "0.14em",
};

const slotPanelTitle = {
  marginTop: "6px",
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: 900,
};

const slotCountBadge = {
  padding: "8px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(215,181,109,0.24)",
  background: "rgba(215,181,109,0.07)",
  color: "#cfc3b2",
  fontSize: "11px",
  fontWeight: 800,
};

const slotGridScroller = {
  width: "100%",
  overflowX: "auto",
  padding: "8px 2px 14px",
};

const slotGrid = {
  minWidth: "620px",
  display: "grid",
  gridTemplateColumns:
    "repeat(10, minmax(48px, 1fr))",
  gap: "8px",
};

const slotButton = {
  aspectRatio: "1 / 1",
  minHeight: "48px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px",
  borderRadius: "10px",
  border: "1px solid",
  font: "inherit",
  transition:
    "transform 150ms ease, box-shadow 150ms ease, background 150ms ease",
};

const slotNumber = {
  fontSize: "9px",
  fontWeight: 900,
  lineHeight: 1.15,
  textAlign: "center",
};

const slotMessage = {
  padding: "30px 18px",
  borderRadius: "16px",
  border: "1px dashed rgba(215,181,109,0.25)",
  color: "#a99e8f",
  textAlign: "center",
  fontSize: "13px",
};

const slotErrorMessage = {
  ...slotMessage,
  border: "1px solid rgba(255,130,130,0.34)",
  color: "#ffb2b2",
  background: "rgba(255,90,90,0.055)",
};

const slotLegend = {
  display: "flex",
  flexWrap: "wrap",
  gap: "15px",
  marginTop: "12px",
  color: "#9c9284",
  fontSize: "11px",
};

const legendItem = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
};

const legendBox = {
  width: "13px",
  height: "13px",
  borderRadius: "4px",
  border: "1px solid rgba(215,181,109,0.24)",
};
