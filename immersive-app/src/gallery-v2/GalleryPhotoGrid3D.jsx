import { Text, useTexture } from "@react-three/drei";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient.js";

function GallerySlotPhoto({ imageUrl }) {
  const texture = useTexture(imageUrl);

  return (
    <mesh position={[0, 0, 0.015]}>
      <planeGeometry args={[1.3, 1.3]} />
      <meshStandardMaterial
  map={texture}
  color="#ffffff"
  roughness={0.9}
  metalness={0}
/>
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

  // Keep fetched records tied to the exact room/section/view/wall.
  // This prevents a previous View from appearing while the next View loads.
  const scope = `${room}|${wall}|${sectionNumber}|${viewNumber}`;
  const [submissionResult, setSubmissionResult] = useState({ scope: null, data: [] });
  const [slotResult, setSlotResult] = useState({ scope: null, data: [], error: null });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const submissions = submissionResult.scope === scope ? submissionResult.data : [];
  const slots = slotResult.scope === scope ? slotResult.data : [];
  const slotsLoaded = slotResult.scope === scope;
  const slotsError = slotsLoaded ? slotResult.error : null;
  const slotLookup = new Map(slots.map((slot) => [slot.slot_code, slot]));
  const submissionLookup = new Map(submissions.map((item) => [item.slot_code, item]));

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

    const { data, error } = await supabase.rpc(
  "get_gallery_view_photos",
  {
    p_room: room,
    p_wall: wallName,
    p_section_number: sectionNumber,
    p_view_number: viewNumber,
  }
);

    if (error) {
      console.error("Gallery V2 submissions error:", error);
      if (!cancelled) setSubmissionResult({ scope, data: [] });
      return;
    }

    if (!cancelled) {
  const photos = data ?? [];

  const submissionIds = photos
    .map((photo) => photo.submission_id)
    .filter(Boolean);

  let nicknamesBySubmissionId = new Map();

  if (submissionIds.length > 0) {
    const { data: participants, error: participantsError } =
      await supabase.rpc("get_gallery_photo_participants", {
        p_submission_ids: submissionIds,
      });

    if (cancelled) return;

    if (participantsError) {
      console.error(
        "Gallery V2 participants error:",
        participantsError
      );
    } else {
      nicknamesBySubmissionId = new Map(
        (participants ?? []).map((participant) => [
          participant.submission_id,
          participant.nickname,
        ])
      );
    }
  }

      let ownersBySubmissionId = new Map();

if (submissionIds.length > 0) {
  const { data: owners, error: ownersError } =
    await supabase.rpc("get_gallery_photo_verified_owners", {
      p_submission_ids: submissionIds,
    });

  if (cancelled) return;

  if (ownersError) {
    console.error("Gallery V2 verified owners error:", ownersError);
  } else {
    ownersBySubmissionId = new Map(
      (owners ?? []).map((owner) => [
        owner.submission_id,
        owner.participant_id,
      ])
    );
  }
}

  const photosWithNicknames = photos.map((photo) => ({
  ...photo,
  participant_nickname:
    nicknamesBySubmissionId.get(photo.submission_id) ||
    "Participant not yet linked",
  participant_id:
    ownersBySubmissionId.get(photo.submission_id) || null,
}));

  setSubmissionResult({
    scope,
    data: photosWithNicknames,
  });

  console.log(
    "Gallery V2 submissions with participants:",
    photosWithNicknames
  );
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
      if (!cancelled) setSlotResult({ scope, data: [], error: error.message || "Unable to load slots" });
      return;
    }

    if (!cancelled) {
  setSlotResult({ scope, data: data ?? [], error: null });

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
      {!slotsLoaded || slotsError || slots.length === 0 ? (
        <group position={[0, 1.2, 0.1]}>
          <Text fontSize={0.48} color="#765b33" anchorX="center" anchorY="middle" maxWidth={22} textAlign="center">
            {!slotsLoaded ? "Loading gallery view..." : slotsError ? "Gallery temporarily unavailable" : "This gallery view is not yet open"}
          </Text>
          <Text position={[0, -0.75, 0]} fontSize={0.25} color="#8c806d" anchorX="center" anchorY="middle" maxWidth={22} textAlign="center">
            {slotsError ? "Please try again later" : slotsLoaded && slots.length === 0 ? "New positions will appear when this view is activated" : ""}
          </Text>
        </group>
      ) : Array.from({ length: 4 }).map((_, row) =>
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

const submission = submissionLookup.get(expectedSlotCode);
const slot = slotLookup.get(expectedSlotCode);
const isMissing = !slot;
const isUnavailable = isMissing || slot.status !== "available";

          return (
      <group
  key={`${row}-${column}`}
  position={[x, y, 0]}
  onClick={(event) => {
    event.stopPropagation();

    if (submission && slot) {
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
    : isMissing
    ? "#dedbd4"
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
    {isMissing ? "—" : slotNumber}
  </Text>

  {isUnavailable && (
    <Text
      position={[0, -0.18, 0.02]}
      fontSize={0.17}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
    >
      {isMissing ? "NOT OPEN" : slot?.status === "reserved" ? "RESERVED" : "BOOKED"}
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
