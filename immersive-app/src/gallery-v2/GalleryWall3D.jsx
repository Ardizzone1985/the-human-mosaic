import { Text } from "@react-three/drei";
import GalleryPhotoWall3D from "./GalleryPhotoWall3D";

export default function GalleryWall3D({
  sectionNumber = 1,
  viewNumber,
  setViewNumber,
}) {
  const SLOTS_PER_VIEW = 40;
  const MAX_VIEW = sectionNumber === 1667 ? 4 : 5;
  return (
  <>
   
       <mesh
  position={[-2, -1.8, -3.88]}
  onClick={() =>
    setViewNumber((current) => Math.max(1, current - 1))
  }
>
  <planeGeometry args={[2.2, 0.6]} />
  <meshBasicMaterial transparent opacity={0} />
</mesh>
   
<mesh
  position={[2, -1.8, -3.88]}
  onClick={() =>
    setViewNumber((current) => Math.min(MAX_VIEW, current + 1))
  }
>
  <planeGeometry args={[2.2, 0.6]} />
  <meshBasicMaterial transparent opacity={0} />
</mesh>
    
    <GalleryPhotoWall3D
  room="Identity"
  wall="Front"
  sectionNumber={sectionNumber}
  viewNumber={viewNumber}
/>

    <GalleryPhotoWall3D
  room="Identity"
  wall="Left"
  sectionNumber={sectionNumber}
  viewNumber={viewNumber}
/>

    <GalleryPhotoWall3D
  room="Identity"
  wall="Right"
  sectionNumber={sectionNumber}
  viewNumber={viewNumber}
/>
  </>
);
}
