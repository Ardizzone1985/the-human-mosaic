import { useState } from "react";
import { Text } from "@react-three/drei";
import LobbyShell from "./LobbyShell.jsx";

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
      scale={hovered ? 1.06 : 1}
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
      <mesh position={[0, 0, -0.16]}>
        <boxGeometry args={[2.55, 4.65, 0.12]} />
        <meshStandardMaterial
          color={hovered ? color : "#7a5a26"}
          emissive={color}
          emissiveIntensity={hovered ? 0.65 : 0.22}
        />
      </mesh>

      <mesh>
        <boxGeometry args={[2, 4, 0.22]} />
        <meshStandardMaterial
          color="#2a1208"
          roughness={0.5}
          metalness={0.12}
          emissive={color}
          emissiveIntensity={hovered ? 0.32 : 0.1}
        />
      </mesh>

      <mesh position={[0, 0, 0.14]}>
        <boxGeometry args={[1.65, 3.55, 0.04]} />
        <meshStandardMaterial color="#160703" roughness={0.65} />
      </mesh>

      <Text
        position={[0, 2.75, 0.22]}
        fontSize={0.28}
        color={hovered ? "#ffffff" : color}
        anchorX="center"
      >
        {label}
      </Text>

      <Text
        position={[0, -2.45, 0.22]}
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

      <Text
        position={[0, 5.25, -7.7]}
        fontSize={0.62}
        color="#d7b56d"
        anchorX="center"
      >
        THE HUMAN MOSAIC
      </Text>

      <Text
        position={[0, 4.42, -7.7]}
        fontSize={0.22}
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
