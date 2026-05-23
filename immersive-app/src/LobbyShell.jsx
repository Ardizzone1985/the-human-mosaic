export default function LobbyShell() {
  return (
    <>
      {/* Cinematic lobby lights */}
      <ambientLight intensity={0.18} color="#ffd8a8" />

      <pointLight
        position={[0, 5.2, -5]}
        intensity={3.4}
        distance={20}
        color="#d7b56d"
      />

      <pointLight
        position={[-5, 3.5, -6]}
        intensity={1.7}
        distance={12}
        color="#d7b56d"
      />

      <pointLight
        position={[5, 3.5, -6]}
        intensity={1.7}
        distance={12}
        color="#d7b56d"
      />

      {/* Premium lobby floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.25, 0]} receiveShadow>
        <planeGeometry args={[34, 28]} />
        <meshStandardMaterial
  color="#8a2d10"
  roughness={0.22}
  metalness={0.34}
  emissive="#2a0703"
  emissiveIntensity={0.18}
/>
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 2.6, -9]}>
        <boxGeometry args={[24, 8.5, 0.35]} />
        <meshStandardMaterial color="#1b0904" roughness={0.62} />
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

      {/* Deep cinematic ceiling */}
<mesh position={[0, 6.95, 0]} rotation={[Math.PI / 2, 0, 0]}>
  <planeGeometry args={[34, 28]} />
  <meshStandardMaterial
    color="#070202"
    roughness={0.68}
    metalness={0.12}
    emissive="#120402"
    emissiveIntensity={0.18}
  />
</mesh>

{/* Central ceiling light panel */}
<mesh position={[0, 6.78, -1]}>
  <boxGeometry args={[12, 0.08, 0.22]} />
  <meshStandardMaterial
    color="#d7b56d"
    emissive="#d7b56d"
    emissiveIntensity={0.75}
    metalness={0.45}
    roughness={0.22}
  />
</mesh>

{/* Rear ceiling light panel */}
<mesh position={[0, 6.78, -6.5]}>
  <boxGeometry args={[18, 0.08, 0.22]} />
  <meshStandardMaterial
    color="#b8872b"
    emissive="#d7b56d"
    emissiveIntensity={0.55}
    metalness={0.45}
    roughness={0.24}
  />
</mesh>

{/* Side ceiling light rails */}
<mesh position={[-10.6, 6.78, -1]}>
  <boxGeometry args={[0.18, 0.08, 12]} />
  <meshStandardMaterial
    color="#b8872b"
    emissive="#d7b56d"
    emissiveIntensity={0.45}
    metalness={0.45}
    roughness={0.24}
  />
</mesh>

<mesh position={[10.6, 6.78, -1]}>
  <boxGeometry args={[0.18, 0.08, 12]} />
  <meshStandardMaterial
    color="#b8872b"
    emissive="#d7b56d"
    emissiveIntensity={0.45}
    metalness={0.45}
    roughness={0.24}
  />
</mesh>

      {/* Back wall golden frame */}
      <mesh position={[0, 6.45, -8.75]}>
        <boxGeometry args={[22.5, 0.08, 0.14]} />
        <meshStandardMaterial color="#d7b56d" emissive="#8a4b12" emissiveIntensity={0.5} />
      </mesh>

      <mesh position={[0, -0.95, -8.75]}>
        <boxGeometry args={[22.5, 0.08, 0.14]} />
        <meshStandardMaterial color="#d7b56d" emissive="#8a4b12" emissiveIntensity={0.35} />
      </mesh>

      <mesh position={[-11.25, 2.75, -8.75]}>
        <boxGeometry args={[0.08, 7.45, 0.14]} />
        <meshStandardMaterial color="#d7b56d" emissive="#8a4b12" emissiveIntensity={0.35} />
      </mesh>

      <mesh position={[11.25, 2.75, -8.75]}>
        <boxGeometry args={[0.08, 7.45, 0.14]} />
        <meshStandardMaterial color="#d7b56d" emissive="#8a4b12" emissiveIntensity={0.35} />
      </mesh>

      {/* Golden ceiling frame */}
      <mesh position={[0, 6.82, -7]}>
        <boxGeometry args={[21, 0.08, 0.12]} />
        <meshStandardMaterial color="#d7b56d" emissive="#8a4b12" emissiveIntensity={0.55} metalness={0.35} roughness={0.25} />
      </mesh>

      <mesh position={[0, 6.82, 5]}>
        <boxGeometry args={[21, 0.08, 0.12]} />
        <meshStandardMaterial color="#d7b56d" emissive="#8a4b12" emissiveIntensity={0.45} metalness={0.35} roughness={0.25} />
      </mesh>

      <mesh position={[-10.5, 6.82, -1]}>
        <boxGeometry args={[0.12, 0.08, 12]} />
        <meshStandardMaterial color="#d7b56d" emissive="#8a4b12" emissiveIntensity={0.45} metalness={0.35} roughness={0.25} />
      </mesh>

      <mesh position={[10.5, 6.82, -1]}>
        <boxGeometry args={[0.12, 0.08, 12]} />
        <meshStandardMaterial color="#d7b56d" emissive="#8a4b12" emissiveIntensity={0.45} metalness={0.35} roughness={0.25} />
      </mesh>
    </>
  );
}
