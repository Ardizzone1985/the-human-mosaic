import { useState, useRef, useEffect } from "react";
import { Text, useTexture } from "@react-three/drei";
import LobbyShell from "./LobbyShell.jsx";
import logoImage from "./logo-cropped.png";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { supabase } from "./supabaseClient.js";

function FeaturedRoomPhoto({ position, room, color = "#d7b56d" }) {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    async function loadFeaturedPhoto() {
      const { data, error } = await supabase
        .from("submissions")
        .select("image_file_name")
        .eq("room", room)
        .eq("approval_status", "approved")
        .limit(1);

      if (error) {
        console.error("Featured photo error:", error);
        return;
      }

      if (data?.[0]?.image_file_name) {
        setImageUrl(
          "https://cqpujmwfiqbwdsmuwkmb.supabase.co/storage/v1/object/public/images/" +
            data[0].image_file_name
        );
      }
    }

    loadFeaturedPhoto();
  }, [room]);

  const texture = useTexture(imageUrl || logoImage);

  return (
    <group position={position}>
      
      <mesh position={[0, 0.35, 0.03]}>
        <planeGeometry args={[1.45, 1.05]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.22}
          metalness={0.05}
          emissive="#ffffff"
          emissiveIntensity={0.05}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.7, 1.3, 0.05]} />
        <meshStandardMaterial
          color="#120806"
          emissive={color}
          emissiveIntensity={0.12}
          roughness={0.35}
          metalness={0.22}
        />
      </mesh>

      <mesh position={[0, 0.35, -0.04]}>
        <planeGeometry args={[2.1, 1.65]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

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
  <boxGeometry args={[3.45, 5.55, 0.52]} />
      <meshStandardMaterial
        color={hovered ? color : "#6b4a1e"}
        emissive={color}
        emissiveIntensity={hovered ? 1.4 : 0.45}
        roughness={0.34}
        metalness={0.28}
      />
    </mesh>

    <mesh position={[0, 0, 0.02]}>
  <boxGeometry args={[2.65, 4.75, 0.46]} />
      <meshStandardMaterial
        color="#2a1208"
        roughness={0.42}
        metalness={0.22}
        emissive={color}
        emissiveIntensity={hovered ? 0.34 : 0.08}
      />
    </mesh>

    <mesh position={[0, 0, 0.28]}>
  <boxGeometry args={[1.95, 3.95, 0.16]} />
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
      position={[0, 3.45, 0.28]}
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
  <planeGeometry args={[6.8, 8.8]} />
  <meshBasicMaterial
    color={color}
    transparent
    opacity={hovered ? 0.22 : 0.10}
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
      position={[0, -2.85, 0.28]}
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
      
<mesh position={[0, 4.2, 10.55]} rotation={[0, Math.PI, 0]}>
  <planeGeometry args={[7.4, 3.7]} />
  <meshBasicMaterial map={logoTexture} transparent />
</mesh>

      <Text
  position={[0, 6.75, 10.55]}
rotation={[0, Math.PI, 0]}
  fontSize={0.52}
  color="#f2c879"
  anchorX="center"
>
  WELCOME TO
</Text>

     <Text
  position={[0, 1.55, 10.55]}
rotation={[0, Math.PI, 0]}
  fontSize={0.24}
  color="#c9a96b"
  anchorX="center"
  maxWidth={6}
  textAlign="center"
>
  A permanent global immersive artwork
</Text>

      <group
  position={[-8.2, 1.25, 10.55]}
  rotation={[0, Math.PI, 0]}
  onPointerOver={() => {
    document.body.style.cursor = "pointer";
  }}
  onPointerOut={() => {
    document.body.style.cursor = "default";
  }}
  onClick={() => {
    window.dispatchEvent(new Event("startFadeOut"));

    setTimeout(() => {
      window.location.href = "https://thehumanmosaic.art";
    }, 700);
  }}
>
  <mesh position={[0, 0, -0.04]}>
    <boxGeometry args={[1.55, 2.35, 0.14]} />
    <meshStandardMaterial
      color="#3a2418"
      emissive="#8a4b12"
      emissiveIntensity={0.16}
      roughness={0.42}
      metalness={0.18}
    />
  </mesh>

  <mesh position={[0, 0, 0.08]}>
    <boxGeometry args={[1.12, 1.85, 0.08]} />
    <meshStandardMaterial
      color="#140805"
      roughness={0.62}
      metalness={0.12}
    />
  </mesh>

  <mesh position={[0.48, 0, 0.16]}>
    <sphereGeometry args={[0.045, 16, 16]} />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={0.35}
      metalness={0.7}
      roughness={0.25}
    />
  </mesh>

  <Text
    position={[0, 1.35, 0.18]}
    fontSize={0.13}
    color="#f2c879"
    anchorX="center"
    anchorY="middle"
  >
    EXIT
  </Text>
</group>
    
      <Text
 position={[0, 7.45, -7.15]}
  fontSize={0.32}
  color="#bfa66f"
  anchorX="center"
  letterSpacing={0.16}
>
  CHOOSE
</Text>

<Text
  position={[0, 6.95, -7.15]}
  fontSize={0.58}
  color="#f8d890"
  anchorX="center"
  letterSpacing={0.08}
>
  YOUR ROOM
</Text>

<Text
  position={[0, 6.35, -7.15]}
  fontSize={0.16}
  color="#c9a96b"
  anchorX="center"
  maxWidth={6}
  textAlign="center"
>
  Explore the living museum or reserve your place in the artwork
</Text>

      <group
  position={[0, 0.35, 10.55]}
rotation={[0, Math.PI, 0]}
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

    <group position={[11.72, 2.15, -1.2]} rotation={[0, -Math.PI / 2, 0]}>
  <Text
    position={[0, 2.85, 0.18]}
    fontSize={0.28}
    color="#f2c879"
    anchorX="center"
    letterSpacing={0.08}
  >
    WORK IN PROGRESS
  </Text>

  <mesh position={[0, 0, 0]}>
    <boxGeometry args={[2.35, 3.8, 0.18]} />
    <meshStandardMaterial
      color="#3b1f12"
      roughness={0.42}
      metalness={0.18}
      emissive="#d7b56d"
      emissiveIntensity={0.12}
    />
  </mesh>

  <mesh position={[0, 0, 0.12]}>
    <boxGeometry args={[1.7, 2.9, 0.08]} />
    <meshStandardMaterial color="#120603" roughness={0.7} />
  </mesh>

  <mesh position={[0, 2.02, 0.16]}>
    <boxGeometry args={[2.55, 0.08, 0.08]} />
    <meshStandardMaterial color="#d7b56d" emissive="#d7b56d" emissiveIntensity={0.45} />
  </mesh>

  <Text
    position={[0, -2.25, 0.18]}
    fontSize={0.13}
    color="#c9a96b"
    anchorX="center"
  >
    Future project room
  </Text>
</group>

      <FeaturedRoomPhoto
  position={[-6.6, 5.55, -7.35]}
  room="Identity"
  color="#d7b56d"
/>

<FeaturedRoomPhoto
  position={[0, 5.55, -7.35]}
  room="Love"
  color="#ff9fbd"
/>

<FeaturedRoomPhoto
  position={[6.6, 5.55, -7.35]}
  room="Creativity"
  color="#9fc3ff"
/>
      
      <RoomDoor
        position={[-6.6, 1, -7.6]}
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
        position={[6.6, 1, -7.6]}
        label="CREATIVITY"
        room="Creativity"
        color="#9fc3ff"
      />
    </>
  );
}
