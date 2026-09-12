export default function GalleryWall3D() {
  return (
    <mesh position={[0, 2, -4]}>
      <planeGeometry args={[6, 4]} />

      <meshStandardMaterial
        color="#e8e3d8"
        roughness={0.75}
        metalness={0.05}
      />
    </mesh>
  );
}
