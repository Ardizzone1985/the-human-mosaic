import * as THREE from "three";

function createParquetTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#4a2410";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const plankW = 180;
  const plankH = 46;

  for (let y = 0; y < canvas.height; y += plankH) {
    for (let x = -plankW; x < canvas.width + plankW; x += plankW) {
      const offset = Math.floor(y / plankH) % 2 === 0 ? 0 : plankW / 2;

      const gradient = ctx.createLinearGradient(x + offset, y, x + offset + plankW, y + plankH);
      gradient.addColorStop(0, "#5a2c12");
      gradient.addColorStop(0.5, "#8a4a1f");
      gradient.addColorStop(1, "#3b1b0c");

      ctx.fillStyle = gradient;
      ctx.fillRect(x + offset, y, plankW - 3, plankH - 3);

      ctx.strokeStyle = "rgba(255,190,100,0.18)";
      ctx.strokeRect(x + offset, y, plankW - 3, plankH - 3);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.2, 2.2);
  texture.anisotropy = 16;

  return texture;
}

export default function RoomShell({ theme }) {
  return (
    <>
<ambientLight intensity={0.35} color={theme?.ambient || "#ffe2b8"} />
      
<directionalLight
  position={[4, 9, 6]}
  intensity={2.6}
  color={theme?.directional || "#ffd6a3"}
  castShadow
/>

<pointLight
  position={[0, 4, 3]}
  intensity={5}
  distance={24}
  color={theme?.glow || "#ffd0a0"}
/>

      {/* Premium parquet floor */}
<mesh
  rotation={[-Math.PI / 2, 0, 0]}
  position={[0, -1.22, 1]}
  receiveShadow
>
  <planeGeometry args={[30, 34]} />
  <meshStandardMaterial
  map={createParquetTexture()}
  roughness={0.24}
  metalness={0.22}
  color={"#8a3f12"}
/>
</mesh>

      {/* Back wall */}
      <mesh position={[0, 3, -10]}>
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
        <planeGeometry args={[30, 34]} />
        <meshStandardMaterial
          color="#221914"
          roughness={0.72}
          metalness={0.08}
        />
      </mesh>

      {/* Back wall frame */}
      <mesh position={[0, 8.05, -9.9]}>
        <boxGeometry args={[22, 0.08, 0.12]} />
        <meshStandardMaterial color="#d7b56d" emissive="#6a4216" emissiveIntensity={0.4} />
      </mesh>

      <mesh position={[0, -0.95, -9.9]}>
        <boxGeometry args={[22, 0.08, 0.12]} />
        <meshStandardMaterial color="#d7b56d" emissive="#6a4216" emissiveIntensity={0.4} />
      </mesh>

      <mesh position={[-10.95, 3.5, -9.9]}>
        <boxGeometry args={[0.08, 9, 0.12]} />
        <meshStandardMaterial color="#d7b56d" emissive="#6a4216" emissiveIntensity={0.4} />
      </mesh>

      <mesh position={[10.95, 3.5, -9.9]}>
        <boxGeometry args={[0.08, 9, 0.12]} />
        <meshStandardMaterial color="#d7b56d" emissive="#6a4216" emissiveIntensity={0.4} />
      </mesh>

      {/* Museum wall panels */}
{[-7.5, -3.75, 0, 3.75, 7.5].map((x) => (
  <group key={`back-panel-${x}`} position={[x, 3.1, -9.82]}>
    <mesh>
  <boxGeometry args={[2.7, 5.8, 0.32]} />
  <meshStandardMaterial
    color="#3a2418"
    roughness={0.42}
    metalness={0.18}
    emissive={theme?.side || "#2a1408"}
    emissiveIntensity={0.08}
  />
</mesh>

    <mesh position={[0, 2.95, 0.06]}>
      <boxGeometry args={[2.9, 0.08, 0.08]} />
      <meshStandardMaterial color="#b98942" emissive="#3a2008" emissiveIntensity={0.25} />
    </mesh>

    <mesh position={[0, -2.95, 0.06]}>
      <boxGeometry args={[2.9, 0.08, 0.08]} />
      <meshStandardMaterial color="#b98942" emissive="#3a2008" emissiveIntensity={0.25} />
    </mesh>

    <mesh position={[-1.4, 0, 0.06]}>
      <boxGeometry args={[0.08, 5.9, 0.08]} />
      <meshStandardMaterial color="#b98942" emissive="#3a2008" emissiveIntensity={0.25} />
    </mesh>

    <mesh position={[1.4, 0, 0.06]}>
      <boxGeometry args={[0.08, 5.9, 0.08]} />
      <meshStandardMaterial color="#b98942" emissive="#3a2008" emissiveIntensity={0.25} />
    </mesh>
  </group>
))}

      {/* Cinematic wall light strips */}
<mesh position={[-10.85, 3.4, -3]}>
  <boxGeometry args={[0.08, 5.8, 0.08]} />
  <meshStandardMaterial
    color="#d7b56d"
    emissive={theme?.glow || "#d7b56d"}
    emissiveIntensity={0.9}
  />
</mesh>

<mesh position={[10.85, 3.4, -3]}>
  <boxGeometry args={[0.08, 5.8, 0.08]} />
  <meshStandardMaterial
    color="#d7b56d"
    emissive={theme?.glow || "#d7b56d"}
    emissiveIntensity={0.9}
  />
</mesh>

<mesh position={[0, 6.95, -9.75]}>
  <boxGeometry args={[18, 0.07, 0.08]} />
  <meshStandardMaterial
    color="#d7b56d"
    emissive={theme?.glow || "#d7b56d"}
    emissiveIntensity={0.75}
  />
</mesh>

      {/* Ceiling spotlight rails */}
<mesh position={[0, 7.6, -2]}>
  <boxGeometry args={[16, 0.06, 0.12]} />
  <meshStandardMaterial
    color="#d7b56d"
    emissive="#d7b56d"
    emissiveIntensity={0.35}
  />
</mesh>

<mesh position={[0, 7.6, -6]}>
  <boxGeometry args={[16, 0.06, 0.12]} />
  <meshStandardMaterial
    color="#d7b56d"
    emissive="#d7b56d"
    emissiveIntensity={0.35}
  />
</mesh>

      {/* Ceiling warm frame */}
<mesh position={[0, 7.85, -0.5]}>
  <boxGeometry args={[22, 0.08, 0.18]} />
  <meshStandardMaterial color="#d7a64c" emissive="#8a4b12" emissiveIntensity={0.6} />
</mesh>

<mesh position={[0, 7.85, 7]}>
  <boxGeometry args={[22, 0.08, 0.18]} />
  <meshStandardMaterial color="#d7a64c" emissive="#8a4b12" emissiveIntensity={0.6} />
</mesh>

<mesh position={[-10.8, 7.85, 3]}>
  <boxGeometry args={[0.18, 0.08, 16]} />
  <meshStandardMaterial color="#d7a64c" emissive="#8a4b12" emissiveIntensity={0.6} />
</mesh>

<mesh position={[10.8, 7.85, 3]}>
  <boxGeometry args={[0.18, 0.08, 16]} />
  <meshStandardMaterial color="#d7a64c" emissive="#8a4b12" emissiveIntensity={0.6} />
</mesh>
      
    </>
  );
}
