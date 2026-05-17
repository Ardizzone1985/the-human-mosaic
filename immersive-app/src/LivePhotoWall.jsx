import { useEffect, useState } from "react";
import { useTexture } from "@react-three/drei";
import { supabase } from "./supabaseClient.js";

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
  const localY = 1.15 - row * 0.22;

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

function LivePhoto({ item }) {
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
      <group position={localPosition}>
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

  return (
    <>
      {photos.map((item) => (
        <LivePhoto key={item.id || item.submission_id} item={item} />
      ))}
    </>
  );
}
