export default function SectionGrid({
  wall = "front",
  section = "F1",
  index = 0,
  color = "#3a2418"
}) {
  const rows = 3;
  const cols = 6;

  function getBasePosition() {
    const gap = 3.05;

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
                  
      {Array.from({ length: rows * cols }).map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);

        return (
          <mesh
            key={`${section}-${i}`}
            position={[-1.55 + col * 0.34, 1.35 - row * 0.5, 0.075]}
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
