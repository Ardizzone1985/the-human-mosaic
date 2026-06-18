import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState, useRef } from "react";
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

const LOBBY_BOUNDS = {
  minX: -10.45,
  maxX: 10.45,
  minZ: -8.25,
  maxZ: 9.25,
  minY: 1.75,
  maxY: 3.1
};

const ROOM_BOUNDS = {
  minX: -10.45,
  maxX: 10.45,
  minZ: -9.55,
  maxZ: 10.05,
  minY: 1.75,
  maxY: 3.1
};

function applyCameraBounds(camera, bounds) {
  camera.position.x = THREE.MathUtils.clamp(
    camera.position.x,
    bounds.minX,
    bounds.maxX
  );

  camera.position.z = THREE.MathUtils.clamp(
    camera.position.z,
    bounds.minZ,
    bounds.maxZ
  );

  camera.position.y = THREE.MathUtils.clamp(
    camera.position.y,
    bounds.minY,
    bounds.maxY
  );
}

function applyInfoWallCollision(camera) {
  const wallMinX = -3.8;
  const wallMaxX = 3.8;

  const wallMinZ = -10.2;
  const wallMaxZ = -8.7;

  if (
    camera.position.x > wallMinX &&
    camera.position.x < wallMaxX &&
    camera.position.z > wallMinZ &&
    camera.position.z < wallMaxZ
  ) {
    camera.position.z = wallMaxZ;
  }
}

function applyCornerCollisions(camera) {
  const margin = 0.55;

  if (camera.position.x < ROOM_BOUNDS.minX + margin) {
    camera.position.x = ROOM_BOUNDS.minX + margin;
  }

  if (camera.position.x > ROOM_BOUNDS.maxX - margin) {
    camera.position.x = ROOM_BOUNDS.maxX - margin;
  }

  if (camera.position.z < ROOM_BOUNDS.minZ + margin) {
    camera.position.z = ROOM_BOUNDS.minZ + margin;
  }

  if (camera.position.z > ROOM_BOUNDS.maxZ - margin) {
    camera.position.z = ROOM_BOUNDS.maxZ - margin;
  }
}

function RoomCameraBounds() {
  const { camera } = useThree();

  useFrame(() => {
    applyCameraBounds(camera, ROOM_BOUNDS);
    applyInfoWallCollision(camera);
    applyCornerCollisions(camera);
  });

  return null;
}

function MuseumWalkControls() {
  const { camera, gl } = useThree();
  const keys = useRef({});
  const yaw = useRef(0);
  const pitch = useRef(0);
  const velocity = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    camera.position.set(0, 2.05, 8.4);
    camera.rotation.order = "YXZ";

    function onKeyDown(e) {
      keys.current[e.code] = true;
    }

    function onKeyUp(e) {
      keys.current[e.code] = false;
    }

    function onClick() {
      gl.domElement.requestPointerLock?.();
    }

    function onMouseMove(e) {
      if (document.pointerLockElement !== gl.domElement) return;

      yaw.current -= e.movementX * 0.0022;
      pitch.current -= e.movementY * 0.0022;

      pitch.current = THREE.MathUtils.clamp(
        pitch.current,
        -Math.PI / 3,
        Math.PI / 3
      );

      camera.rotation.y = yaw.current;
      camera.rotation.x = pitch.current;
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    gl.domElement.addEventListener("click", onClick);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      gl.domElement.removeEventListener("click", onClick);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [camera, gl]);

  useFrame((state, delta) => {
    const speed = keys.current.ShiftLeft ? 1.2 : 3.0;

    const forward = new THREE.Vector3(
      -Math.sin(camera.rotation.y),
      0,
      -Math.cos(camera.rotation.y)
    );

    const right = new THREE.Vector3(
      Math.cos(camera.rotation.y),
      0,
      -Math.sin(camera.rotation.y)
    );

    const targetVelocity = new THREE.Vector3(0, 0, 0);

if (keys.current.KeyW) targetVelocity.addScaledVector(forward, speed);
if (keys.current.KeyS) targetVelocity.addScaledVector(forward, -speed);
if (keys.current.KeyA) targetVelocity.addScaledVector(right, -speed);
if (keys.current.KeyD) targetVelocity.addScaledVector(right, speed);

velocity.current.lerp(targetVelocity, 0.08);

camera.position.addScaledVector(velocity.current, delta);

    applyCameraBounds(camera, ROOM_BOUNDS);
    applyInfoWallCollision(camera);
    applyCornerCollisions(camera);
  });

  return null;
}

function MobileJoystickMovement({ joystick, lookJoystick, bounds = ROOM_BOUNDS }) {
  const { camera } = useThree();
  const yaw = useRef(0);
  const pitch = useRef(0);
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const targetYaw = useRef(0);
const targetPitch = useRef(0);

  useFrame((state, delta) => {
    const moveSpeed = 3.0;
    const lookSpeed = 0.85;

    targetYaw.current -= lookJoystick.x * lookSpeed * delta;
targetPitch.current -= lookJoystick.y * lookSpeed * delta;

targetPitch.current = THREE.MathUtils.clamp(
  targetPitch.current,
  -Math.PI / 3.8,
  Math.PI / 3.8
);

yaw.current = THREE.MathUtils.lerp(yaw.current, targetYaw.current, 0.12);
pitch.current = THREE.MathUtils.lerp(pitch.current, targetPitch.current, 0.12);

camera.rotation.order = "YXZ";
camera.rotation.y = yaw.current;
camera.rotation.x = pitch.current;
    
    const forward = new THREE.Vector3(
      -Math.sin(camera.rotation.y),
      0,
      -Math.cos(camera.rotation.y)
    );

    const right = new THREE.Vector3(
      Math.cos(camera.rotation.y),
      0,
      -Math.sin(camera.rotation.y)
    );

    const targetVelocity = new THREE.Vector3(0, 0, 0);

targetVelocity.addScaledVector(forward, -joystick.y * moveSpeed);
targetVelocity.addScaledVector(right, joystick.x * moveSpeed);

velocity.current.lerp(targetVelocity, 0.08);

camera.position.addScaledVector(velocity.current, delta);

    camera.position.x = THREE.MathUtils.clamp(camera.position.x, bounds.minX, bounds.maxX);
camera.position.z = THREE.MathUtils.clamp(camera.position.z, bounds.minZ, bounds.maxZ);
camera.position.y = THREE.MathUtils.clamp(camera.position.y, bounds.minY, bounds.maxY);
  });

  return null;
}

function Room({ room, theme, onPhotoSelect }) {
  const currentRoom = room;
  const isDesktop =
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: fine)").matches;
  
    return (
    <>
      <RoomShell theme={theme} />
      <InfoWall room={currentRoom} />
<LivePhotoWall room={currentRoom} onPhotoSelect={onPhotoSelect} />
{/* <DynamicSectionManager room={currentRoom} /> */}
      <RoomCameraBounds />
      {isDesktop && <MuseumWalkControls />}
     
      {!isDesktop && (
  <MobileJoystickMovement
  joystick={window.mobileJoystick || { x: 0, y: 0 }}
  lookJoystick={window.mobileLookJoystick || { x: 0, y: 0 }}
  bounds={ROOM_BOUNDS}
/>
)}

    </>
  );
}

export default function App() {
  const [fadeIn, setFadeIn] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showMobileTutorial, setShowMobileTutorial] = useState(() => {
  return localStorage.getItem("humanMosaicMobileTutorialSeen") !== "true";
});
  const [joystick, setJoystick] = useState({ x: 0, y: 0 });
  const [lookJoystick, setLookJoystick] = useState({ x: 0, y: 0 });
  window.mobileJoystick = joystick;
  window.mobileLookJoystick = lookJoystick;

  const isMobile =
  typeof window !== "undefined" &&
  !window.matchMedia("(pointer: fine)").matches;
  const joystickRef = useRef(null);
  const lookJoystickRef = useRef(null);

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

      {isMobile && showMobileTutorial && (
  <div
    onClick={() => {
  localStorage.setItem("humanMosaicMobileTutorialSeen", "true");
  setShowMobileTutorial(false);
}}
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 999998,
      background: "rgba(0,0,0,0.72)",
      backdropFilter: "blur(10px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      boxSizing: "border-box"
    }}
  >
    <div
      style={{
        width: "min(92vw, 420px)",
        padding: "26px 22px",
        borderRadius: "26px",
        background: "rgba(18, 8, 4, 0.96)",
        border: "1px solid rgba(215,181,109,0.55)",
        color: "#fff",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0 30px 90px rgba(0,0,0,0.75)"
      }}
    >
      <div
        style={{
          color: "#f2c879",
          fontSize: "18px",
          fontWeight: 800,
          letterSpacing: "0.12em",
          marginBottom: "18px"
        }}
      >
        THE HUMAN MOSAIC
      </div>

      <div style={{ color: "#d8c7ad", fontSize: "15px", lineHeight: 1.7 }}>
        <strong>Left joystick</strong><br />
        Move through the museum<br /><br />

        <strong>Right joystick</strong><br />
        Look around<br /><br />

        <strong>Tap a photo</strong><br />
        Open participant details
      </div>

      <div
        style={{
          marginTop: "22px",
          color: "#f2c879",
          fontSize: "13px",
          letterSpacing: "0.08em"
        }}
      >
        TAP TO START
      </div>
    </div>
  </div>
)}

      {isMobile && (
  <div
  ref={joystickRef}
  onTouchMove={(e) => {
    const touch = e.touches[0];
    const rect = joystickRef.current.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = (touch.clientX - centerX) / 40;
    let dy = (touch.clientY - centerY) / 40;

    dx = Math.max(-1, Math.min(1, dx));
    dy = Math.max(-1, Math.min(1, dy));

    setJoystick({ x: dx, y: dy });
  }}

  onTouchEnd={() => {
    setJoystick({ x: 0, y: 0 });
  }}

  style={{
      position: "fixed",
      left: 24,
      bottom: 34,
      width: 96,
      height: 96,
      borderRadius: "50%",
      background: "rgba(0,0,0,0.32)",
      border: "1px solid rgba(215,181,109,0.35)",
      zIndex: 30,
      touchAction: "none"
    }}
  >
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: "rgba(215,181,109,0.82)",
        transform: `translate(calc(-50% + ${joystick.x * 28}px), calc(-50% + ${joystick.y * 28}px))`,
        boxShadow: "0 0 22px rgba(215,181,109,0.45)"
      }}
    />
  </div>
)}

      {isMobile && (
  <div
    ref={lookJoystickRef}
    onTouchMove={(e) => {
      const touch = e.touches[0];
      const rect = lookJoystickRef.current.getBoundingClientRect();

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      let dx = (touch.clientX - centerX) / 40;
      let dy = (touch.clientY - centerY) / 40;

      dx = Math.max(-1, Math.min(1, dx));
      dy = Math.max(-1, Math.min(1, dy));

      setLookJoystick({ x: dx, y: dy });
    }}
    onTouchEnd={() => {
      setLookJoystick({ x: 0, y: 0 });
    }}
    style={{
      position: "fixed",
      right: 24,
      bottom: 34,
      width: 96,
      height: 96,
      borderRadius: "50%",
      background: "rgba(0,0,0,0.32)",
      border: "1px solid rgba(215,181,109,0.35)",
      zIndex: 30,
      touchAction: "none"
    }}
  >
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: "rgba(215,181,109,0.82)",
        transform: `translate(calc(-50% + ${lookJoystick.x * 28}px), calc(-50% + ${lookJoystick.y * 28}px))`,
        boxShadow: "0 0 22px rgba(215,181,109,0.45)"
      }}
    />
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
        width: "min(94vw, 460px)",
        maxHeight: "82vh",
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
          maxHeight: "46vh",
          objectFit: "contain",
          background: "#000",
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
          padding: "15px",
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
    position={[-6, 7, -3]}
  angle={0.32}
  penumbra={0.9}
  intensity={2.2}
  distance={24}
  color={theme.directional}
  target-position={[-7, 3, -9]}
/>

<spotLight
    position={[0, 7, -3]}
  angle={0.32}
  penumbra={0.9}
  intensity={2.2}
  distance={24}
  color={theme.directional}
  target-position={[0, 3, -9]}
/>

<spotLight
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

{isMobile ? (
  <MobileJoystickMovement
  joystick={window.mobileJoystick || { x: 0, y: 0 }}
  lookJoystick={window.mobileLookJoystick || { x: 0, y: 0 }}
  bounds={LOBBY_BOUNDS}
/>
) : (
  <OrbitControls
    enablePan={false}
    enableZoom={true}
    enableDamping={true}
    dampingFactor={0.06}
    rotateSpeed={0.32}
    zoomSpeed={0.55}
    touches={{
      ONE: 0,
      TWO: 2
    }}
    minDistance={5.2}
    maxDistance={11}
    minPolarAngle={Math.PI / 2.55}
    maxPolarAngle={Math.PI / 1.82}
    target={[0, 2.2, -7]}
  />
)}
  </>
) : (
  <Room room={currentRoom} theme={theme} onPhotoSelect={setSelectedPhoto} />
)}
</Canvas>
         </div>
      </>
  );
}
