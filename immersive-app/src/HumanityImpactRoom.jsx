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

      {/* Temporary title — STEP 1 */}
      <Text
        position={[0, 5.8, -9.7]}
        fontSize={0.62}
        color="#d7b56d"
        anchorX="center"
        anchorY="middle"
      >
        HUMANITY IMPACT
      </Text>

      <Text
        position={[0, 4.9, -9.7]}
        fontSize={0.25}
        color="#6b5a3f"
        anchorX="center"
        anchorY="middle"
      >
        Together we create real impact.
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
