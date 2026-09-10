const ROWS = 60;
const COLUMNS = 10;
const TARGET_CAPACITY = 1000000;
const SLOTS_PER_SECTION = ROWS * COLUMNS;

export default function PrototypeWall({
  sectionNumber = 1,
  mappedSlots = [],
}) {
  const sectionStartIndex = (sectionNumber - 1) * SLOTS_PER_SECTION;

  const mappedSlotsForSection = mappedSlots.filter(
  (slot) => slot.galleryPosition?.sectionNumber === sectionNumber
);

const slotsInSection = Math.min(
  SLOTS_PER_SECTION,
  Math.max(0, TARGET_CAPACITY - sectionStartIndex)
);
  const activeRows = Math.ceil(slotsInSection / COLUMNS);
  const slots = Array.from(
  { length: slotsInSection },
  (_, index) => {
    const row = Math.floor(index / COLUMNS) + 1;
    const column = (index % COLUMNS) + 1;

    return {
      index: index + 1,
      row,
      column,
      galleryKey: `S${sectionNumber}-R${row}-C${column}`,
    };
  }
);

  return (
    <div
      style={{
        padding: "24px",
        background: "#111",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <h2 style={{ marginBottom: "8px" }}>
  Gallery v2 — Section {sectionNumber}
</h2>

      <p style={{ marginTop: 0, opacity: 0.75 }}>
        {activeRows} rows × {COLUMNS} columns = {slots.length} slots
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLUMNS}, 48px)`,
          gap: "6px",
          width: "fit-content",
          padding: "16px",
          background: "#e8e3d8",
          border: "2px solid #b89b5e",
        }}
      >
        {slots.map((slot) => {
  const realSlot = mappedSlotsForSection.find(
    (mappedSlot) =>
      mappedSlot.galleryPosition?.row === slot.row &&
      mappedSlot.galleryPosition?.column === slot.column
  );

  return (
    <div
      key={slot.index}
      style={{
        width: "48px",
        height: "48px",
        background: realSlot ? "#f7f5ef" : "#d9d9d9",
        border: realSlot ? "1px solid #b89b5e" : "1px dashed #888",
        color: realSlot ? "#222" : "#555",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "10px",
        boxSizing: "border-box",
        textAlign: "center",
        padding: "2px",
      }}
    >
      {realSlot ? realSlot.slot_code : slot.galleryKey}
    </div>
  );
})}
      </div>
    </div>
  );
}
