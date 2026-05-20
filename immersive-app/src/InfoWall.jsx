import { useState } from "react";
import { Text, useTexture } from "@react-three/drei";

const ROOM_TEXT = {
  Identity: {
    title: "IDENTITY ROOM",
    description:
      "A permanent immersive digital museum where every image becomes part of a global human mosaic."
  },
  Love: {
    title: "LOVE ROOM",
    description:
      "A room dedicated to emotional bonds, people, pets, passions and meaningful moments."
  },
  Creativity: {
    title: "CREATIVITY ROOM",
    description:
      "A space for artworks, visual expression, photography, imagination and creative identity."
  }
};

function AdSpace({ position, label = "FUTURE AD SPACE" }) {
  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[3.4, 1.35]} />
        <meshStandardMaterial color="#3a2418" roughness={0.45} />
      </mesh>

      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[3.55, 1.5]} />
        <meshStandardMaterial color="#d7b56d" roughness={0.35} />
      </mesh>

      <mesh position={[0, 0, 0.08]}>
        <planeGeometry args={[3.25, 1.22]} />
        <meshStandardMaterial color="#2a1208" roughness={0.55} />
      </mesh>

      <Text
        position={[0, 0, 0.14]}
        fontSize={0.15}
        color="#d7b56d"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

export default function InfoWall({ room = "Identity" }) {
    const roomInfo = ROOM_TEXT[room] || ROOM_TEXT.Identity;
  const [doorHovered, setDoorHovered] = useState(false);
  const logoTexture = useTexture("/logo-cropped.png");

  function goHome() {
    window.location.href = "/";
  }

  return (
    <group position={[0, 2.8, 12.5]} rotation={[0, Math.PI, 0]}>
      {/* Back info wall */}
      <mesh>
       
  <boxGeometry args={[18, 8, 0.28]} />
        <meshStandardMaterial
  color="#211008"
  roughness={0.42}
  metalness={0.18}
  emissive="#2a1408"
  emissiveIntensity={0.08}
/>
      </mesh>

        {/* Top cinematic rail */}
<mesh position={[0, 3.95, 0.16]}>
  <boxGeometry args={[18.2, 0.08, 0.08]} />
  <meshStandardMaterial
    color="#d7b56d"
    emissive="#d7b56d"
    emissiveIntensity={0.45}
  />
</mesh>

{/* Bottom cinematic rail */}
<mesh position={[0, -3.95, 0.16]}>
  <boxGeometry args={[18.2, 0.08, 0.08]} />
  <meshStandardMaterial
    color="#b98942"
    emissive="#8a4b12"
    emissiveIntensity={0.25}
  />
</mesh>

      {/* Official logo */}
<mesh position={[-7.2, 2.15, 0.24]}>
  <planeGeometry args={[2.1, 1.05]} />
  <meshBasicMaterial map={logoTexture} transparent />
</mesh>

            {/* Project title */}
      <Text
        position={[-4.75, 2.28, 0.22]}
        fontSize={0.58}
        color="#f2c879"
        anchorX="left"
        anchorY="middle"
      >
        THE HUMAN MOSAIC
      </Text>

      <Text
        position={[-5.65, 1.72, 0.22]}
        fontSize={0.26}
        color="#ffffff"
        anchorX="left"
        anchorY="middle"
      >
        {roomInfo.title}
      </Text>

      <Text
        position={[-5.65, 1.05, 0.22]}
        fontSize={0.17}
        color="#d8c7ad"
        anchorX="left"
        anchorY="middle"
        maxWidth={4.9}
      >
        {roomInfo.description}
      </Text>

      <Text
        position={[-5.65, 0.15, 0.09]}
        fontSize={0.15}
        color="#f2c879"
        anchorX="left"
        anchorY="middle"
      >
        Explore. Discover. Be part of the story.
      </Text>

      {/* Ad spaces */}
      <AdSpace position={[2.5, 1.65, 0.22]} label="FUTURE AD SPACE" />
      <AdSpace position={[5.9, 1.65, 0.22]} label="PARTNER SPACE" />
      <AdSpace position={[2.5, -0.1, 0.22]} label="SPONSOR SPACE" />

     {/* Exit door */}
<group
  position={[5.7, -2.25, 0.24]}
  scale={doorHovered ? 1.08 : 1}
  onPointerOver={(e) => {
    e.stopPropagation();
    setDoorHovered(true);
    document.body.style.cursor = "pointer";
  }}
  onPointerOut={(e) => {
    e.stopPropagation();
    setDoorHovered(false);
    document.body.style.cursor = "default";
  }}
  onClick={(e) => {
    e.stopPropagation();
    goHome();
  }}
>
  <mesh position={[0, 0, -0.08]}>
    <boxGeometry args={[1.95, 2.95, 0.16]} />
    <meshStandardMaterial
      color={doorHovered ? "#d7b56d" : "#5a3a16"}
      emissive="#d7b56d"
      emissiveIntensity={doorHovered ? 0.65 : 0.2}
      roughness={0.34}
      metalness={0.28}
    />
  </mesh>

  <mesh>
    <boxGeometry args={[1.45, 2.45, 0.18]} />
    <meshStandardMaterial
      color="#3b1f12"
      roughness={0.42}
      metalness={0.18}
      emissive="#d7b56d"
      emissiveIntensity={doorHovered ? 0.28 : 0.08}
    />
  </mesh>

  <mesh position={[0, 0, 0.12]}>
    <boxGeometry args={[1.08, 1.95, 0.04]} />
    <meshStandardMaterial color="#160703" roughness={0.65} />
  </mesh>

  <mesh position={[0.58, 0, 0.22]}>
    <sphereGeometry args={[0.055, 16, 16]} />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={doorHovered ? 0.75 : 0.28}
      metalness={0.8}
      roughness={0.22}
    />
  </mesh>

  <mesh position={[0, 1.34, 0.14]}>
    <boxGeometry args={[1.75, 0.1, 0.1]} />
    <meshStandardMaterial color="#d7b56d" />
  </mesh>

  <Text
    position={[0, 1.68, 0.22]}
    fontSize={0.15}
    color={doorHovered ? "#ffffff" : "#f2c879"}
    anchorX="center"
    anchorY="middle"
  >
    EXIT / HOME
  </Text>

  <Text
    position={[0, 1.44, 0.22]}
    fontSize={0.1}
    color={doorHovered ? "#ffffff" : "#d8c7ad"}
    anchorX="center"
    anchorY="middle"
  >
    Click to return
  </Text>
</group>
    </group>
  );
}
