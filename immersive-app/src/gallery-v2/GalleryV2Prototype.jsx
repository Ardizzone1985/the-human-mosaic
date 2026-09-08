import { useState } from "react";
import PrototypeWall from "./PrototypeWall";

const MAX_SECTIONS = 1667;
const SLOTS_PER_SECTION = 600;
const TOTAL_CAPACITY = MAX_SECTIONS * SLOTS_PER_SECTION;

export default function GalleryV2Prototype() {
  const [activeSection, setActiveSection] = useState(1);

  return (
    <div>
      <h1>Gallery v2 Prototype</h1>
      <p>Isolated development environment.</p>
      <p>
  Section {activeSection} of {MAX_SECTIONS} — Total Room Capacity:{" "}
  {TOTAL_CAPACITY.toLocaleString()} slots
</p>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() =>
            setActiveSection((current) => Math.max(1, current - 1))
          }
        >
          Previous Section
        </button>

        <button
          onClick={() =>
            setActiveSection((current) =>
  Math.min(MAX_SECTIONS, current + 1)
)
          }
        >
          Next Section
        </button>
      </div>

      <PrototypeWall sectionNumber={activeSection} />
    </div>
  );
}
