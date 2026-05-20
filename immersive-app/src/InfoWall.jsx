import { useState } from "react";
import { Text } from "@react-three/drei";

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

  function goHome() {
    window.location.href = "/";
  }

  return (
    <group position={[0, 2.8, 12.5]} rotation={[0, Math.PI, 0]}>
      {/* Back info wall */}
      <mesh>
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

            {/* Project title */}
      <Text
        position={[-5.65, 2.28, 0.09]}
        fontSize={0.58}
        color="#f2c879"
        anchorX="left"
        anchorY="middle"
      >
        THE HUMAN MOSAIC
      </Text>

      <Text
        position={[-5.65, 1.72, 0.09]}
        fontSize={0.26}
        color="#ffffff"
        anchorX="left"
        anchorY="middle"
      >
        {roomInfo.title}
      </Text>

      <Text
        position={[-5.65, 1.05, 0.09]}
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
      <AdSpace position={[2.5, 1.65, 0.08]} label="FUTURE AD SPACE" />
      <AdSpace position={[5.9, 1.65, 0.08]} label="PARTNER SPACE" />
      <AdSpace position={[2.5, -0.1, 0.08]} label="SPONSOR SPACE" />

      {/* Exit door */}
<group
  position={[5.7, -2.25, 0.1]}
  scale={doorHovered ? 1.06 : 1}
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
  <mesh position={[0, 0, -0.04]}>
    <boxGeometry args={[1.75, 2.75, 0.12]} />
    <meshStandardMaterial
      color={doorHovered ? "#d7b56d" : "#5a3a16"}
      emissive="#d7b56d"
      emissiveIntensity={doorHovered ? 0.55 : 0.18}
    />
  </mesh>

  <mesh>
    <boxGeometry args={[1.45, 2.45, 0.14]} />
    <meshStandardMaterial
      color="#3b1f12"
      roughness={0.48}
      metalness={0.12}
      emissive="#d7b56d"
      emissiveIntensity={doorHovered ? 0.22 : 0.06}
    />
  </mesh>

  <mesh position={[0, 1.32, 0.08]}>
    <boxGeometry args={[1.75, 0.12, 0.12]} />
    <meshStandardMaterial color="#d7b56d" />
  </mesh>

  <Text
    position={[0, 1.65, 0.13]}
    fontSize={0.15}
    color={doorHovered ? "#ffffff" : "#f2c879"}
    anchorX="center"
    anchorY="middle"
  >
    EXIT / HOME
  </Text>

  <Text
    position={[0, 1.42, 0.13]}
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
