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

  const columnsPerSection = 10;
const localCol = col % columnsPerSection;

const localX = -1.05 + localCol * 0.20;
const localY = 1.35 - row * 0.22;

  if (wall === "front") {
    return {
      basePosition: [-7.2 + sectionIndex * sectionGap, 3.2, -9.55],
      rotation: [0, 0, 0],
      localPosition: [localX, localY, 0.18]
    };
  }

  if (wall === "left") {
    return {
      basePosition: [-10.55, 3.2, -5.8 + sectionIndex * sectionGap],
      rotation: [0, Math.PI / 2, 0],
      localPosition: [localX, localY, 0.18]
    };
  }

  if (wall === "right") {
    return {
      basePosition: [10.55, 3.2, -5.8 + sectionIndex * sectionGap],
      rotation: [0, -Math.PI / 2, 0],
      localPosition: [localX, localY, 0.18]
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
    
  const size = 0.38;
  const frameThickness = 0.02;
  const half = size / 2;

  return (
    <group position={basePosition} rotation={rotation}>
      <group
  position={localPosition}
  scale={hovered ? 1.12 : 1}
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

        <mesh position={[0, 0, 0.035]}>
  <planeGeometry args={[size + 0.08, size + 0.08]} />
 <meshStandardMaterial
  color="#d8b36d"
  roughness={0.22}
  metalness={0.55}
  emissive="#d8b36d"
  emissiveIntensity={hovered ? 0.16 : 0.045}
/>
         </mesh> 
                
        <mesh position={[0, 0, 0.05]}>
  <planeGeometry args={[size, size]} />
  <meshStandardMaterial
  map={texture}
  emissive="#ffffff"
  emissiveIntensity={hovered ? 0.07 : 0.025}
  roughness={0.18}
  metalness={0.04}
  toneMapped={false}
/>
</mesh>

{hovered && (
  <mesh position={[0, 0, 0.035]}>
    <planeGeometry args={[size + 0.18, size + 0.18]} />
    <meshBasicMaterial
      color="#ffd98a"
      transparent
      opacity={0.035}
      depthWrite={false}
    />
  </mesh>
)}
        
      </group>
    </group>
  );
}

const photoCacheByRoom = {};
export default function LivePhotoWall({ room = "Identity", onPhotoSelect }) {
  const [photos, setPhotos] = useState(() => photoCacheByRoom[room] || []);
 
  useEffect(() => {
    async function loadPhotos() {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("room", room)
        .eq("approval_status", "approved")
        .limit(50);

      if (error) {
  console.error("Supabase error:", error);
  setPhotos(photoCacheByRoom[room] || []);
  return;
}
     
      if (data && data.length > 0) {
        photoCacheByRoom[room] = data;
        setPhotos(data);
      } else {
        console.warn("No photos returned, using cache", { room });
        setPhotos(photoCacheByRoom[room] || []);
      }
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
