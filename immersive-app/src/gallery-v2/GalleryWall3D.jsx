import { useState } from "react";
import { Text } from "@react-three/drei";

export default function GalleryWall3D() {
  const [viewNumber, setViewNumber] = useState(15);
const SLOTS_PER_VIEW = 40;
  return (
  <>
    <mesh position={[0, 2, -4]}>
      <planeGeometry args={[14, 8]} />
      <meshStandardMaterial
        color="#e8e3d8"
        roughness={0.75}
        metalness={0.05}
      />
    </mesh>

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

    {Array.from({ length: 4 }).map((_, row) =>
  Array.from({ length: 10 }).map((_, column) => {
    const x = -5.85 + column * 1.3;
    const y = 3.8 - row * 1.3;
    const slotNumber =
  (viewNumber - 1) * SLOTS_PER_VIEW +
  row * 10 +
  column +
  1;

    return (
  <group
    key={`${row}-${column}`}
    position={[x, y, -3.95]}
  >
    <mesh>
      <planeGeometry args={[1, 1]} />
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
  </>
);
}
