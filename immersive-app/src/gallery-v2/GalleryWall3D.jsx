import { useState } from "react";
import { Text } from "@react-three/drei";
import GalleryPhotoWall3D from "./GalleryPhotoWall3D";

export default function GalleryWall3D({ sectionNumber = 1 }) {
  const [viewNumber, setViewNumber] = useState(1);
const SLOTS_PER_VIEW = 40;
  const MAX_VIEW = sectionNumber === 1667 ? 10 : 15;
  return (
  <>
    
    <Text
  position={[0, 3.25, -3.9]}
  fontSize={0.32}
  color="#222222"
  anchorX="center"
  anchorY="middle"
>
  {`SECTION ${sectionNumber}`}
</Text>

    <Text
  position={[-2, -1.8, -3.9]}
  fontSize={0.28}
  color="#222222"
  anchorX="center"
  anchorY="middle"
  onClick={() =>
    setViewNumber((current) => Math.max(1, current - 1))
  }
>
  Previous View
</Text>

    <mesh
  position={[-2, -1.8, -3.88]}
  onClick={() =>
    setViewNumber((current) => Math.max(1, current - 1))
  }
>
  <planeGeometry args={[2.2, 0.6]} />
  <meshBasicMaterial transparent opacity={0} />
</mesh>

    <Text
  position={[2, -1.8, -3.9]}
  fontSize={0.28}
  color="#222222"
  anchorX="center"
  anchorY="middle"
>
  Next View
</Text>

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
  </>
);
}
