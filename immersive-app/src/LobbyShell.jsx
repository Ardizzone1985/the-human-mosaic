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
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial
  color="#8a2d10"
  roughness={0.12}
metalness={0.48}
  emissive="#2a0703"
  emissiveIntensity={0.18}
/>
      </mesh>

      {/* Central cinematic floor glow */}
<mesh
  rotation={[-Math.PI / 2, 0, 0]}
  position={[0, -1.22, -5.8]}
>
  <circleGeometry args={[5.8, 64]} />
  <meshBasicMaterial
    color="#ffcc88"
    transparent
    opacity={0.045}
  />
</mesh>

      {/* Identity reflection */}
<mesh
  rotation={[-Math.PI / 2, 0, 0]}
  position={[-6.6, -1.21, -6.2]}
>
  <planeGeometry args={[2.8, 5]} />
  <meshBasicMaterial
    color="#d7b56d"
    transparent
    opacity={0.055}
  />
</mesh>

{/* Love reflection */}
<mesh
  rotation={[-Math.PI / 2, 0, 0]}
  position={[0, -1.21, -6.2]}
>
  <planeGeometry args={[2.8, 5]} />
  <meshBasicMaterial
    color="#ff9fbd"
    transparent
    opacity={0.05}
  />
</mesh>

{/* Creativity reflection */}
<mesh
  rotation={[-Math.PI / 2, 0, 0]}
  position={[6.6, -1.21, -6.2]}
>
  <planeGeometry args={[2.8, 5]} />
  <meshBasicMaterial
    color="#9fc3ff"
    transparent
    opacity={0.05}
  />
</mesh>

      {/* Back wall */}
      <mesh position={[0, 4.25, -9]}>
  <boxGeometry args={[30, 13.2, 0.35]} />
        <meshStandardMaterial color="#1b0904" roughness={0.62} />
      </mesh>

      {/* Premium door wall architectural panels */}
{[-8, 0, 8].map((x) => (
  <group key={`door-wall-panel-${x}`} position={[x, 3.35, -8.72]}>
    <mesh>
      <boxGeometry args={[5.6, 6.4, 0.08]} />
      <meshStandardMaterial
        color="#241008"
        roughness={0.52}
        metalness={0.08}
        emissive="#120603"
        emissiveIntensity={0.12}
      />
    </mesh>

    <mesh position={[0, 3.25, 0.08]}>
      <boxGeometry args={[5.7, 0.055, 0.08]} />
      <meshStandardMaterial
        color="#d7b56d"
        emissive="#8a4b12"
        emissiveIntensity={0.45}
        metalness={0.35}
        roughness={0.22}
      />
    </mesh>

    <mesh position={[0, -3.25, 0.08]}>
      <boxGeometry args={[5.7, 0.045, 0.08]} />
      <meshStandardMaterial
        color="#8a4b12"
        emissive="#8a4b12"
        emissiveIntensity={0.25}
        metalness={0.25}
        roughness={0.28}
      />
    </mesh>

    <mesh position={[-2.85, 0, 0.08]}>
      <boxGeometry args={[0.055, 6.5, 0.08]} />
      <meshStandardMaterial
        color="#d7b56d"
        emissive="#8a4b12"
        emissiveIntensity={0.32}
        metalness={0.35}
        roughness={0.25}
      />
    </mesh>

    <mesh position={[2.85, 0, 0.08]}>
      <boxGeometry args={[0.055, 6.5, 0.08]} />
      <meshStandardMaterial
        color="#d7b56d"
        emissive="#8a4b12"
        emissiveIntensity={0.32}
        metalness={0.35}
        roughness={0.25}
      />
    </mesh>
  </group>
))}

      {/* Left wall */}
<mesh position={[-15, 4.9, 0.9]} rotation={[0, Math.PI / 2, 0]}>
  <boxGeometry args={[20, 13.2, 0.35]} />
  <meshStandardMaterial color="#271008" roughness={0.65} />
</mesh>

{/* Right wall */}
<mesh position={[15, 4.9, 0.9]} rotation={[0, Math.PI / 2, 0]}>
  <boxGeometry args={[20, 13.2, 0.35]} />
  <meshStandardMaterial color="#271008" roughness={0.65} />
</mesh>

      {/* Entrance / branding wall */}
<mesh position={[0, 4.25, 10.8]}>
  <boxGeometry args={[30, 13.2, 0.35]} />
  <meshStandardMaterial color="#1b0904" roughness={0.62} />
</mesh>

      {/* Welcome wall architectural panels */}

<group position={[-6.5, 4.4, 10.58]}>
  <mesh>
    <boxGeometry args={[4.5, 8.2, 0.08]} />
    <meshStandardMaterial
      color="#3f1f10"
      roughness={0.52}
      metalness={0.08}
      emissive="#120603"
      emissiveIntensity={0.28}
    />
  </mesh>

  <mesh position={[0, 4.1, 0.08]}>
    <boxGeometry args={[4.6, 0.05, 0.08]} />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#8a4b12"
      emissiveIntensity={0.35}
    />
  </mesh>

  <mesh position={[0, -4.1, 0.08]}>
    <boxGeometry args={[4.6, 0.05, 0.08]} />
    <meshStandardMaterial
      color="#8a4b12"
      emissive="#8a4b12"
      emissiveIntensity={0.18}
    />
  </mesh>
</group>

<group position={[6.5, 4.4, 10.58]}>
  <mesh>
    <boxGeometry args={[4.5, 8.2, 0.08]} />
    <meshStandardMaterial
      color="#3f1f10"
      roughness={0.52}
      metalness={0.08}
      emissive="#120603"
      emissiveIntensity={0.28}
    />
  </mesh>

  <mesh position={[0, 4.1, 0.08]}>
    <boxGeometry args={[4.6, 0.05, 0.08]} />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#8a4b12"
      emissiveIntensity={0.35}
    />
  </mesh>

  <mesh position={[0, -4.1, 0.08]}>
    <boxGeometry args={[4.6, 0.05, 0.08]} />
    <meshStandardMaterial
      color="#8a4b12"
      emissive="#8a4b12"
      emissiveIntensity={0.18}
    />
  </mesh>
</group>

      {/* Deep cinematic ceiling */}
<mesh position={[0, 9.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
  <planeGeometry args={[40, 30]} />
  <meshStandardMaterial
    color="#070202"
    roughness={0.68}
    metalness={0.12}
    emissive="#120402"
    emissiveIntensity={0.18}
  />
</mesh>

{/* Central ceiling light panel */}
<mesh position={[0, 9.48, -1]}>
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
<mesh position={[0, 9.48, -6.5]}>
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
<mesh position={[-10.6, 9.48, -1]}>
  <boxGeometry args={[0.18, 0.08, 12]} />
  <meshStandardMaterial
    color="#b8872b"
    emissive="#d7b56d"
    emissiveIntensity={0.45}
    metalness={0.45}
    roughness={0.24}
  />
</mesh>

<mesh position={[10.6, 9.48, -1]}>
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
      <mesh position={[0, 9.15, -8.75]}>
        <boxGeometry args={[28.5, 0.08, 0.14]} />
        <meshStandardMaterial color="#d7b56d" emissive="#8a4b12" emissiveIntensity={0.5} />
      </mesh>

      <mesh position={[0, -0.95, -8.75]}>
        <boxGeometry args={[28.5, 0.08, 0.14]} />
        <meshStandardMaterial color="#d7b56d" emissive="#8a4b12" emissiveIntensity={0.35} />
      </mesh>

      <mesh position={[-14.25, 4.9, -8.75]}>
  <boxGeometry args={[0.08, 11.8, 0.14]} />
  <meshStandardMaterial color="#d7b56d" emissive="#8a4b12" emissiveIntensity={0.35} />
</mesh>

      <mesh position={[14.25, 4.9, -8.75]}>
  <boxGeometry args={[0.08, 11.8, 0.14]} />
  <meshStandardMaterial color="#d7b56d" emissive="#8a4b12" emissiveIntensity={0.35} />
</mesh>

      {/* Golden ceiling frame */}
      <mesh position={[0, 9.52, -7]}>
        <boxGeometry args={[21, 0.08, 0.12]} />
        <meshStandardMaterial color="#d7b56d" emissive="#8a4b12" emissiveIntensity={0.55} metalness={0.35} roughness={0.25} />
      </mesh>

      <mesh position={[0, 9.52, 5]}>
        <boxGeometry args={[21, 0.08, 0.12]} />
        <meshStandardMaterial color="#d7b56d" emissive="#8a4b12" emissiveIntensity={0.45} metalness={0.35} roughness={0.25} />
      </mesh>

      <mesh position={[-10.5, 9.52, -1]}>
        <boxGeometry args={[0.12, 0.08, 12]} />
        <meshStandardMaterial color="#d7b56d" emissive="#8a4b12" emissiveIntensity={0.45} metalness={0.35} roughness={0.25} />
      </mesh>

      <mesh position={[10.5, 9.52, -1]}>
        <boxGeometry args={[0.12, 0.08, 12]} />
        <meshStandardMaterial color="#d7b56d" emissive="#8a4b12" emissiveIntensity={0.45} metalness={0.35} roughness={0.25} />
      </mesh>
    </>
  );
}
