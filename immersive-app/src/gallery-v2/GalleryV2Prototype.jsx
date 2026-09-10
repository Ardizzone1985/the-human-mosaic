import { useEffect, useState } from "react";
import PrototypeWall from "./PrototypeWall";
import {
  getLegacyIdentitySection,
} from "./slotMapping";
import { loadIdentityGallerySection } from "./galleryDataSource";

const MAX_SECTIONS = 1667;
const SLOTS_PER_SECTION = 600;
const TARGET_CAPACITY = 1000000;

export default function GalleryV2Prototype() {
  const [activeSection, setActiveSection] = useState(1);
  const activeLegacySection = getLegacyIdentitySection(activeSection);

  const [realSlots, setRealSlots] = useState([]);
  const [sectionLoadType, setSectionLoadType] = useState(null);    
  const firstMappedSlot = realSlots[0];

useEffect(() => {
  async function loadSlots() {
  try {
    const result = await loadIdentityGallerySection(activeSection);

    setSectionLoadType(result.type);
    setRealSlots(result.slots);
  } catch (error) {
    console.error("Gallery v2 slot load error:", error);
    setRealSlots([]);
  }
}

  loadSlots();

}, [activeSection]);

  return (
    <div
  style={{
    minHeight: "100vh",
    overflowY: "auto",
height: "100vh",
    background: "#111",
    color: "#fff",
    padding: "24px",
    boxSizing: "border-box",
  }}
>
      <h1>Gallery v2 Prototype</h1>
      <p>Isolated development environment.</p>
      
      <p>
  Loaded Identity slots: {realSlots.length}
</p>

      <p>
  Data source type: {sectionLoadType ?? "Loading..."}
</p>
         
      {firstMappedSlot && (
  <p>
    First real slot: <strong>{firstMappedSlot.slot_code}</strong>
    {" → "}
    Gallery position:{" "}
    <strong>{firstMappedSlot.galleryPosition.galleryKey}</strong>
  </p>
)}

      {firstMappedSlot && (
  <p>
    First slot status:{" "}
    <strong>{firstMappedSlot.status ?? "none"}</strong>
    {" — "}
    Submission ID:{" "}
    <strong>{firstMappedSlot.submission_id ?? "none"}</strong>
  </p>
)}

      {realSlots.length > 0 && (
  <p>
    First 10 sequence:{" "}
    {realSlots
      .slice(0, 10)
      .map((slot) => slot.slot_code)
      .join(" | ")}
  </p>
)}
      
      <p>
  Section {activeSection} of {MAX_SECTIONS} — Total Room Capacity:{" "}
  {TARGET_CAPACITY.toLocaleString()} slots
</p>

      <p>
  Legacy source:{" "}
  {activeLegacySection
    ? `${activeLegacySection.wall} / ${activeLegacySection.section}`
    : "Expansion area"}
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

      <PrototypeWall
  sectionNumber={activeSection}
  mappedSlots={realSlots}
/>
    </div>
  );
}
