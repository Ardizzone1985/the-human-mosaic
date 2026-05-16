export default function RoomShell() {
  return (
    <>
      <ambientLight intensity={0.7} color="#ffe2b8" />

      <directionalLight
  position={[5, 8, 5]}
  intensity={2.5}
  color="#ffd6a3"
  castShadow
/>

      <pointLight
        position={[0, 4, 3]}
        intensity={9}
        distance={24}
        color="#ffd0a0"
      />

      {/* Real parquet floor */}
<group position={[0, -1.18, 1]}>
  {Array.from({ length: 160 }).map((_, i) => {
    const row = Math.floor(i / 20);
    const col = i % 20;

    const isEvenRow = row % 2 === 0;
    const x = -9.5 + col * 1;
    const z = -8.5 + row * 1.1;

    return (
      <mesh
        key={`parquet-${i}`}
        rotation={[-Math.PI / 2, 0, isEvenRow ? Math.PI / 4 : -Math.PI / 4]}
        position={[x, 0, z]}
        receiveShadow
      >
        <boxGeometry args={[1.4, 0.035, 0.42]} />
        <meshStandardMaterial
          color={isEvenRow ? "#7a421f" : "#5f3218"}
          roughness={0.32}
          metalness={0.18}
        />
      </mesh>
    );
  })}
</group>

      {/* Back wall */}
      <mesh position={[0, 3, -6]}>
        <planeGeometry args={[22, 10]} />
        <meshStandardMaterial
          color="#6a533f"
          roughness={0.48}
          metalness={0.15}
        />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-11, 3, 1]}>
        <planeGeometry args={[22, 10]} />
        <meshStandardMaterial
          color="#4a3729"
          roughness={0.55}
          metalness={0.12}
        />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[11, 3, 1]}>
        <planeGeometry args={[22, 10]} />
        <meshStandardMaterial
          color="#4a3729"
          roughness={0.55}
          metalness={0.12}
        />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 8, 1]}>
        <planeGeometry args={[26, 22]} />
        <meshStandardMaterial
          color="#221914"
          roughness={0.72}
          metalness={0.08}
        />
      </mesh>

      {/* Back wall frame */}
      <mesh position={[0, 8.05, -5.9]}>
        <boxGeometry args={[22, 0.08, 0.12]} />
        <meshStandardMaterial color="#d7b56d" emissive="#6a4216" emissiveIntensity={0.4} />
      </mesh>

      <mesh position={[0, -0.95, -5.9]}>
        <boxGeometry args={[22, 0.08, 0.12]} />
        <meshStandardMaterial color="#d7b56d" emissive="#6a4216" emissiveIntensity={0.4} />
      </mesh>

      <mesh position={[-10.95, 3.5, -5.9]}>
        <boxGeometry args={[0.08, 9, 0.12]} />
        <meshStandardMaterial color="#d7b56d" emissive="#6a4216" emissiveIntensity={0.4} />
      </mesh>

      <mesh position={[10.95, 3.5, -5.9]}>
        <boxGeometry args={[0.08, 9, 0.12]} />
        <meshStandardMaterial color="#d7b56d" emissive="#6a4216" emissiveIntensity={0.4} />
      </mesh>
    </>
  );
}
