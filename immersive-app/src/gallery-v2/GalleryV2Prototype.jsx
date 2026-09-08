import { useEffect, useState } from "react";
import PrototypeWall from "./PrototypeWall";
import { supabase } from "../supabaseClient";

const MAX_SECTIONS = 1667;
const SLOTS_PER_SECTION = 600;
const TARGET_CAPACITY = 1000000;

export default function GalleryV2Prototype() {
  const [activeSection, setActiveSection] = useState(1);

  const [realSlots, setRealSlots] = useState([]);

useEffect(() => {
  async function loadSlots() {
    const { data, error } = await supabase
      .from("slots")
      .select(
        "slot_code, room, wall, section, row_number, col_number"
      )
      .eq("room", "Identity")
      .limit(10);

    if (error) {
      console.error("Gallery v2 slot load error:", error);
      return;
    }

    setRealSlots(data ?? []);
  }

  loadSlots();
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
