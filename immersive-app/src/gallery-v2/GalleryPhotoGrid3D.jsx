import { Text, useTexture } from "@react-three/drei";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient.js";
import AppDialog from "../components/AppDialog.jsx";

function GallerySlotPhoto({ imageUrl }) {
  const texture = useTexture(imageUrl);

  return (
    <mesh position={[0, 0, 0.015]}>
      <planeGeometry args={[1.3, 1.3]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

export default function GalleryPhotoGrid3D({
  room = "Identity",
  wall = "Front",
  sectionNumber,
  viewNumber,
  onEmptySlotClick,
  onPhotoSelect,
}) {
  
  const SLOTS_PER_VIEW = 120;

  const [submissions, setSubmissions] = useState([]);
const [slots, setSlots] = useState([]);
const [selectedSlot, setSelectedSlot] = useState(null);

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
  "id, submission_id, room, wall, spot, slot_code, image_url, image_file_name, country, note, likes_count, views_count, comments_count, section_number, view_number, approval_status"
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
  <>
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

    const expectedSlotCode =
  `${room}-S${sectionNumber}-V${viewNumber}-${wall.charAt(0)}-R${row + 1}-C${column + 1}`;

const submission = submissions.find(
  (item) => item.slot_code === expectedSlotCode
);

          return (
      <group
  key={`${row}-${column}`}
  position={[x, y, 0]}
  onClick={(event) => {
    event.stopPropagation();

    if (submission) {
  onPhotoSelect?.(submission);
  return;
}

const slotData = {
  room,
  wall,
  sectionNumber,
  viewNumber,
  row: row + 1,
  column: column + 1,
  slotNumber,
  slotCode: expectedSlotCode,
};

setSelectedSlot(slotData);
onEmptySlotClick?.(slotData);
    
console.log("Gallery V2 empty slot selected:", slotData);
  }}
>
              <mesh>
                <planeGeometry args={[1.3, 1.3]} />
                <meshStandardMaterial
                  color={
  selectedSlot?.slotCode === expectedSlotCode
    ? "#d6bd78"
    : "#f7f5ef"
}
                  roughness={0.7}
                  metalness={0.05}
                />
              </mesh>

              {submission ? (
  <GallerySlotPhoto
    imageUrl={
      submission.image_url ||
      `https://cqpujmwfiqbwdsmuwkmb.supabase.co/storage/v1/object/public/images/${submission.image_file_name}`
    }
  />
) : (
  <Text
    position={[0, 0, 0.02]}
    fontSize={0.22}
    color="#222222"
    anchorX="center"
    anchorY="middle"
  >
    {slotNumber}
  </Text>
)}
            </group>
          );
        })
      )}   
        </group>
</>
  );
}
