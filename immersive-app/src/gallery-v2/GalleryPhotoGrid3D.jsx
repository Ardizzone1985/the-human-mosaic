import { Text } from "@react-three/drei";

export default function GalleryPhotoGrid3D({
  room = "Identity",
  wall = "Front",
  sectionNumber,
  viewNumber,
}) {
  const SLOTS_PER_VIEW = 40;

  return (
  <group>
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 10 }).map((_, column) => {
          const x = -5.85 + column * 1.3;
          const y = 3.8 - row * 1.3;

          const slotNumber =
            (sectionNumber - 1) * 600 +
            (viewNumber - 1) * SLOTS_PER_VIEW +
            row * 10 +
            column +
            1;

          return (
            <group
              key={`${row}-${column}`}
              position={[x, y, -3.95]}
            >
              <mesh>
                <planeGeometry args={[1, 1]} />
                <meshStandardMaterial
                  color="#f7f5ef"
                  roughness={0.7}
                  metalness={0.05}
                />
              </mesh>

              <Text
                position={[0, 0, 0.02]}
                fontSize={0.22}
                color="#222222"
                anchorX="center"
                anchorY="middle"
              >
                {slotNumber}
              </Text>
            </group>
          );
        })
      )}
        <group
  position={
    wall === "Left"
      ? [-3.05, 0, -3.05]
      : [0, 0, 0]
  }
  rotation={
    wall === "Left"
      ? [0, Math.PI / 2, 0]
      : [0, 0, 0]
  }
>
  );
}
