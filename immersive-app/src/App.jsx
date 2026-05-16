import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import RoomShell from "./RoomShell.jsx";
import WallGrid from "./WallGrid.jsx";
import LivePhotoWall from "./LivePhotoWall.jsx";

function parseSlotCode(slotCode) {
  if (!slotCode) return null;

  const rowMatch = slotCode.match(/R(\d+)/i);
  const colMatch = slotCode.match(/C(\d+)/i);

  if (!rowMatch || !colMatch) return null;

  return {
    row: Number(rowMatch[1]),
    col: Number(colMatch[1])
  };
}

function slotToPosition(slotCode, wall) {
  const parsed = parseSlotCode(slotCode);

  if (!parsed) {
    return {
      position: [0, 3, -5.55],
      rotation: [0, 0, 0]
    };
  }

  const slotSizeX = 0.32;
  const slotSizeY = 0.32;

  const col = parsed.col - 1;
  const row = parsed.row - 1;

  if (wall === "Front Wall") {
    return {
      position: [-8.5 + col * slotSizeX, 6.2 - row * slotSizeY, -5.45],
      rotation: [0, 0, 0]
    };
  }

  if (wall === "Left Wall") {
    return {
      position: [-10.55, 6.2 - row * slotSizeY, -4.8 + col * slotSizeX],
      rotation: [0, Math.PI / 2, 0]
    };
  }

  if (wall === "Right Wall") {
    return {
      position: [10.55, 6.2 - row * slotSizeY, -4.8 + col * slotSizeX],
      rotation: [0, -Math.PI / 2, 0]
    };
  }

  return {
    position: [0, 3, -5.45],
    rotation: [0, 0, 0]
  };
}

function Room() {
  return (
    <>
      <RoomShell />
      <LivePhotoWall />

      <WallGrid wall="front" color="#d9b66f" />
<WallGrid wall="left" color="#b98a4a" />
<WallGrid wall="right" color="#7f2d2d" />

      <OrbitControls
  enablePan={false}
  enableDamping={true}
  dampingFactor={0.08}
  maxDistance={12}
  minDistance={4}
  maxPolarAngle={Math.PI / 2.1}
  minPolarAngle={Math.PI / 3.1}
  minAzimuthAngle={-Math.PI / 3.5}
  maxAzimuthAngle={Math.PI / 3.5}
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
      <Canvas camera={{ position: [0, 2.8, 8.5], fov: 52 }} shadows>
  <fog attach="fog" args={["#050505", 14, 36]} />

  <ambientLight intensity={0.35} color="#ffddaa" />

  <directionalLight
    position={[0, 8, 5]}
    intensity={1.2}
    color="#ffe0b5"
    castShadow
  />

  <pointLight
    position={[0, 4, -2]}
    intensity={2}
    distance={30}
    color="#ffb866"
  />

  <pointLight
    position={[-8, 4, 0]}
    intensity={1.4}
    distance={25}
    color="#ffcc88"
  />

  <pointLight
    position={[8, 4, 0]}
    intensity={1.4}
    distance={25}
    color="#ffcc88"
  />

  <Room />
</Canvas>
      <div
        style={{
          position: "fixed",
          top: 30,
          left: 30,
          padding: 24,
          borderRadius: 24,
          background: "rgba(0,0,0,0.55)",
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
          The first immersive prototype of the permanent digital museum of humanity.
        </p>
      </div>
    </div>
  );
}
