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

function slotToPosition(slotCode, wall) {
  const parsed = parseSlotCode(slotCode);

  if (!parsed) return { position: [0, 3, -5.45], rotation: [0, 0, 0] };

  const slotSizeX = 0.52;
const slotSizeY = 0.52;
  const col = parsed.col - 1;
  const row = parsed.row - 1;

  if (wall === "Front Wall") {
    return { position: [-8.5 + col * slotSizeX, 6.2 - row * slotSizeY, -5.35], rotation: [0, 0, 0] };
  }

  if (wall === "Left Wall") {
    return { position: [-10.45, 6.2 - row * slotSizeY, -4.8 + col * slotSizeX], rotation: [0, Math.PI / 2, 0] };
  }

  if (wall === "Right Wall") {
    return { position: [10.45, 6.2 - row * slotSizeY, -4.8 + col * slotSizeX], rotation: [0, -Math.PI / 2, 0] };
  }

  return { position: [0, 3, -5.45], rotation: [0, 0, 0] };
}

function LivePhoto({ item }) {
  const { position, rotation } = slotToPosition(item.slot_code, item.wall);

  const imageUrl =
    "https://cqpujmwfiqbwdsmuwkmb.supabase.co/storage/v1/object/public/images/" +
    item.image_file_name;

  const texture = useTexture(imageUrl);

  return (
    <group position={position} rotation={rotation}>
      {/* frame */}
      <mesh position={[0, 0, -0.02]}>
        boxGeometry args={[0.52, 0.52, 0.05]}
        <meshStandardMaterial color="#d7b56d" />
      </mesh>

      {/* photo */}
      <mesh>
        planeGeometry args={[0.46, 0.46]}
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
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

      setPhotos((data || []).filter((item) => item.image_file_name && item.slot_code && item.wall));
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
