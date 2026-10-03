import { Text } from "@react-three/drei";
import GalleryPhotoWall3D from "./GalleryPhotoWall3D";

export default function GalleryWall3D({
  room = "Identity",
  sectionNumber = 1,
  viewNumber,
  setViewNumber,
  onEmptySlotClick,
}) {
  const SLOTS_PER_VIEW = 40;
  const MAX_VIEW = sectionNumber === 1667 ? 4 : 5;
  return (
  <>
    
    <GalleryPhotoWall3D
  room={room}
  wall="Front"
  sectionNumber={sectionNumber}
  viewNumber={viewNumber}
  onEmptySlotClick={onEmptySlotClick}
/>

    <GalleryPhotoWall3D
  room={room}
  wall="Left"
  sectionNumber={sectionNumber}
  viewNumber={viewNumber}
  onEmptySlotClick={onEmptySlotClick}
/>

    <GalleryPhotoWall3D
  room={room}
  wall="Right"
  sectionNumber={sectionNumber}
  viewNumber={viewNumber}
  onEmptySlotClick={onEmptySlotClick}
/>
  </>
);
}
