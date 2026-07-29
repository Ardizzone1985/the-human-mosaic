import { Text } from "@react-three/drei";

export default function SponsorPanel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  label = "PARTNER SPACE",
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Outer wood frame */}
      <mesh>
        <boxGeometry args={[3.72, 1.68, 0.12]} />

        <meshStandardMaterial
          color="#9b6a2f"
          roughness={0.55}
          metalness={0.12}
        />
      </mesh>

      {/* Inner golden frame */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[3.55, 1.52, 0.05]} />

        <meshStandardMaterial
          color="#d8b36d"
          roughness={0.32}
          metalness={0.38}
          emissive="#d8b36d"
          emissiveIntensity={0.08}
        />
      </mesh>

      {/* Internal canvas */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[3.22, 1.22, 0.03]} />

        <meshStandardMaterial
          color="#efe8dd"
          roughness={0.88}
          metalness={0}
        />
      </mesh>

      {/* Placeholder title */}
      <Text
        position={[0, 0, 0.09]}
        fontSize={0.16}
        color="#4d4031"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}
