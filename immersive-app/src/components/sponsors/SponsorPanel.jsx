import { Text, useTexture } from "@react-three/drei";
import useSponsors from "../../hooks/useSponsors.js";
import fallbackLogo from "../../logo-cropped.png";

export default function SponsorPanel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  label = "PARTNER SPACE",
  placement,
}) {
    if (!placement) {
    console.warn("SponsorPanel: missing placement");
  }

  const sponsor = useSponsors(placement);
  const sponsorTexture = useTexture(
  sponsor?.image || fallbackLogo
);
  
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
      {sponsor?.active ? (
  <>
  {sponsor.image && (
    <mesh position={[0, 0.12, 0.095]}>
      <planeGeometry args={[2.6, 0.75]} />

      <meshBasicMaterial
        map={sponsorTexture}
        transparent
        toneMapped={false}
      />
    </mesh>
  )}

  <Text
    position={[0, -0.38, 0.1]}
    fontSize={0.09}
    color="#8a6a2f"
    anchorX="center"
    anchorY="middle"
    maxWidth={2.75}
    textAlign="center"
  >
    {sponsor.title}
  </Text>
</>
) : (
  <>
    <Text
      position={[0, 0.13, 0.09]}
      fontSize={0.15}
      color="#4d4031"
      anchorX="center"
      anchorY="middle"
    >
      {label}
    </Text>

    <Text
      position={[0, -0.17, 0.09]}
      fontSize={0.08}
      color="#8a6a2f"
      anchorX="center"
      anchorY="middle"
      maxWidth={2.7}
      textAlign="center"
    >
      Become a partner of The Human Mosaic
    </Text>
  </>
)}
    </group>
  );
}
