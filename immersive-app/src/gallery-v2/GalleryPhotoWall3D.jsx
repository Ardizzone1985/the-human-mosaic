import { useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import GalleryPhotoGrid3D from "./GalleryPhotoGrid3D";

export default function GalleryPhotoWall3D({
  room = "Identity",
  wall = "Front",
  sectionNumber = 1,
  viewNumber = 1,
  onEmptySlotClick,
  onPhotoSelect,
}) {

  const plasterTexture = useTexture(
  "/textures/Plaster001_1K-JPG_Color.jpg"
);

useMemo(() => {
  plasterTexture.wrapS = THREE.RepeatWrapping;
  plasterTexture.wrapT = THREE.RepeatWrapping;
  plasterTexture.repeat.set(4, 2);
  plasterTexture.colorSpace = THREE.SRGBColorSpace;
  plasterTexture.anisotropy = 8;
  plasterTexture.needsUpdate = true;
}, [plasterTexture]);
  
  return (
  <group
  position={
 wall === "Left"
  ? [-15, 3, 5]
  : wall === "Right"
  ? [15, 3, 5]
  : [0, 3, -10]
}
rotation={
  wall === "Left"
    ? [0, Math.PI / 2, 0]
    : wall === "Right"
    ? [0, -Math.PI / 2, 0]
    : [0, 0, 0]
}
>
      <mesh>
  <planeGeometry args={[30, 10]} />
        <meshStandardMaterial
  map={wall === "Front" ? plasterTexture : null}
  color={wall === "Front" ? "#ffffff" : "#e8e3d8"}
  roughness={0.85}
  metalness={0.0}
/>
      </mesh>

      <group position={[0, -2, 0.05]}>
  <GalleryPhotoGrid3D
  room={room}
  wall={wall}
  sectionNumber={sectionNumber}
  viewNumber={viewNumber}
  onEmptySlotClick={onEmptySlotClick}
  onPhotoSelect={onPhotoSelect}
/>
</group>
    </group>
  );
}
