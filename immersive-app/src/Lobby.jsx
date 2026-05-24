import { useState } from "react";
import { Text, Image } from "@react-three/drei";
import LobbyShell from "./LobbyShell.jsx";
import logo from "./logo-cropped.png";

function RoomDoor({ position, label, room, color = "#d7b56d" }) {
  const [hovered, setHovered] = useState(false);

  function enterRoom() {
  window.dispatchEvent(new Event("startFadeOut"));

  setTimeout(() => {
    window.location.href = `/?room=${room}`;
  }, 900);
}

  return (
  <group
    position={position}
    scale={hovered ? 1.08 : 1}
    onPointerOver={(e) => {
      e.stopPropagation();
      setHovered(true);
      document.body.style.cursor = "pointer";
    }}
    onPointerOut={(e) => {
      e.stopPropagation();
      setHovered(false);
      document.body.style.cursor = "default";
    }}
    onClick={(e) => {
      e.stopPropagation();
      enterRoom();
    }}
  >
    <mesh position={[0, 0, -0.28]}>
  <boxGeometry args={[3.05, 5.15, 0.42]} />
      <meshStandardMaterial
        color={hovered ? color : "#6b4a1e"}
        emissive={color}
        emissiveIntensity={hovered ? 0.8 : 0.25}
        roughness={0.34}
        metalness={0.28}
      />
    </mesh>

    <mesh position={[0, 0, 0.02]}>
  <boxGeometry args={[2.24, 4.28, 0.42]} />
      <meshStandardMaterial
        color="#2a1208"
        roughness={0.42}
        metalness={0.22}
        emissive={color}
        emissiveIntensity={hovered ? 0.34 : 0.08}
      />
    </mesh>

    <mesh position={[0, 0, 0.28]}>
  <boxGeometry args={[1.62, 3.48, 0.12]} />
      <meshStandardMaterial
        color="#0b0302"
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>

    <mesh position={[0.82, 0, 0.28]}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial
        color="#d7b56d"
        emissive="#d7b56d"
        emissiveIntensity={hovered ? 0.7 : 0.25}
        metalness={0.8}
        roughness={0.22}
      />
    </mesh>

    <mesh position={[0, 2.18, 0.24]}>
      <boxGeometry args={[2.55, 0.08, 0.08]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} />
    </mesh>

    <Text
      position={[0, 2.78, 0.28]}
      fontSize={0.28}
      color={hovered ? "#ffffff" : color}
      anchorX="center"
    >
      {label}
    </Text>

    {/* Floor reflection glow */}
<mesh position={[0, -2.58, 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
  <circleGeometry args={[1.25, 48]} />
  <meshBasicMaterial
    color={color}
    transparent
    opacity={hovered ? 0.22 : 0.09}
  />
</mesh>

    {/* Cinematic rear glow */}
<mesh position={[0, 0, -0.55]}>
  <planeGeometry args={[2.8, 4.8]} />
  <meshBasicMaterial
    color={color}
    transparent
    opacity={hovered ? 0.18 : 0.08}
  />
</mesh>

    <Text
      position={[0, -2.55, 0.28]}
      fontSize={0.12}
      color={hovered ? "#ffffff" : "#d8c7ad"}
      anchorX="center"
    >
      CLICK TO ENTER
    </Text>
  </group>
);
}

export default function Lobby() {
  return (
    <>
      <LobbyShell />

      <Image
  url={logo}
  position={[0, 4.9, -7.2]}
  scale={[3.9, 1.05, 1]}
  transparent
/>

      <Text
  position={[0, 4.18, -7.2]}
  fontSize={0.27}
  color="#ffffff"
  anchorX="center"
>
  Choose Your Room
</Text>

      <RoomDoor
        position={[-5, 1, -7.6]}
        label="IDENTITY"
        room="Identity"
        color="#d7b56d"
      />

      <RoomDoor
        position={[0, 1, -7.6]}
        label="LOVE"
        room="Love"
        color="#ff9fbd"
      />

      <RoomDoor
        position={[5, 1, -7.6]}
        label="CREATIVITY"
        room="Creativity"
        color="#9fc3ff"
      />
    </>
  );
}
