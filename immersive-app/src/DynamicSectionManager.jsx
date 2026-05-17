import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";
import SectionGrid from "./SectionGrid.jsx";

function normalizeWall(wall) {
  const clean = (wall || "").trim().toLowerCase();

  if (clean === "front wall") return "front";
  if (clean === "left wall") return "left";
  if (clean === "right wall") return "right";

  return "front";
}

function sortSections(a, b) {
  const letterA = a.section?.charAt(0) || "";
  const letterB = b.section?.charAt(0) || "";
  const numberA = Number((a.section || "").replace(/\D/g, "")) || 0;
  const numberB = Number((b.section || "").replace(/\D/g, "")) || 0;

  if (letterA !== letterB) return letterA.localeCompare(letterB);
  return numberA - numberB;
}

export default function DynamicSectionManager() {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    async function loadSections() {
      const { data, error } = await supabase
        .from("slots")
        .select("room, wall, section")
        .eq("room", "Identity");

      if (error) {
        console.error("Error loading sections:", error);
        return;
      }

      const unique = [];

      (data || []).forEach((slot) => {
        const key = `${slot.wall}-${slot.section}`;

        if (!unique.some((item) => item.key === key)) {
          unique.push({
            key,
            wall: normalizeWall(slot.wall),
            section: slot.section
          });
        }
      });

      setSections(unique.sort(sortSections));
    }

    loadSections();
  }, []);

  const grouped = {
    front: sections.filter((s) => s.wall === "front"),
    left: sections.filter((s) => s.wall === "left"),
    right: sections.filter((s) => s.wall === "right")
  };

  return (
    <>
      {grouped.front.map((item, index) => (
        <SectionGrid
          key={item.key}
          wall="front"
          section={item.section}
          index={index}
        />
      ))}

      {grouped.left.map((item, index) => (
        <SectionGrid
          key={item.key}
          wall="left"
          section={item.section}
          index={index}
        />
      ))}

      {grouped.right.map((item, index) => (
        <SectionGrid
          key={item.key}
          wall="right"
          section={item.section}
          index={index}
        />
      ))}
    </>
  );
}
