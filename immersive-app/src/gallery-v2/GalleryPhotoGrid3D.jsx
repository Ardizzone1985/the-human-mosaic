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

  useEffect(() => {
  let cancelled = false;

  async function loadSlots() {
    const wallName =
      wall === "Front" ? "Front Wall" :
      wall === "Left" ? "Left Wall" :
      wall === "Right" ? "Right Wall" :
      wall;

    const { data, error } = await supabase
      .from("slots")
      .select("slot_code, status")
      .eq("room", room)
      .eq("wall", wallName)
      .eq("section_number", sectionNumber)
      .eq("view_number", viewNumber);

    if (error) {
      console.error("Gallery V2 slots error:", error);
      return;
    }

    if (!cancelled) {
  setSlots(data ?? []);

  console.log("Gallery V2 slots loaded:", {
    room,
    wall: wallName,
    sectionNumber,
    viewNumber,
    count: data?.length ?? 0,
    tobySlot: data?.find(
      (slot) => slot.slot_code === "Creativity-S1-V1-R-R1-C5"
    )
  });
}
  }

  loadSlots();

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

    const slot = slots.find(
  (item) => item.slot_code === expectedSlotCode
);

const isUnavailable = !slot || slot.status !== "available";

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

    if (isUnavailable) {
  console.log(
    "Gallery V2 position unavailable:",
    expectedSlotCode,
    slot?.status ?? "not found"
  );
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
  submission
    ? "#f7f5ef"
    : isUnavailable
    ? "#aaa49a"
    : selectedSlot?.slotCode === expectedSlotCode
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
  <group>
  <Text
    position={[0, isUnavailable ? 0.13 : 0, 0.02]}
    fontSize={0.22}
    color={isUnavailable ? "#ffffff" : "#222222"}
    anchorX="center"
    anchorY="middle"
  >
    {slotNumber}
  </Text>

  {isUnavailable && (
    <Text
      position={[0, -0.18, 0.02]}
      fontSize={0.17}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
    >
      BOOKED
    </Text>
  )}
</group>
)}
            </group>
          );
        })
      )}   
        </group>
</>
  );
}
