import { Canvas } from "@react-three/fiber";
import GalleryWall3D from "./GalleryWall3D";

export default function GalleryWall3DPrototype() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#111",
      }}
    >
      <Canvas camera={{ position: [0, 2, 6], fov: 50 }}>
        <ambientLight intensity={1.2} />
        <directionalLight
          position={[4, 6, 4]}
          intensity={1.5}
        />

        <GalleryWall3D />
      </Canvas>
    </div>
  );
}
