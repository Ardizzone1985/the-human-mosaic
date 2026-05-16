import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import RoomShell from "./RoomShell.jsx";

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
      position: [0, 3, -5.7],
      rotation: [0, 0, 0]
    };
  }

  const scaleX = 0.18;
  const scaleY = 0.18;

  const x = -9 + parsed.col * scaleX;
  const y = 6.4 - parsed.row * scaleY;

  if (wall === "Front Wall") {
    return {
      position: [x, y, -5.7],
      rotation: [0, 0, 0]
    };
  }

  if (wall === "Left Wall") {
    return {
      position: [-10.75, y, -5 + parsed.col * scaleX],
      rotation: [0, Math.PI / 2, 0]
    };
  }

  if (wall === "Right Wall") {
    return {
      position: [10.75, y, -5 + parsed.col * scaleX],
      rotation: [0, -Math.PI / 2, 0]
    };
  }

  return {
    position: [x, y, -5.7],
    rotation: [0, 0, 0]
  };
}

const testSubmissions = [
  {
    id: 1,
    room: "Identity",
    wall: "Front Wall",
    slot_code: "Identity-FW-R10-C53",
    color: "#d9b66f"
  },
  {
    id: 2,
    room: "Identity",
    wall: "Left Wall",
    slot_code: "Identity-LW-R15-C22",
    color: "#9fc3ff"
  },
  {
    id: 3,
    room: "Identity",
    wall: "Right Wall",
    slot_code: "Identity-RW-R8-C40",
    color: "#ff9fbd"
  }
];

function Room() {
  return (
    <>
      <RoomShell />

      {/* TEST REAL SLOT POSITIONS */}
{testSubmissions.map((item) => {
  const { position, rotation } = slotToPosition(item.slot_code, item.wall);

  return (
    <mesh key={item.id} position={position} rotation={rotation}>
      <planeGeometry args={[0.16, 0.16]} />
      <meshStandardMaterial color={item.color} />
    </mesh>
  );
})}

      {/* FRONT WALL */}
      {Array.from({ length: 60 }).map((_, i) => {
        const col = i % 12;
        const row = Math.floor(i / 12);

        return (
          <mesh
            key={`front-${i}`}
            position={[-8.8 + col * 1.6, 5.8 - row * 1.25, -5.7]}
          >
            <planeGeometry args={[1.15, 0.95]} />
            <meshStandardMaterial color="#d9b66f" roughness={0.35} metalness={0.12} />
          </mesh>
        );
      })}

      {/* LEFT WALL */}
      {Array.from({ length: 45 }).map((_, i) => {
        const col = i % 9;
        const row = Math.floor(i / 9);

        return (
          <mesh
            key={`left-${i}`}
            rotation={[0, Math.PI / 2, 0]}
            position={[-10.75, 5.8 - row * 1.25, -4.5 + col * 1.6]}
          >
            <planeGeometry args={[1.15, 0.95]} />
            <meshStandardMaterial color="#9fc3ff" roughness={0.35} metalness={0.1} />
          </mesh>
        );
      })}

      {/* RIGHT WALL */}
      {Array.from({ length: 45 }).map((_, i) => {
        const col = i % 9;
        const row = Math.floor(i / 9);

        return (
          <mesh
            key={`right-${i}`}
            rotation={[0, -Math.PI / 2, 0]}
            position={[10.75, 5.8 - row * 1.25, -4.5 + col * 1.6]}
          >
            <planeGeometry args={[1.15, 0.95]} />
            <meshStandardMaterial color="#ff9fbd" roughness={0.35} metalness={0.1} />
          </mesh>
        );
      })}

      <OrbitControls enablePan={false} maxDistance={18} minDistance={3} />
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
      <Canvas camera={{ position: [0, 2.2, 7.5], fov: 58 }} shadows>
        <fog attach="fog" args={["#050505", 14, 36]} />
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
