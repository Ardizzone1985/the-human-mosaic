import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";
import { useTexture } from "@react-three/drei";

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

  const localX = -1.35 + col * 0.08;
const localY = 1.25 - row * 0.24;

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
  const [hovered, setHovered] = useState(false);

  const imageUrl =
    "https://cqpujmwfiqbwdsmuwkmb.supabase.co/storage/v1/object/public/images/" +
    item.image_file_name;

  const texture = useTexture(imageUrl);

  const size = 0.32;
  const frameThickness = 0.02;
  const half = size / 2;

  return (
    <group position={basePosition} rotation={rotation}>
      <group
  position={localPosition}
  scale={hovered ? 1.34 : 1}
  onPointerOver={(e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  }}
  onPointerOut={(e) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "default";
  }}
  onClick={(e) => {
    e.stopPropagation();
    onSelect(item);
  }}
>

        <pointLight
  position={[0, 0, 0.12]}
  intensity={hovered ? 0.65 : 0.18}
  distance={1.2}
  color={hovered ? "#ffd98a" : "#d7b56d"}
/>
        
        <mesh position={[0, 0, 0.04]}>
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial
  map={texture}
  emissive={"#ffffff"}
  emissiveIntensity={hovered ? 0.9 : 0.28}
  toneMapped={false}
/>
        </mesh>

        <mesh position={[0, half + frameThickness / 2, 0.035]}>
          <boxGeometry args={[size + frameThickness * 2, frameThickness, 0.025]} />
          <meshStandardMaterial color={hovered ? "#ffd98a" : "#d7b56d"} />
        </mesh>

        <mesh position={[0, -half - frameThickness / 2, 0.035]}>
          <boxGeometry args={[size + frameThickness * 2, frameThickness, 0.025]} />
          <meshStandardMaterial color={hovered ? "#ffd98a" : "#d7b56d"} />
        </mesh>

        <mesh position={[-half - frameThickness / 2, 0, 0.035]}>
          <boxGeometry args={[frameThickness, size + frameThickness * 2, 0.025]} />
          <meshStandardMaterial color={hovered ? "#ffd98a" : "#d7b56d"} />
        </mesh>

        <mesh position={[half + frameThickness / 2, 0, 0.035]}>
          <boxGeometry args={[frameThickness, size + frameThickness * 2, 0.025]} />
          <meshStandardMaterial color={hovered ? "#ffd98a" : "#d7b56d"} />
        </mesh>
      </group>
    </group>
  );
}

export default function LivePhotoWall({ room = "Identity", onPhotoSelect }) {
  const [photos, setPhotos] = useState([]);
 
  useEffect(() => {
    async function loadPhotos() {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("room", room)
        .eq("approval_status", "approved")
        .limit(200);

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      console.log("PHOTOS FROM SUPABASE:", data);

setPhotos(data || []);
    }

    loadPhotos();
  }, [room]);
  
  return (
  <>
        {photos.map((item) => (
      <LivePhoto
        key={item.id || item.submission_id}
        item={item}
        onSelect={onPhotoSelect}
      />
    ))}
        
  </>
);
}
