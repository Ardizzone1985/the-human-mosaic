import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import RoomShell from "./RoomShell.jsx";

function Room() {
  return (
    <>

      <RoomShell />
      
      {/* TEST WALL IMAGES */}
      {Array.from({ length: 40 }).map((_, i) => {
        const col = i % 10;
        const row = Math.floor(i / 10);

        return (
          <mesh
            key={i}
            position={[
              -8 + col * 1.8,
              5 - row * 1.8,
              -5.8
            ]}
          >
            <planeGeometry args={[1.5, 1.5]} />
            <meshStandardMaterial color="#d8c08f" />
          </mesh>
        );
      })}

      <OrbitControls
        enablePan={false}
        maxDistance={12}
        minDistance={4}
      />
    </>
  );
}

export default function App() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#050505"
      }}
    >
      <Canvas camera={{ position: [0, 2, 6], fov: 60 }}>
        <fog attach="fog" args={["#050505", 10, 30]} />
        <Room />
      </Canvas>

      {/* Overlay UI */}
      <div
        style={{
          position: "fixed",
          top: 30,
          left: 30,
          padding: 24,
          borderRadius: 24,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(14px)",
          color: "white",
          width: 360,
          border: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.1)",
            marginBottom: 14,
            color: "#e7c98f",
            fontSize: 12,
            letterSpacing: "0.08em"
          }}
        >
          IMMERSIVE APP
        </div>

        <h1
          style={{
            fontSize: 62,
            lineHeight: 0.95,
            marginBottom: 18
          }}
        >
          The Human Mosaic
        </h1>

        <p
          style={{
            color: "rgba(255,255,255,0.75)",
            lineHeight: 1.6
          }}
        >
          The first immersive prototype of the permanent
          digital museum of humanity.
        </p>
      </div>
    </div>
  );
}
