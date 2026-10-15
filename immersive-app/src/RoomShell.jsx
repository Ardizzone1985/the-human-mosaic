import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

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

export default function RoomShell({
  theme,
  hideFrontPanels = false,
}) {
  const backWallTexture = useMemo(() => createMuseumWallTexture("#d8d0c3"), []);
const sideWallTexture = useMemo(() => createMuseumWallTexture("#d1c8bb"), []);
const ceilingTexture = useMemo(() => createCeilingTexture(), []);
const parquetTexture = useTexture("/textures/WoodFloor039_1K-JPG_Color.jpg");

  const plasterTexture = useTexture(
  "/textures/Plaster001_1K-JPG_Color.jpg"
);

useMemo(() => {
  plasterTexture.wrapS = THREE.RepeatWrapping;
  plasterTexture.wrapT = THREE.RepeatWrapping;
  plasterTexture.repeat.set(6, 3);
  plasterTexture.colorSpace = THREE.SRGBColorSpace;
  plasterTexture.anisotropy = 8;
  plasterTexture.needsUpdate = true;
}, [plasterTexture]);

useMemo(() => {
  parquetTexture.wrapS = THREE.RepeatWrapping;
  parquetTexture.wrapT = THREE.RepeatWrapping;
  parquetTexture.repeat.set(3, 3);
  parquetTexture.colorSpace = THREE.SRGBColorSpace;
  parquetTexture.anisotropy = 8;
  parquetTexture.needsUpdate = true;
}, [parquetTexture]);

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

      {/* PREMIUM WOOD FLOOR — HUMANITY IMPACT */}
<mesh
  rotation={[-Math.PI / 2, 0, 0]}
  position={[0, -1.22, 1]}
  receiveShadow
>
  <planeGeometry args={[30, 34]} />
  <meshStandardMaterial
    map={parquetTexture}
    color="#ffffff"
    roughness={0.58}
    metalness={0.02}
  />
</mesh>

      {/* Back wall */}
      <mesh position={[0, 4, -10]}>
        <planeGeometry args={[22, 12]} />
        <meshStandardMaterial
  map={plasterTexture}
  color="#f5f2ec"
  roughness={0.85}
  metalness={0}
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
{!hideFrontPanels &&
  [-9, -4.5, 0, 4.5, 9].map((x) => (
    <group key={`back-panel-${x}`} position={[x, 3.1, -9.82]}>
      
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
<mesh position={[-4, 10.34, 1]}>
  <boxGeometry args={[0.12, 0.06, 16]} />
  {goldMaterial}
</mesh>

<mesh position={[4, 10.34, 1]}>
  <boxGeometry args={[0.12, 0.06, 16]} />
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
