import { useState } from "react";
import PrototypeWall from "./PrototypeWall";

const MAX_SECTIONS = 1667;
const SLOTS_PER_SECTION = 600;
const TARGET_CAPACITY = 1000000;

export default function GalleryV2Prototype() {
  const [activeSection, setActiveSection] = useState(1);

  return (
    <div
  style={{
    minHeight: "100vh",
    background: "#111",
    color: "#fff",
    padding: "24px",
    boxSizing: "border-box",
  }}
>
      <h1>Gallery v2 Prototype</h1>
      <p>Isolated development environment.</p>
      <p>
  Section {activeSection} of {MAX_SECTIONS} — Total Room Capacity:{" "}
  {TARGET_CAPACITY.toLocaleString()} slots
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

        <button onClick={() => setActiveSection(MAX_SECTIONS)}>
  Last Section
</button>
      </div>

      <PrototypeWall sectionNumber={activeSection} />
    </div>
  );
}
