import { useEffect, useState } from "react";
import PrototypeWall from "./PrototypeWall";
import { supabase } from "../supabaseClient";
import { mapSlotsToGallery } from "./slotMapping";

const MAX_SECTIONS = 1667;
const SLOTS_PER_SECTION = 600;
const TARGET_CAPACITY = 1000000;

export default function GalleryV2Prototype() {
  const [activeSection, setActiveSection] = useState(1);

  const [realSlots, setRealSlots] = useState([]);
  const [f1SlotCount, setF1SlotCount] = useState(null);
  const [f2SlotCount, setF2SlotCount] = useState(null);
  const [f10SlotCount, setF10SlotCount] = useState(null);
  const [identitySlotCount, setIdentitySlotCount] = useState(null);
  const [f2FirstSlots, setF2FirstSlots] = useState([]);
  const mappedRealSlots = mapSlotsToGallery(realSlots);
  const firstMappedSlot = mappedRealSlots[0];

useEffect(() => {
  async function loadSlots() {
    const { data, error } = await supabase
      .from("slots")
      .select(
        "slot_code, room, wall, section, row_number, col_number"
      )
      .eq("room", "Identity")
.order("wall", { ascending: true })
.order("section", { ascending: true })
.order("row_number", { ascending: true })
.order("col_number", { ascending: true })
.limit(12);

    if (error) {
      console.error("Gallery v2 slot load error:", error);
      return;
    }

    setRealSlots(data ?? []);
  }

  loadSlots();

  async function countF1Slots() {
  const { count, error } = await supabase
    .from("slots")
    .select("*", { count: "exact", head: true })
    .eq("room", "Identity")
    .eq("wall", "Front Wall")
    .eq("section", "F1");

  if (error) {
    console.error("Gallery v2 F1 count error:", error);
    return;
  }

  setF1SlotCount(count);
}

countF1Slots();

  async function countF2Slots() {
  const { count, error } = await supabase
    .from("slots")
    .select("*", { count: "exact", head: true })
    .eq("room", "Identity")
    .eq("wall", "Front Wall")
    .eq("section", "F2");

  if (error) {
    console.error("Gallery v2 F2 count error:", error);
    return;
  }

  setF2SlotCount(count);
}

countF2Slots();

  async function countF10Slots() {
  const { count, error } = await supabase
    .from("slots")
    .select("*", { count: "exact", head: true })
    .eq("room", "Identity")
    .eq("wall", "Front Wall")
    .eq("section", "F10");

  if (error) {
    console.error("Gallery v2 F10 count error:", error);
    return;
  }

  setF10SlotCount(count);
}

countF10Slots();

  async function countIdentitySlots() {
  const { count, error } = await supabase
    .from("slots")
    .select("*", { count: "exact", head: true })
    .eq("room", "Identity");

  if (error) {
    console.error("Gallery v2 Identity count error:", error);
    return;
  }

  setIdentitySlotCount(count);
}

countIdentitySlots();

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
}, []);

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
  Identity / Front Wall / F1 slots:{" "}
  {f1SlotCount === null ? "Loading..." : f1SlotCount}
</p>

      <p>
  Identity / Front Wall / F2 slots:{" "}
  {f2SlotCount === null ? "Loading..." : f2SlotCount}
</p>

      <p>
  Identity / Front Wall / F10 slots:{" "}
  {f10SlotCount === null ? "Loading..." : f10SlotCount}
</p>

      <p>
  Total Identity slots:{" "}
  {identitySlotCount === null ? "Loading..." : identitySlotCount}
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
    {mappedRealSlots.map((slot) => slot.slot_code).join(" | ")}
  </p>
)}
      
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
