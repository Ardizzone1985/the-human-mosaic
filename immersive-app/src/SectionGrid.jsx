export default function SectionGrid({
  wall = "front",
  section = "F1",
  index = 0,
  color = "#3a2418"
}) {
  const rows = 3;
  const cols = 6;

  function getBasePosition() {
    const gap = 3.4;

    if (wall === "front") {
      return [-7.2 + index * gap, 3.2, -9.55];
    }

    if (wall === "left") {
      return [-10.55, 3.2, -5.8 + index * gap];
    }

    if (wall === "right") {
      return [10.55, 3.2, -5.8 + index * gap];
    }

    return [0, 3.2, -9.55];
  }

  function getRotation() {
    if (wall === "left") return [0, Math.PI / 2, 0];
    if (wall === "right") return [0, -Math.PI / 2, 0];
    return [0, 0, 0];
  }

  const base = getBasePosition();
  const rotation = getRotation();

  return (
    <group position={base} rotation={rotation}>
      {/* warm back glow */}
      <mesh position={[0, 0, -0.08]}>
        <planeGeometry args={[4.15, 4.85]} />
        <meshBasicMaterial
          color="#f2efe8"
          transparent
          opacity={0.18}
        />
      </mesh>

      {/* premium floating section panel */}
<mesh position={[0, 0, -0.04]}>
  <boxGeometry args={[4.0, 4.7, 0.09]} />
  <meshStandardMaterial
    color="#f2efe8"
    roughness={0.82}
    metalness={0.02}
    emissive="#ffffff"
    emissiveIntensity={0.015}
  />
</mesh>
      
      {/* top golden rail */}
      <mesh position={[0, 1.75, 0.035]}>
        <boxGeometry args={[4.15, 0.07, 0.08]} />
        <meshStandardMaterial
          color="#d7b56d"
          roughness={0.28}
          metalness={0.35}
        />
      </mesh>

      {/* bottom golden rail */}
      <mesh position={[0, -1.75, 0.035]}>
        <boxGeometry args={[4.15, 0.07, 0.08]} />
        <meshStandardMaterial
          color="#b98942"
          roughness={0.3}
          metalness={0.28}
        />
      </mesh>

      {Array.from({ length: rows * cols }).map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);

        return (
          <mesh
            key={`${section}-${i}`}
            position={[-1.35 + col * 0.3, 1.1 - row * 0.48, 0.075]}
          >
            <boxGeometry args={[0.22, 0.22, 0.045]} />
            <meshStandardMaterial
              color={color}
              roughness={0.38}
              metalness={0.14}
            />
          </mesh>
        );
      })}
    </group>
  );
}
