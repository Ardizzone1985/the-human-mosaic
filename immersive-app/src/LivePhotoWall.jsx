import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";
import { Html, useTexture } from "@react-three/drei";

function parseSlotCode(slotCode) {
  if (!slotCode) return null;

  const rowMatch = slotCode.match(/R(\d+)/i);
  const colMatch = slotCode.match(/C(\d+)/i);

  if (!rowMatch || !colMatch) return null;

  return {
    row: Number(rowMatch[1]),
    col: Number(colMatch[1])
  };
}

function normalizeWall(wall) {
  const clean = (wall || "").trim().toLowerCase();

  if (clean === "front wall") return "front";
  if (clean === "left wall") return "left";
  if (clean === "right wall") return "right";

  return "front";
}

function getSectionIndex(section) {
  const number = Number((section || "").replace(/\D/g, "")) || 1;
  return number - 1;
}

function slotToTransform(item) {
  const wall = normalizeWall(item.wall);
  const parsed = parseSlotCode(item.slot_code);

  const row = Number(item.row_number || parsed?.row || 1) - 1;
  const col = Number(item.column_number || item.col_number || parsed?.col || 1) - 1;
  const sectionIndex = getSectionIndex(item.section);

  const sectionGap = 3.4;

  const localX = -1.35 + col * 0.05;
  const localY = 1.0 - row * 0.22;

  if (wall === "front") {
    return {
      basePosition: [-7.2 + sectionIndex * sectionGap, 3.2, -9.55],
      rotation: [0, 0, 0],
      localPosition: [localX, localY, 0.12]
    };
  }

  if (wall === "left") {
    return {
      basePosition: [-10.55, 3.2, -5.8 + sectionIndex * sectionGap],
      rotation: [0, Math.PI / 2, 0],
      localPosition: [localX, localY, 0.12]
    };
  }

  if (wall === "right") {
    return {
      basePosition: [10.55, 3.2, -5.8 + sectionIndex * sectionGap],
      rotation: [0, -Math.PI / 2, 0],
      localPosition: [localX, localY, 0.12]
    };
  }

  return {
    basePosition: [0, 3.2, -9.55],
    rotation: [0, 0, 0],
    localPosition: [localX, localY, 0.12]
  };
}

function LivePhoto({ item, onSelect }) {
  const { basePosition, rotation, localPosition } = slotToTransform(item);

  const imageUrl =
    "https://cqpujmwfiqbwdsmuwkmb.supabase.co/storage/v1/object/public/images/" +
    item.image_file_name;

  const texture = useTexture(imageUrl);

  const size = 0.16;
  const frameThickness = 0.02;
  const half = size / 2;

  return (
    <group position={basePosition} rotation={rotation}>
      <group position={localPosition} onClick={(e) => {
  e.stopPropagation();
  onSelect(item);
}}>
        <mesh position={[0, 0, 0.04]}>
          <planeGeometry args={[size, size]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>

        <mesh position={[0, half + frameThickness / 2, 0.035]}>
          <boxGeometry args={[size + frameThickness * 2, frameThickness, 0.025]} />
          <meshStandardMaterial color="#d7b56d" />
        </mesh>

        <mesh position={[0, -half - frameThickness / 2, 0.035]}>
          <boxGeometry args={[size + frameThickness * 2, frameThickness, 0.025]} />
          <meshStandardMaterial color="#d7b56d" />
        </mesh>

        <mesh position={[-half - frameThickness / 2, 0, 0.035]}>
          <boxGeometry args={[frameThickness, size + frameThickness * 2, 0.025]} />
          <meshStandardMaterial color="#d7b56d" />
        </mesh>

        <mesh position={[half + frameThickness / 2, 0, 0.035]}>
          <boxGeometry args={[frameThickness, size + frameThickness * 2, 0.025]} />
          <meshStandardMaterial color="#d7b56d" />
        </mesh>
      </group>
    </group>
  );
}

export default function LivePhotoWall() {
  const [photos, setPhotos] = useState([]);

const [selectedPhoto, setSelectedPhoto] = useState(null);
  
  useEffect(() => {
    async function loadPhotos() {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("room", "Identity")
        .eq("approval_status", "approved")
        .limit(200);

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      setPhotos(
        (data || []).filter(
          (item) =>
            item.image_file_name &&
            item.slot_code &&
            item.wall &&
            item.section
        )
      );
    }

    loadPhotos();
  }, []);

const selectedNote =
  selectedPhoto?.note ||
  selectedPhoto?.notes ||
  selectedPhoto?.optional_note ||
  "No note added.";

const selectedCountry =
  selectedPhoto?.country || "Country not available.";
  
  return (
  <>
    {photos.map((item) => (
      <LivePhoto
        key={item.id || item.submission_id}
        item={item}
        onSelect={setSelectedPhoto}
      />
    ))}

    {selectedPhoto && (
      <Html center>
        <div
          style={{
            width: "320px",
            padding: "22px",
            borderRadius: "18px",
            background: "rgba(12, 6, 3, 0.92)",
            border: "1px solid rgba(215,181,109,0.55)",
            color: "#fff",
            boxShadow: "0 20px 60px rgba(0,0,0,0.55)",
            fontFamily: "Arial, sans-serif"
          }}
        >
          <div style={{ color: "#d7b56d", fontSize: "12px", letterSpacing: "0.12em" }}>
            COUNTRY
          </div>

          <div style={{ fontSize: "20px", fontWeight: "700", margin: "6px 0 18px" }}>
            {selectedCountry}
          </div>

          <div style={{ color: "#d7b56d", fontSize: "12px", letterSpacing: "0.12em" }}>
            NOTE
          </div>

          <div style={{ fontSize: "15px", lineHeight: "1.5", marginTop: "8px", color: "#e8ded0" }}>
            {selectedNote}
          </div>

          <button
            onClick={() => setSelectedPhoto(null)}
            style={{
              marginTop: "22px",
              width: "100%",
              padding: "12px",
              borderRadius: "999px",
              border: "none",
              background: "#d7b56d",
              color: "#1b0d05",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            Close
          </button>
        </div>
      </Html>
    )}
  </>
);
}
