import { useState, useRef } from "react";
import { Text, useTexture } from "@react-three/drei";
import LobbyShell from "./LobbyShell.jsx";
import logoImage from "./logo-cropped.png";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

function RoomDoor({ position, label, room, color = "#d7b56d" }) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();

  useFrame((state) => {
  if (!groupRef.current) return;

  const t = state.clock.elapsedTime;

  // Floating cinematic movement
  groupRef.current.position.y =
    position[1] + Math.sin(t * 1.2 + position[0]) * 0.04;

  // Smooth hover scaling
  const targetScale = hovered ? 1.12 : 1;

  groupRef.current.scale.lerp(
    new THREE.Vector3(targetScale, targetScale, targetScale),
    0.08
  );
});

  function enterRoom() {
  window.dispatchEvent(new Event("startFadeOut"));

  setTimeout(() => {
    window.location.href = `/?room=${room}`;
  }, 900);
}

  return (
  <group
  ref={groupRef}
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
        emissiveIntensity={hovered ? 1.4 : 0.45}
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
      position={[0, 3.08, 0.28]}
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

    {/* Vertical cinematic halo */}
<mesh position={[0, 0, -0.7]}>
  <planeGeometry args={[3.8, 6.4]} />
  <meshBasicMaterial
    color={color}
    transparent
    opacity={hovered ? 0.12 : 0.05}
  />
</mesh>

    {/* Portal wall glow */}
<mesh position={[0, 0.2, -1.05]}>
  <planeGeometry args={[5.2, 7.4]} />
  <meshBasicMaterial
    color={color}
    transparent
    opacity={hovered ? 0.14 : 0.06}
  />
</mesh>

{/* Floor cinematic spill */}
<mesh
  position={[0, -2.92, 1.25]}
  rotation={[-Math.PI / 2, 0, 0]}
>
  <planeGeometry args={[3.8, 4.8]} />
  <meshBasicMaterial
    color={color}
    transparent
    opacity={hovered ? 0.11 : 0.045}
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
  const logoTexture = useTexture(logoImage);
  return (
    <>
      <LobbyShell />
      
<mesh position={[-11.72, 4.2, -2.7]} rotation={[0, Math.PI / 2, 0]}>
  <planeGeometry args={[7.4, 3.7]} />
  <meshBasicMaterial map={logoTexture} transparent />
</mesh>

      <Text
  position={[-11.72, 6.75, -2.7]}
  rotation={[0, Math.PI / 2, 0]}
  fontSize={0.52}
  color="#f2c879"
  anchorX="center"
>
  WELCOME TO
</Text>

     <Text
  position={[-11.72, 1.55, -2.7]}
  rotation={[0, Math.PI / 2, 0]}
  fontSize={0.24}
  color="#c9a96b"
  anchorX="center"
  maxWidth={6}
  textAlign="center"
>
  A permanent global immersive artwork
</Text>
    
      <Text
 position={[0, 6.15, -7.15]}
  fontSize={0.32}
  color="#bfa66f"
  anchorX="center"
  letterSpacing={0.16}
>
  CHOOSE
</Text>

<Text
  position={[0, 5.65, -7.15]}
  fontSize={0.58}
  color="#f8d890"
  anchorX="center"
  letterSpacing={0.08}
>
  YOUR ROOM
</Text>

<Text
  position={[0, 5.08, -7.15]}
  fontSize={0.16}
  color="#c9a96b"
  anchorX="center"
  maxWidth={6}
  textAlign="center"
>
  Explore the living museum or reserve your place in the artwork
</Text>

      <group
  position={[-11.72, 0.25, -2.7]}
rotation={[0, Math.PI / 2, 0]}
  onPointerOver={() => {
    document.body.style.cursor = "pointer";
  }}
  onPointerOut={() => {
    document.body.style.cursor = "default";
  }}
  onClick={() => {
    window.location.href = "https://thehumanmosaic.art/join.html";
  }}
>
  <mesh position={[0, 0, -0.05]}>
    <boxGeometry args={[3.65, 1.25, 0.12]} />
    <meshStandardMaterial
      color="#140805"
      emissive="#8a4b12"
      emissiveIntensity={0.28}
      roughness={0.32}
      metalness={0.35}
    />
  </mesh>

  <mesh position={[0, 0.68, 0]}>
    <boxGeometry args={[3.7, 0.045, 0.08]} />
    <meshStandardMaterial color="#d7b56d" emissive="#d7b56d" emissiveIntensity={0.7} />
  </mesh>

  <mesh position={[0, -0.68, 0]}>
    <boxGeometry args={[3.7, 0.045, 0.08]} />
    <meshStandardMaterial color="#d7b56d" emissive="#d7b56d" emissiveIntensity={0.45} />
  </mesh>

  <Text
    position={[0, 0.22, 0.08]}
    fontSize={0.22}
    color="#f8d890"
    anchorX="center"
    letterSpacing={0.08}
  >
    JOIN THE MOSAIC
  </Text>

  <Text
    position={[0, -0.18, 0.08]}
    fontSize={0.115}
    color="#c9a96b"
    anchorX="center"
    maxWidth={3}
    textAlign="center"
  >
    Reserve your place in the permanent artwork
  </Text>
</group>
      
      <RoomDoor
        position={[-5.8, 1, -7.6]}
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
        position={[5.8, 1, -7.6]}
        label="CREATIVITY"
        room="Creativity"
        color="#9fc3ff"
      />
    </>
  );
}
