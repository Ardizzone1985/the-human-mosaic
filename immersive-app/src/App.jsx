import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function Room() {
  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.6} />

      {/* Main cinematic light */}
      <pointLight
        position={[0, 4, 4]}
        intensity={8}
        color="#ffd7a8"
      />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#3b3126"
          roughness={0.35}
          metalness={0.4}
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 3, -6]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial
          color="#4a3b2d"
          roughness={0.55}
          metalness={0.18}
        />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-10, 3, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial
          color="#2f241b"
          roughness={0.6}
        />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[10, 3, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial
          color="#2f241b"
          roughness={0.6}
        />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 7, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#111111" />
      </mesh>

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
