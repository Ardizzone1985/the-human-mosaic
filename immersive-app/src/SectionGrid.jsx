export default function SectionGrid({
  wall = "front",
  section = "F1",
  index = 0,
  color = "#3a2418"
}) {
  const rows = 5;
  const cols = 10;

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
      {/* section frame */}
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[3.1, 3.2, 0.08]} />
        <meshStandardMaterial color="#2a160d" />
      </mesh>

      {/* section label */}
      <mesh position={[0, 1.75, 0.03]}>
        <boxGeometry args={[3.1, 0.08, 0.06]} />
        <meshStandardMaterial color="#b98942" />
      </mesh>

      {Array.from({ length: rows * cols }).map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);

        return (
          <mesh
            key={`${section}-${i}`}
            position={[-1.35 + col * 0.3, 1.1 - row * 0.48, 0.04]}
          >
            <boxGeometry args={[0.22, 0.22, 0.035]} />
            <meshStandardMaterial
              color={color}
              roughness={0.45}
              metalness={0.12}
            />
          </mesh>
        );
      })}
    </group>
  );
}
