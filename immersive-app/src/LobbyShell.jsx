export default function LobbyShell() {
  return (
    <>
      {/* Premium lobby floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.25, 0]}>
        <planeGeometry args={[34, 28]} />
        <meshStandardMaterial
          color="#7a260d"
          roughness={0.42}
          metalness={0.08}
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 2.6, -9]}>
        <boxGeometry args={[24, 8.5, 0.35]} />
        <meshStandardMaterial color="#1b0904" roughness={0.65} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-12, 2.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[18, 8.5, 0.35]} />
        <meshStandardMaterial color="#271008" roughness={0.65} />
      </mesh>

      {/* Right wall */}
      <mesh position={[12, 2.6, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[18, 8.5, 0.35]} />
        <meshStandardMaterial color="#271008" roughness={0.65} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 6.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[34, 28]} />
        <meshStandardMaterial color="#070302" roughness={0.8} />
      </mesh>

      {/* Golden ceiling frame */}
      <mesh position={[0, 6.82, -7]}>
        <boxGeometry args={[21, 0.08, 0.12]} />
        <meshStandardMaterial color="#d7b56d" metalness={0.35} roughness={0.25} />
      </mesh>

      <mesh position={[0, 6.82, 5]}>
        <boxGeometry args={[21, 0.08, 0.12]} />
        <meshStandardMaterial color="#d7b56d" metalness={0.35} roughness={0.25} />
      </mesh>

      <mesh position={[-10.5, 6.82, -1]}>
        <boxGeometry args={[0.12, 0.08, 12]} />
        <meshStandardMaterial color="#d7b56d" metalness={0.35} roughness={0.25} />
      </mesh>

      <mesh position={[10.5, 6.82, -1]}>
        <boxGeometry args={[0.12, 0.08, 12]} />
        <meshStandardMaterial color="#d7b56d" metalness={0.35} roughness={0.25} />
      </mesh>
    </>
  );
}
