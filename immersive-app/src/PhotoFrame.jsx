export default function PhotoFrame({
  position,
  rotation,
  imageColor = "#d9b66f"
}) {
  return (
    <group position={position} rotation={rotation}>

      {/* FRAME */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[1.28, 1.08, 0.08]} />
        <meshStandardMaterial
          color="#6e3f1d"
          roughness={0.6}
        />
      </mesh>

      {/* PHOTO */}
      <mesh>
        <planeGeometry args={[1.15, 0.95]} />
        <meshStandardMaterial
          color={imageColor}
        />
      </mesh>

    </group>
  );
}
