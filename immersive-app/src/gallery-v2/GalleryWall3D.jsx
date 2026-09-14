export default function GalleryWall3D() {
  return (
  <>
    <mesh position={[0, 2, -4]}>
      <planeGeometry args={[14, 8]} />
      <meshStandardMaterial
        color="#e8e3d8"
        roughness={0.75}
        metalness={0.05}
      />
    </mesh>

    {Array.from({ length: 10 }).map((_, index) => {
      const x = -5.85 + index * 1.3;

      return (
        <mesh
          key={index}
          position={[x, 3.8, -3.95]}
        >
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#f7f5ef"
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>
      );
    })}
  </>
);
}
