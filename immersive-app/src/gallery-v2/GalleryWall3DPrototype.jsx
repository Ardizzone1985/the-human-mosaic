import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import GalleryWall3D from "./GalleryWall3D";

export default function GalleryWall3DPrototype() {
  const [sectionNumber, setSectionNumber] = useState(1);
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#111",
      }}
    >
      <Canvas camera={{ position: [0, 2, 9], fov: 50 }}>
        <ambientLight intensity={1.2} />
        <directionalLight
          position={[4, 6, 4]}
          intensity={1.5}
        />

        <GalleryWall3D
  key={sectionNumber}
  sectionNumber={sectionNumber}
/>
        <mesh
  position={[0, -1.55, -3.8]}
  onClick={() =>
    setSectionNumber((current) => Math.max(1, current - 1))
  }
>
  <planeGeometry args={[2.2, 0.55]} />
  <meshBasicMaterial transparent opacity={0} />
</mesh>

        <Text
  position={[0, -1.55, -3.79]}
  fontSize={0.28}
  color="#222222"
  anchorX="center"
  anchorY="middle"
          onClick={(event) => {
  event.stopPropagation();
  setSectionNumber((current) => Math.max(1, current - 1));
}}
>
  Previous Section
</Text>

        <Text
  position={[0, -1.15, -3.85]}
  fontSize={0.18}
  color="#222222"
  anchorX="center"
  anchorY="middle"
  onClick={(event) => {
    event.stopPropagation();
    setSectionNumber(1667);
  }}
>
  Go to Section 1667
</Text>

        <Text
  position={[1.5, -2, -3.85]}
  fontSize={0.22}
  color="#222222"
  anchorX="center"
  anchorY="middle"
  onClick={() => {
    setSectionNumber((current) => Math.min(1667, current + 1));    
  }}
>
  Next Section
</Text>

        {/* pavimento */}
        <mesh
  position={[0, -2, 1]}
  rotation={[-Math.PI / 2, 0, 0]}
>
  <planeGeometry args={[14, 14]} />
  <meshStandardMaterial
    color="#d8d2c5"
    roughness={0.8}
    metalness={0.05}
  />
</mesh>

        {/* parete sinistra */}
        <mesh
  position={[-7, 2, -6]}
  rotation={[0, Math.PI / 2, 0]}
>
  <planeGeometry args={[14, 8]} />
  <meshStandardMaterial
    color="#d8d2c5"
    roughness={0.8}
    metalness={0.05}
  />
</mesh>

        {/* parete destra */}
<mesh
  position={[7, 2, -6]}
  rotation={[0, -Math.PI / 2, 0]}
>
  <planeGeometry args={[14, 8]} />
  <meshStandardMaterial
    color="#d8d2c5"
    roughness={0.8}
    metalness={0.05}
  />
</mesh>
      </Canvas>
    </div>
  );
}

