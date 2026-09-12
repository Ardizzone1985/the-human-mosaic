import GallerySlot from "./GallerySlot";
import { getSubmissionImageUrl } from "./galleryDataSource";

const ROWS = 60;
const COLUMNS = 10;
const TARGET_CAPACITY = 1000000;
const SLOTS_PER_SECTION = ROWS * COLUMNS;

export default function PrototypeWall({
  sectionNumber = 1,
  mappedSlots = [],  
  sectionSubmissions = [],
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

        const approvedSubmission = realSlot
  ? sectionSubmissions.find(
      (submission) =>
        submission.slot_code === realSlot.slot_code
    )
  : null;

        const approvedImageUrl = approvedSubmission?.image_file_name
  ? getSubmissionImageUrl(approvedSubmission.image_file_name)
  : null;

  return (
    <GallerySlot
  key={slot.index}
  slot={slot}
  realSlot={realSlot}
  imageUrl={approvedImageUrl}
/>     
      );
})}
      </div>
    </div>
  );
}
