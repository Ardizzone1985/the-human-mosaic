import { useMemo } from "react";
import * as THREE from "three";

function createParquetTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#d9c3a0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const plankW = 180;
  const plankH = 46;

  for (let y = 0; y < canvas.height; y += plankH) {
    for (let x = -plankW; x < canvas.width + plankW; x += plankW) {
      const offset = Math.floor(y / plankH) % 2 === 0 ? 0 : plankW / 2;

      const gradient = ctx.createLinearGradient(x + offset, y, x + offset + plankW, y + plankH);
      gradient.addColorStop(0, "#c9aa7e");
gradient.addColorStop(0.45, "#ead6b8");
gradient.addColorStop(1, "#b79263");

      ctx.fillStyle = gradient;
      ctx.fillRect(x + offset, y, plankW - 3, plankH - 3);

      ctx.strokeStyle = "rgba(255,225,170,0.2)";
      ctx.strokeRect(x + offset, y, plankW - 3, plankH - 3);

      ctx.fillStyle = "rgba(255,255,255,0.035)";
      ctx.fillRect(x + offset + 12, y + 8, plankW * 0.55, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.2, 2.2);
  texture.anisotropy = 16;

  return texture;
}

function createMuseumWallTexture(base = "#8a735f") {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 8500; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 2.2;

    ctx.fillStyle =
      Math.random() > 0.5
        ? "rgba(255,255,255,0.055)"
        : "rgba(0,0,0,0.055)";

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 55; i++) {
    const y = Math.random() * canvas.height;
    const gradient = ctx.createLinearGradient(0, y, canvas.width, y + 100);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.5, "rgba(255,255,255,0.055)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, y, canvas.width, 100);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.5, 1.1);
  texture.anisotropy = 16;

  return texture;
}

function createCeilingTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ece7df";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle =
      Math.random() > 0.5
        ? "rgba(255,230,190,0.04)"
        : "rgba(0,0,0,0.045)";

    ctx.fillRect(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() * 2.4,
      Math.random() * 2.4
    );
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.2, 2.2);
  texture.anisotropy = 16;

  return texture;
}

const goldMaterial = (
  <meshStandardMaterial
    color="#e0b866"
    metalness={0.62}
    roughness={0.18}
    emissive="#8a4b12"
    emissiveIntensity={0.38}
  />
);

export default function RoomShell({ theme }) {
  const backWallTexture = useMemo(() => createMuseumWallTexture("#d8d0c3"), []);
const sideWallTexture = useMemo(() => createMuseumWallTexture("#d1c8bb"), []);
const ceilingTexture = useMemo(() => createCeilingTexture(), []);
const parquetTexture = useMemo(() => createParquetTexture(), []);

  return (
    <>
      <ambientLight intensity={0.60} color={theme?.ambient || "#ffe6c8"} />

      <directionalLight
        position={[4, 9, 6]}
        intensity={2.25}
        color={theme?.directional || "#ffe0b3"}
        castShadow
      />

      <pointLight
        position={[0, 5.8, -2]}
        intensity={2.65}
        distance={18}
        color={theme?.glow || "#ffd8a8"}
      />

      <pointLight
        position={[-7, 4.2, -7]}
        intensity={1.35}
        distance={10}
        color={theme?.glow || "#ffd8a8"}
      />

      <pointLight
        position={[7, 4.2, -7]}
        intensity={1.35}
        distance={10}
        color={theme?.glow || "#ffd8a8"}
      />

      <pointLight
        position={[-5.2, 5.2, -7.2]}
        intensity={0.45}
        distance={6}
        color={theme?.directional || "#ffe0b3"}
      />

      <pointLight
        position={[0, 5.4, -7.2]}
        intensity={0.55}
        distance={7}
        color={theme?.directional || "#ffe0b3"}
      />

      <pointLight
        position={[5.2, 5.2, -7.2]}
        intensity={0.45}
        distance={6}
        color={theme?.directional || "#ffe0b3"}
      />

      {/* Central ceiling museum light */}
<pointLight
  position={[0, 8.5, -2]}
  intensity={2.4}
  distance={28}
  color="#fff3dd"
/>

{/* InfoWall museum light */}
<pointLight
  position={[0, 5.5, 8]}
  intensity={1.8}
  distance={18}
  color="#fff0d0"
/>

      {/* Museum spotlight left */}
<pointLight
  position={[-5, 8, -8]}
  intensity={2.2}
  distance={10}
  color="#fff6e5"
/>

{/* Museum spotlight center */}
<pointLight
  position={[0, 8, -8]}
  intensity={2.5}
  distance={10}
  color="#fff6e5"
/>

{/* Museum spotlight right */}
<pointLight
  position={[5, 8, -8]}
  intensity={2.2}
  distance={10}
  color="#fff6e5"
/>

      {/* Premium brighter parquet floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.22, 1]} receiveShadow>
        <planeGeometry args={[30, 34]} />
        <meshStandardMaterial
  map={parquetTexture}
  roughness={0.42}
  metalness={0.08}
  color="#ead8b8"
  emissive="#f1dfbd"
  emissiveIntensity={0.025}
/>
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 4, -10]}>
        <planeGeometry args={[22, 12]} />
        <meshStandardMaterial
          map={backWallTexture}
          color="#e3ddd2"
          roughness={0.58}
          metalness={0.04}
        />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-11, 4, 1]}>
        <planeGeometry args={[22, 12]} />
        <meshStandardMaterial
          map={sideWallTexture}
          color="#ddd4c8"
          roughness={0.6}
          metalness={0.04}
        />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[11, 4, 1]}>
        <planeGeometry args={[22, 12]} />
        <meshStandardMaterial
          map={sideWallTexture}
          color="#ddd4c8"
          roughness={0.6}
          metalness={0.04}
        />
      </mesh>

      {/* Brighter ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10.4, 1]}>
        <planeGeometry args={[34, 38]} />
        <meshStandardMaterial
  map={ceilingTexture}
  color="#f3eee6"
  roughness={0.88}
  metalness={0.02}
  emissive="#ffffff"
  emissiveIntensity={0.015}
/>
      </mesh>

      {/* Back wall frame */}
      <mesh position={[0, 8.05, -9.9]}>
        <boxGeometry args={[22, 0.08, 0.12]} />
        {goldMaterial}
      </mesh>

      <mesh position={[0, -0.95, -9.9]}>
        <boxGeometry args={[22, 0.08, 0.12]} />
        {goldMaterial}
      </mesh>

      <mesh position={[-10.95, 3.5, -9.9]}>
        <boxGeometry args={[0.08, 9, 0.12]} />
        {goldMaterial}
      </mesh>

      <mesh position={[10.95, 3.5, -9.9]}>
        <boxGeometry args={[0.08, 9, 0.12]} />
        {goldMaterial}
      </mesh>

      {/* Museum wall panels */}
      {[-9, -4.5, 0, 4.5, 9].map((x) => (
        <group key={`back-panel-${x}`} position={[x, 3.1, -9.82]}>
          <mesh>
            <boxGeometry args={[2.7, 5.8, 0.08]} />
            <meshStandardMaterial
  color="#f7f6f3"
  roughness={0.55}
  metalness={0.02}  
/>
          </mesh>

          <mesh position={[0, 2.95, 0.06]}>
            <boxGeometry args={[2.9, 0.08, 0.08]} />
            {goldMaterial}
          </mesh>

          <mesh position={[0, -2.95, 0.06]}>
            <boxGeometry args={[2.9, 0.08, 0.08]} />
            {goldMaterial}
          </mesh>

          <mesh position={[-1.4, 0, 0.06]}>
            <boxGeometry args={[0.08, 5.9, 0.08]} />
            {goldMaterial}
          </mesh>

          <mesh position={[1.4, 0, 0.06]}>
            <boxGeometry args={[0.08, 5.9, 0.08]} />
            {goldMaterial}
          </mesh>
        </group>
      ))}

      {/* Cinematic wall light strips */}
      <mesh position={[-10.85, 3.4, -3]}>
        <boxGeometry args={[0.08, 5.8, 0.08]} />
        <meshStandardMaterial
          color="#f0c778"
          emissive={theme?.glow || "#f0c778"}
          emissiveIntensity={1.15}
          metalness={0.55}
          roughness={0.18}
        />
      </mesh>

      <mesh position={[10.85, 3.4, -3]}>
        <boxGeometry args={[0.08, 5.8, 0.08]} />
        <meshStandardMaterial
          color="#f0c778"
          emissive={theme?.glow || "#f0c778"}
          emissiveIntensity={1.15}
          metalness={0.55}
          roughness={0.18}
        />
      </mesh>

      <mesh position={[0, 6.95, -9.75]}>
        <boxGeometry args={[18, 0.07, 0.08]} />
        <meshStandardMaterial
          color="#f0c778"
          emissive={theme?.glow || "#f0c778"}
          emissiveIntensity={1}
          metalness={0.55}
          roughness={0.2}
        />
      </mesh>

      {/* Ceiling spotlight rails */}
      <mesh position={[0, 7.6, -2]}>
        <boxGeometry args={[16, 0.06, 0.12]} />
        {goldMaterial}
      </mesh>

      <mesh position={[0, 7.6, -6]}>
        <boxGeometry args={[16, 0.06, 0.12]} />
        {goldMaterial}
      </mesh>

      {/* Ceiling warm frame */}
      <mesh position={[0, 10.2, -0.5]}>
        <boxGeometry args={[22, 0.08, 0.18]} />
        {goldMaterial}
      </mesh>

      <mesh position={[0, 10.2, 7]}>
        <boxGeometry args={[22, 0.08, 0.18]} />
        {goldMaterial}
      </mesh>

      <mesh position={[-10.8, 10.2, 3]}>
        <boxGeometry args={[0.18, 0.08, 16]} />
        {goldMaterial}
      </mesh>

      <mesh position={[10.8, 10.2, 3]}>
        <boxGeometry args={[0.18, 0.08, 16]} />
        {goldMaterial}
      </mesh>
    </>
  );
}
