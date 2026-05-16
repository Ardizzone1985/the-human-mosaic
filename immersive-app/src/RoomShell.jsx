export default function RoomShell() {
  return (
    <>
      <ambientLight intensity={1.15} />

      <directionalLight
        position={[0, 8, 6]}
        intensity={3.5}
        color="#fff0d0"
      />

      <pointLight
        position={[0, 4, 3]}
        intensity={9}
        distance={24}
        color="#ffd0a0"
      />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 1]}>
        <planeGeometry args={[26, 22]} />
        <meshStandardMaterial
          color="#5a4938"
          roughness={0.28}
          metalness={0.38}
        />
      </mesh>

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
