import { useEffect, useState } from "react";
import PrototypeWall from "./PrototypeWall";
import { supabase } from "../supabaseClient";
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
  const [f2FirstSlots, setF2FirstSlots] = useState([]);
  const mappedRealSlots = realSlots;
  const firstMappedSlot = mappedRealSlots[0];

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

  async function loadF2FirstSlots() {
  const { data, error } = await supabase
    .from("slots")
    .select("slot_code, row_number, col_number")
    .eq("room", "Identity")
    .eq("wall", "Front Wall")
    .eq("section", "F2")
    .order("row_number", { ascending: true })
    .order("col_number", { ascending: true })
    .limit(2);

  if (error) {
    console.error("Gallery v2 F2 boundary error:", error);
    return;
  }

  setF2FirstSlots(data ?? []);
}

loadF2FirstSlots();
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
  Loaded Identity slots: {realSlots.length} — Mapped: {mappedRealSlots.length}
</p>

      <p>
  Data source type: {sectionLoadType ?? "Loading..."}
</p>
   
        {f2FirstSlots.length > 0 && (
  <p>
    First F2 slots:{" "}
    {f2FirstSlots.map((slot) => slot.slot_code).join(" | ")}
  </p>
)}

      {firstMappedSlot && (
  <p>
    First real slot: <strong>{firstMappedSlot.slot_code}</strong>
    {" → "}
    Gallery position:{" "}
    <strong>{firstMappedSlot.galleryPosition.galleryKey}</strong>
  </p>
)}

      {mappedRealSlots.length > 0 && (
  <p>
    First 10 sequence:{" "}
    {mappedRealSlots
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
  mappedSlots={mappedRealSlots}
/>
    </div>
  );
}
