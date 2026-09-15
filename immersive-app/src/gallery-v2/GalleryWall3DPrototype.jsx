import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import GalleryWall3D from "./GalleryWall3D";

export default function GalleryWall3DPrototype() {
  const [sectionNumber, setSectionNumber] = useState(1667);
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

        <GalleryWall3D sectionNumber={sectionNumber} />

        <mesh
  position={[0, -1.55, -3.8]}
  onClick={() =>
    setSectionNumber((current) => Math.max(1, current - 1))
  }
>
  <planeGeometry args={[2.2, 0.55]} />
  <meshBasicMaterial transparent opacity={0} />
</mesh>

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

