import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Text, OrbitControls } from "@react-three/drei";
import GalleryWall3D from "./GalleryWall3D";

export default function GalleryWall3DPrototype() {
  const [sectionNumber, setSectionNumber] = useState(1);
  const [viewNumber, setViewNumber] = useState(1);
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#111",
      }}
    >
      <Canvas camera={{ position: [0, 2, 9], fov: 50 }}>
        <OrbitControls
  enablePan={false}
  enableZoom={false}
  enableDamping
  dampingFactor={0.08}
  target={[0, 2, -4]}
/>
        
        <ambientLight intensity={1.2} />
        <directionalLight
          position={[4, 6, 4]}
          intensity={1.5}
        />

        <GalleryWall3D
  key={sectionNumber}
  sectionNumber={sectionNumber}
  viewNumber={viewNumber}
  setViewNumber={setViewNumber}
/>

        {/* pavimento */}
<mesh
  position={[0, -2, 5]}
  rotation={[-Math.PI / 2, 0, 0]}
>
  <planeGeometry args={[22, 22]} />
  <meshStandardMaterial
    color="#d8d2c5"
    roughness={0.8}
    metalness={0.05}
  />
</mesh>

        {/* INFO WALL */}
<mesh
  position={[0, 2, 16]}
  rotation={[0, Math.PI, 0]}
>
  <planeGeometry args={[22, 8]} />
  <meshStandardMaterial
    color="#e8e3d8"
    roughness={0.75}
    metalness={0.05}
  />
</mesh>

        <Text
  position={[0, 4.8, 15.94]}
  rotation={[0, Math.PI, 0]}
  fontSize={0.42}
  color="#4f4638"
  anchorX="center"
  anchorY="middle"
>
  {`SECTION ${sectionNumber}  ·  VIEW ${viewNumber} / ${
    sectionNumber === 1667 ? 4 : 5
  }`}
</Text>
      </Canvas>
    </div>
  );
}

