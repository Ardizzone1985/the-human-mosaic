import { Text } from "@react-three/drei";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient.js";

export default function GalleryPhotoGrid3D({
  room = "Identity",
  wall = "Front",
  sectionNumber,
  viewNumber,
}) {
  const SLOTS_PER_VIEW = 120;

  const [submissions, setSubmissions] = useState([]);

useEffect(() => {
  let cancelled = false;

  async function loadSubmissions() {
    const wallName =
      wall === "Front"
        ? "Front Wall"
        : wall === "Left"
        ? "Left Wall"
        : wall === "Right"
        ? "Right Wall"
        : wall;

    const { data, error } = await supabase
      .from("submissions")
      .select(
        "id, submission_id, room, wall, spot, slot_code, image_url, image_file_name, section_number, view_number, approval_status"
      )
      .eq("room", room)
      .eq("wall", wallName)
      .eq("section_number", sectionNumber)
      .eq("view_number", viewNumber)
      .eq("approval_status", "approved");

    if (error) {
      console.error("Gallery V2 submissions error:", error);
      return;
    }

    if (!cancelled) {
      setSubmissions(data ?? []);
      console.log("Gallery V2 submissions:", data ?? []);
    }
  }

  loadSubmissions();

  return () => {
    cancelled = true;
  };
}, [room, wall, sectionNumber, viewNumber]);

  return (
  <group>
      {Array.from({ length: 4 }).map((_, row) =>
  Array.from({ length: 10 }).map((_, column) => {
          const x = -11.25 + column * 2.5;
          const y = 4.2 - row * 2.0;

          const wallOffset =
  wall === "Left"
    ? 40
    : wall === "Right"
    ? 80
    : 0;

const slotNumber =
  (sectionNumber - 1) * 600 +
  (viewNumber - 1) * SLOTS_PER_VIEW +
  wallOffset +
  row * 10 +
  column +
  1;

          return (
            <group
              key={`${row}-${column}`}
              position={[x, y, 0]}
            >
              <mesh>
                <planeGeometry args={[1.3, 1.3]} />
                <meshStandardMaterial
                  color="#f7f5ef"
                  roughness={0.7}
                  metalness={0.05}
                />
              </mesh>

              <Text
                position={[0, 0, 0.02]}
                fontSize={0.22}
                color="#222222"
                anchorX="center"
                anchorY="middle"
              >
                {slotNumber}
              </Text>
            </group>
          );
        })
      )}
        </group>
  );
}
