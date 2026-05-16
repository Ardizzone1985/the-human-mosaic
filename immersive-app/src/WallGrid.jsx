export default function WallGrid({ wall = "front", color = "#d9b66f" }) {
  const columns = wall === "front" ? 12 : 9;
  const rows = 5;
  const items = columns * rows;

  function getTransform(i) {
    const col = i % columns;
    const row = Math.floor(i / columns);

    if (wall === "front") {
      return {
        position: [-8.8 + col * 1.6, 5.8 - row * 1.25, -5.55],
        rotation: [0, 0, 0]
      };
    }

    if (wall === "left") {
      return {
        position: [-10.55, 5.8 - row * 1.25, -4.5 + col * 1.6],
        rotation: [0, Math.PI / 2, 0]
      };
    }

    return {
      position: [10.55, 5.8 - row * 1.25, -4.5 + col * 1.6],
      rotation: [0, -Math.PI / 2, 0]
    };
  }

  return (
    <>
      {Array.from({ length: items }).map((_, i) => {
        const { position, rotation } = getTransform(i);

        return (
          <mesh key={`${wall}-${i}`} position={position} rotation={rotation}>
            <planeGeometry args={[1.15, 0.95]} />
            <meshStandardMaterial
              color={color}
              roughness={0.38}
              metalness={0.12}
            />
          </mesh>
        );
      })}
    </>
  );
}
