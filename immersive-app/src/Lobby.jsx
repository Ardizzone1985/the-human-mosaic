import { Text } from "@react-three/drei";

function RoomDoor({ position, label, room }) {
  return (
    <group
      position={position}
      onClick={() => {
        window.location.href = `/?room=${room}`;
      }}
    >
      {/* Door */}
      <mesh>
        <boxGeometry args={[2, 4, 0.2]} />
        <meshStandardMaterial
          color="#2a1208"
          emissive="#d7b56d"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Door Frame */}
      <mesh position={[0, 0, -0.12]}>
        <boxGeometry args={[2.3, 4.3, 0.08]} />
        <meshStandardMaterial color="#d7b56d" />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 2.8, 0.15]}
        fontSize={0.28}
        color="#d7b56d"
        anchorX="center"
      >
        {label}
      </Text>
    </group>
  );
}

export default function Lobby() {
  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#3a1408" />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 2, -8]}>
        <boxGeometry args={[20, 8, 0.3]} />
        <meshStandardMaterial color="#1a0703" />
      </mesh>

      {/* Title */}
      <Text
        position={[0, 5.2, -7.7]}
        fontSize={0.6}
        color="#d7b56d"
        anchorX="center"
      >
        THE HUMAN MOSAIC
      </Text>

      <Text
        position={[0, 4.4, -7.7]}
        fontSize={0.22}
        color="#ffffff"
        anchorX="center"
      >
        Choose Your Room
      </Text>

      {/* Doors */}
      <RoomDoor
        position={[-5, 1, -7.6]}
        label="IDENTITY"
        room="Identity"
      />

      <RoomDoor
        position={[0, 1, -7.6]}
        label="LOVE"
        room="Love"
      />

      <RoomDoor
        position={[5, 1, -7.6]}
        label="CREATIVITY"
        room="Creativity"
      />
    </>
  );
}
