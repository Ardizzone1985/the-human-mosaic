import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import RoomShell from "./RoomShell.jsx";
import LivePhotoWall from "./LivePhotoWall.jsx";
import InfoWall from "./InfoWall.jsx";
import DynamicSectionManager from "./DynamicSectionManager.jsx";
import Lobby from "./Lobby.jsx";
import AtmosphereParticles from "./AtmosphereParticles.jsx";
import * as THREE from "three";

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

function RoomCameraBounds() {
  const { camera } = useThree();

  useFrame(() => {
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -10.75, 10.75);
camera.position.z = THREE.MathUtils.clamp(camera.position.z, -9.95, 10.25);
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, 1.25, 6.2);
  });

  return null;
}

function Room({ room, theme, onPhotoSelect }) {
  const currentRoom = room;
    return (
    <>
      <RoomShell theme={theme} />
      <InfoWall room={currentRoom} />
<LivePhotoWall room={currentRoom} onPhotoSelect={onPhotoSelect} />
<DynamicSectionManager room={currentRoom} />
      <RoomCameraBounds />

      <OrbitControls
  enablePan={false}
  enableDamping={true}
  dampingFactor={0.06}

  rotateSpeed={0.18}
  zoomSpeed={0.26}
  touches={{
    ONE: 0,
    TWO: 2
  }}

  minDistance={0.25}
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
  const [selectedPhoto, setSelectedPhoto] = useState(null);

useEffect(() => {
  setTimeout(() => {
    setFadeIn(true);
  }, 120);

  window.addEventListener("startFadeOut", () => {
  setFadeIn(false);
});
}, []);
    const params = new URLSearchParams(window.location.search);

const roomParam = params.get("room");

const currentRoom =
  roomParam?.toLowerCase() === "identity"
    ? "Identity"
    : roomParam?.toLowerCase() === "love"
    ? "Love"
    : roomParam?.toLowerCase() === "creativity"
    ? "Creativity"
    : null;

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

      {selectedPhoto && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.72)",
      backdropFilter: "blur(10px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      zIndex: 999999,
      boxSizing: "border-box"
    }}
  >
    <div
      style={{
        width: "min(92vw, 420px)",
        maxHeight: "88vh",
        overflowY: "auto",
        padding: "18px",
        borderRadius: "24px",
        background: "rgba(12, 6, 3, 0.96)",
        border: "1px solid rgba(215,181,109,0.55)",
        color: "#fff",
        boxShadow: "0 30px 90px rgba(0,0,0,0.75)",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <img
        src={
          "https://cqpujmwfiqbwdsmuwkmb.supabase.co/storage/v1/object/public/images/" +
          selectedPhoto.image_file_name
        }
        alt=""
        style={{
          width: "100%",
          maxHeight: "52vh",
          objectFit: "cover",
          borderRadius: "18px",
          marginBottom: "18px",
          border: "1px solid rgba(215,181,109,0.3)"
        }}
      />

      <div style={{ color: "#d7b56d", fontSize: "12px", letterSpacing: "0.12em" }}>
        COUNTRY
      </div>

      <div style={{ fontSize: "20px", fontWeight: "700", margin: "6px 0 18px" }}>
        {selectedPhoto?.country || "Country not available."}
      </div>

      <div style={{ color: "#d7b56d", fontSize: "12px", letterSpacing: "0.12em" }}>
        NOTE
      </div>

      <div style={{ fontSize: "15px", lineHeight: "1.5", marginTop: "8px", color: "#e8ded0" }}>
        {selectedPhoto?.note || selectedPhoto?.notes || selectedPhoto?.optional_note || "No note added."}
      </div>

      <button
        onClick={() => setSelectedPhoto(null)}
        style={{
          marginTop: "22px",
          width: "100%",
          padding: "13px",
          borderRadius: "999px",
          border: "none",
          background: "#d7b56d",
          color: "#1b0d05",
          fontWeight: "700",
          cursor: "pointer"
        }}
      >
        Close
      </button>
    </div>
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
  camera={{ position: [0, 1.75, 8.8], fov: 58 }}
  shadows={{
    type: "soft"
  }}
  gl={{
    antialias: true
  }}
>
  <fog attach="fog" args={["#050505", 10, 30]} />

  <color attach="background" args={["#050505"]} />      

  <AtmosphereParticles />      

  <ambientLight intensity={0.35} color={theme.ambient} />

  <ambientLight intensity={0.32} />

<directionalLight
  castShadow
  position={[4, 8, 4]}
  intensity={1.8}
  color={theme.directional}
  shadow-mapSize-width={2048}
  shadow-mapSize-height={2048}
  shadow-camera-near={0.5}
  shadow-camera-far={40}
  shadow-bias={-0.00008}
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

  <spotLight
  castShadow
  position={[-6, 7, -3]}
  angle={0.32}
  penumbra={0.9}
  intensity={2.2}
  distance={24}
  color={theme.directional}
  target-position={[-7, 3, -9]}
/>

<spotLight
  castShadow
  position={[0, 7, -3]}
  angle={0.32}
  penumbra={0.9}
  intensity={2.2}
  distance={24}
  color={theme.directional}
  target-position={[0, 3, -9]}
/>

<spotLight
  castShadow
  position={[6, 7, -3]}
  angle={0.32}
  penumbra={0.9}
  intensity={2.2}
  distance={24}
  color={theme.directional}
  target-position={[7, 3, -9]}
/>      

  {isLobby ? (
  <>
    <Lobby />

    <OrbitControls
      enablePan={false}
      enableZoom={false}
      enableDamping={true}
      dampingFactor={0.06}
      rotateSpeed={0.18}
      minPolarAngle={Math.PI / 2.35}
      maxPolarAngle={Math.PI / 1.9}
      minAzimuthAngle={-0.35}
      maxAzimuthAngle={0.35}
      target={[0, 2.0, -7]}
    />
  </>
) : (
  <Room room={currentRoom} theme={theme} onPhotoSelect={setSelectedPhoto} />
)}
</Canvas>
         </div>
      </>
  );
}
