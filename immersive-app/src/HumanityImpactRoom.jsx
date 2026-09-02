import { useState } from "react";
import { Text } from "@react-three/drei";
import RoomShell from "./RoomShell.jsx";

export default function HumanityImpactRoom() {
  const [doorHovered, setDoorHovered] = useState(false);

  function goHome() {
    window.dispatchEvent(new Event("startFadeOut"));

    setTimeout(() => {
      window.history.pushState({}, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }, 450);
  }

  const impactTheme = {
    ambient: "#f4dfb7",
    directional: "#ffe2a8",
    glow: "#d7b56d",
    side: "#6b5128",
  };

  return (
    <>
      <RoomShell theme={impactTheme} />

      {/* HERO WALL — Humanity Impact */}

{/* Main dark museum panel */}
<mesh position={[0, 4.3, -9.72]}>
  <boxGeometry args={[12.8, 5.9, 0.18]} />
  <meshStandardMaterial
    color="#120d08"
    roughness={0.46}
    metalness={0.18}
    emissive="#2a1606"
    emissiveIntensity={0.08}
  />
</mesh>

{/* Outer gold frame */}
<mesh position={[0, 7.25, -9.60]}>
  <boxGeometry args={[13.1, 0.08, 0.08]} />
  <meshStandardMaterial
    color="#d7b56d"
    emissive="#d7b56d"
    emissiveIntensity={0.65}
    metalness={0.72}
    roughness={0.22}
  />
</mesh>

<mesh position={[0, 1.35, -9.60]}>
  <boxGeometry args={[13.1, 0.08, 0.08]} />
  <meshStandardMaterial
    color="#d7b56d"
    emissive="#d7b56d"
    emissiveIntensity={0.45}
    metalness={0.72}
    roughness={0.22}
  />
</mesh>

<mesh position={[-6.52, 4.3, -9.60]}>
  <boxGeometry args={[0.08, 5.95, 0.08]} />
  <meshStandardMaterial
    color="#d7b56d"
    emissive="#d7b56d"
    emissiveIntensity={0.45}
    metalness={0.72}
    roughness={0.22}
  />
</mesh>

<mesh position={[6.52, 4.3, -9.60]}>
  <boxGeometry args={[0.08, 5.95, 0.08]} />
  <meshStandardMaterial
    color="#d7b56d"
    emissive="#d7b56d"
    emissiveIntensity={0.45}
    metalness={0.72}
    roughness={0.22}
  />
</mesh>

{/* Title */}
<Text
  position={[0, 6.35, -9.48]}
  fontSize={0.62}
  color="#f2c879"
  anchorX="center"
  anchorY="middle"
  letterSpacing={0.08}
>
  HUMANITY IMPACT
</Text>

{/* Subtitle */}
<Text
  position={[0, 5.55, -9.48]}
  fontSize={0.24}
  color="#e5d6bb"
  anchorX="center"
  anchorY="middle"
>
  Together we create real impact.
</Text>

{/* Intro */}
<Text
  position={[0, 4.82, -9.48]}
  fontSize={0.17}
  color="#bda989"
  anchorX="center"
  anchorY="middle"
  maxWidth={9.5}
  textAlign="center"
>
  Every contribution to The Human Mosaic helps transform a global artwork into real-world action.
</Text>

{/* Divider */}
<mesh position={[0, 4.18, -9.47]}>
  <boxGeometry args={[9.8, 0.025, 0.03]} />
  <meshBasicMaterial
    color="#d7b56d"
    transparent
    opacity={0.55}
  />
</mesh>

{/* Placeholder labels */}
<Text
  position={[-4, 3.25, -9.46]}
  fontSize={0.18}
  color="#f2c879"
  anchorX="center"
  anchorY="middle"
  letterSpacing={0.08}
>
  PEOPLE IN THE MOSAIC
</Text>

<Text
  position={[0, 3.25, -9.46]}
  fontSize={0.18}
  color="#f2c879"
  anchorX="center"
  anchorY="middle"
  letterSpacing={0.08}
>
  DONATIONS COMPLETED
</Text>

<Text
  position={[4, 3.25, -9.46]}
  fontSize={0.18}
  color="#f2c879"
  anchorX="center"
  anchorY="middle"
  letterSpacing={0.08}
>
  TOTAL DONATED
</Text>

{/* Temporary values */}
<Text
  position={[-4, 2.55, -9.46]}
  fontSize={0.52}
  color="#ffffff"
  anchorX="center"
  anchorY="middle"
>
  —
</Text>

<Text
  position={[0, 2.55, -9.46]}
  fontSize={0.52}
  color="#ffffff"
  anchorX="center"
  anchorY="middle"
>
  —
</Text>

<Text
  position={[4, 2.55, -9.46]}
  fontSize={0.52}
  color="#ffffff"
  anchorX="center"
  anchorY="middle"
>
  —
</Text>
      
      {/* Rear wall — HOME wall */}
<mesh position={[0, 4, 10.85]}>
  <boxGeometry args={[22, 12, 0.28]} />

  <meshStandardMaterial
  color="#d8d0c3"
  roughness={0.72}
  metalness={0.04}
  emissive="#f2efe8"
  emissiveIntensity={0.02}
/>
</mesh>

      {/* HOME door */}
      <group
        position={[0, 0.55, 10.55]}
        rotation={[0, Math.PI, 0]}
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
        {/* Outer frame */}
        <mesh position={[0, 0, -0.08]}>
          <boxGeometry args={[2.4, 3.7, 0.18]} />
          <meshStandardMaterial
            color={doorHovered ? "#d7b56d" : "#5a3a16"}
            emissive="#d7b56d"
            emissiveIntensity={doorHovered ? 0.6 : 0.18}
            roughness={0.34}
            metalness={0.28}
          />
        </mesh>

        {/* Door */}
        <mesh>
          <boxGeometry args={[1.85, 3.2, 0.2]} />
          <meshStandardMaterial
            color="#3b1f12"
            roughness={0.42}
            metalness={0.18}
          />
        </mesh>

        {/* Black inset */}
        <mesh position={[0, 0, 0.12]}>
          <boxGeometry args={[1.45, 2.65, 0.04]} />
          <meshStandardMaterial
            color="#160703"
            roughness={0.65}
          />
        </mesh>

        {/* Handle */}
        <mesh position={[0.72, 0, 0.22]}>
          <sphereGeometry args={[0.065, 16, 16]} />
          <meshStandardMaterial
            color="#d7b56d"
            emissive="#d7b56d"
            emissiveIntensity={doorHovered ? 0.75 : 0.28}
            metalness={0.8}
            roughness={0.22}
          />
        </mesh>

        <Text
          position={[0, 0.35, 0.25]}
          fontSize={0.25}
          color="#f2c879"
          anchorX="center"
          anchorY="middle"
        >
          HOME
        </Text>

        <Text
          position={[0, -0.08, 0.25]}
          fontSize={0.12}
          color="#d8c7ad"
          anchorX="center"
          anchorY="middle"
        >
          Return to Lobby
        </Text>
      </group>
    </>
  );
}
