import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import RoomShell from "./RoomShell.jsx";
import LivePhotoWall from "./LivePhotoWall.jsx";
import InfoWall from "./InfoWall.jsx";
import DynamicSectionManager from "./DynamicSectionManager.jsx";
import Lobby from "./Lobby.jsx";

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

const ROOM_THEMES = {
  Identity: {
    ambient: "#ffddaa",
    directional: "#ffd89b",
    glow: "#ffb45e",
    side: "#6d3b12"
  },

  Love: {
    ambient: "#ffd6e8",
    directional: "#ff8fc2",
    glow: "#ff6fa8",
    side: "#7a2148"
  },

  Creativity: {
    ambient: "#d6e4ff",
    directional: "#8fb8ff",
    glow: "#5da2ff",
    side: "#1d3f78"
  }
};

function Room({ room, theme }) {
  const currentRoom = room;
    return (
    <>
      <RoomShell theme={theme} />
      <InfoWall room={currentRoom} />
<LivePhotoWall room={currentRoom} />
<DynamicSectionManager room={currentRoom} />

      <OrbitControls
  enablePan={false}
  enableDamping={true}
  dampingFactor={0.09}

  rotateSpeed={0.22}
  zoomSpeed={0.32}
  touches={{
    ONE: 0,
    TWO: 2
  }}

  minDistance={7}
  maxDistance={18}

  minPolarAngle={Math.PI / 2.55}
  maxPolarAngle={Math.PI / 1.78}

  target={[0, 2.05, -2]}
/>
    </>
  );
}

export default function App() {
  const [fadeIn, setFadeIn] = useState(false);

useEffect(() => {
  setTimeout(() => {
    setFadeIn(true);
  }, 120);

  window.addEventListener("startFadeOut", () => {
  setFadeIn(false);
});
}, []);
    const params = new URLSearchParams(window.location.search);
  const currentRoom = params.get("room");
  const theme =
  ROOM_THEMES[currentRoom] || ROOM_THEMES.Identity;
  const isLobby = !currentRoom;
  return (
    <>
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "#000",
      pointerEvents: "none",
      opacity: fadeIn ? 0 : 1,
      transition: "opacity 1.8s ease",
      zIndex: 9999
    }}
  />
      {!isLobby && (
  <div
    style={{
      position: "fixed",
      top: 18,
      left: 18,
      right: 18,
      zIndex: 20,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      pointerEvents: "none"
    }}
  >
    <div
      style={{
        padding: "10px 14px",
        borderRadius: "999px",
        background: "rgba(0,0,0,0.45)",
        border: "1px solid rgba(215,181,109,0.35)",
        color: "#f2c879",
        fontSize: "12px",
        letterSpacing: "0.12em",
        fontWeight: 700,
        backdropFilter: "blur(10px)"
      }}
    >
      {currentRoom?.toUpperCase()} ROOM
    </div>

    <button
      onClick={() => {
        window.dispatchEvent(new Event("startFadeOut"));
        setTimeout(() => {
          window.location.href = "/";
        }, 900);
      }}
      style={{
        pointerEvents: "auto",
        border: "1px solid rgba(215,181,109,0.45)",
        background: "rgba(0,0,0,0.55)",
        color: "#f2c879",
        padding: "10px 14px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 700,
        cursor: "pointer",
        backdropFilter: "blur(10px)"
      }}
    >
      LOBBY
    </button>
  </div>
)}

{!isLobby && (
  <div
    style={{
      position: "fixed",
      left: "50%",
      bottom: 18,
      transform: "translateX(-50%)",
      zIndex: 20,
      padding: "10px 14px",
      borderRadius: "999px",
      background: "rgba(0,0,0,0.42)",
      border: "1px solid rgba(255,255,255,0.12)",
      color: "rgba(255,255,255,0.75)",
      fontSize: "12px",
      backdropFilter: "blur(10px)",
      textAlign: "center"
    }}
  >
    Swipe to look · Pinch to zoom · Tap a photo
  </div>
)}
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#050505"
      }}
    >
      <Canvas
  camera={{ position: [0, 2.45, 8.2], fov: 58 }}
  shadows
>
  <fog attach="fog" args={["#050505", 14, 36]} />

  <ambientLight intensity={0.35} color={theme.ambient} />

  <ambientLight intensity={0.32} />

<directionalLight
  position={[6, 8, 5]}
  intensity={1.4}
  color={theme.directional}
/>

<pointLight
  position={[0, 4, -2]}
  intensity={1.1}
  distance={18}
  color={theme.glow}
/>

<pointLight
  position={[-5, 3, -4]}
  intensity={0.55}
  distance={12}
  color={theme.side}
/>

<pointLight
  position={[5, 3, -4]}
  intensity={0.55}
  distance={12}
  color={theme.side}
/>

  {isLobby ? (
  <Lobby />
) : (
  <Room room={currentRoom} theme={theme} />
)}
</Canvas>
         </div>
      </>
  );
}
