import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import RoomShell from "./RoomShell.jsx";
import LivePhotoWall from "./LivePhotoWall.jsx";
import InfoWall from "./InfoWall.jsx";
import DynamicSectionManager from "./DynamicSectionManager.jsx";

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
      <InfoWall />
      <LivePhotoWall />
      <DynamicSectionManager />

      <OrbitControls
  enablePan={false}
  enableDamping={true}
  dampingFactor={0.12}
  minDistance={1.1}
  maxDistance={22}
  minPolarAngle={Math.PI / 2.8}
  maxPolarAngle={Math.PI / 1.75}
  rotateSpeed={0.42}
  zoomSpeed={0.55}
  target={[0, 2.4, -2]}
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

  <ambientLight intensity={0.32} />

<directionalLight
  position={[6, 8, 5]}
  intensity={1.4}
  color={"#ffd89b"}
/>

<pointLight
  position={[0, 4, -2]}
  intensity={1.1}
  distance={18}
  color={"#ffb45e"}
/>

<pointLight
  position={[-5, 3, -4]}
  intensity={0.55}
  distance={12}
  color={"#6d3b12"}
/>

<pointLight
  position={[5, 3, -4]}
  intensity={0.55}
  distance={12}
  color={"#6d3b12"}
/>

  <Room />
</Canvas>
         </div>
  );
}
