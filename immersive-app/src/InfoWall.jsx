import { Text } from "@react-three/drei";

export default function InfoWall() {
  function goHome() {
    window.location.href = "/";
  }

  return (
    <group position={[0, 2.8, 12.5]} rotation={[0, Math.PI, 0]}>
      {/* Back info wall */}
      <mesh>
        <planeGeometry args={[18, 8]} />
        <meshStandardMaterial color="#2a1208" roughness={0.55} />
      </mesh>

      {/* Project title */}
      <Text
        position={[-5.5, 2.1, 0.06]}
        fontSize={0.48}
        color="#f2c879"
        anchorX="left"
        anchorY="middle"
      >
        THE HUMAN MOSAIC
      </Text>

      <Text
        position={[-5.5, 1.45, 0.06]}
        fontSize={0.28}
        color="#ffffff"
        anchorX="left"
        anchorY="middle"
      >
        IDENTITY ROOM
      </Text>

      <Text
        position={[-5.5, 0.75, 0.06]}
        fontSize={0.18}
        color="#d8c7ad"
        anchorX="left"
        anchorY="middle"
        maxWidth={4.8}
      >
        A permanent immersive digital museum where every image becomes part of a global human mosaic.
      </Text>

      {/* Advertising placeholder */}
      <mesh position={[3.6, 1.3, 0.05]}>
        <planeGeometry args={[4.2, 2]} />
        <meshStandardMaterial color="#3a2418" roughness={0.45} />
      </mesh>

      <Text
        position={[3.6, 1.35, 0.08]}
        fontSize={0.18}
        color="#d7b56d"
        anchorX="center"
        anchorY="middle"
      >
        FUTURE AD SPACE
      </Text>

      {/* Exit door */}
      <group position={[3.6, -2, 0.08]} onClick={goHome}>
        <mesh>
          <boxGeometry args={[1.4, 2.5, 0.12]} />
          <meshStandardMaterial color="#3b1f12" />
        </mesh>

        <mesh position={[0, 1.32, 0.08]}>
          <boxGeometry args={[1.7, 0.12, 0.12]} />
          <meshStandardMaterial color="#d7b56d" />
        </mesh>

        <Text
          position={[0, 1.65, 0.12]}
          fontSize={0.16}
          color="#f2c879"
          anchorX="center"
          anchorY="middle"
        >
          EXIT / HOME
        </Text>
      </group>
    </group>
  );
}
