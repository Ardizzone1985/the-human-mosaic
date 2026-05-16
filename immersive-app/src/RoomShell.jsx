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
  texture.repeat.set(5, 5);
  texture.anisotropy = 16;

  return texture;
}

export default function RoomShell() {
  return (
    <>
<ambientLight intensity={0.45} color="#ffe2b8" />
      
      <directionalLight
  position={[4, 9, 6]}
  intensity={3.2}
  color="#ffd6a3"
  castShadow
/>

      <pointLight
        position={[0, 4, 3]}
        intensity={9}
        distance={24}
        color="#ffd0a0"
      />

      {/* Premium parquet floor */}
<mesh
  rotation={[-Math.PI / 2, 0, 0]}
  position={[0, -1.22, 1]}
  receiveShadow
>
  <planeGeometry args={[28, 24]} />
  <meshStandardMaterial
    map={createParquetTexture()}
    roughness={0.22}
    metalness={0.18}
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
