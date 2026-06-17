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

      const gradient = ctx.createLinearGradient(
        x + offset,
        y,
        x + offset + plankW,
        y + plankH
      );

      gradient.addColorStop(0, "#4b210d");
      gradient.addColorStop(0.45, "#9a5726");
      gradient.addColorStop(1, "#321305");

      ctx.fillStyle = gradient;
      ctx.fillRect(x + offset, y, plankW - 3, plankH - 3);

      ctx.strokeStyle = "rgba(255,210,130,0.16)";
      ctx.strokeRect(x + offset, y, plankW - 3, plankH - 3);

      ctx.fillStyle = "rgba(255,255,255,0.018)";
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

function createMuseumWallTexture(base = "#5a4638", accent = "#8a735f") {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 5200; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 1.7;

    ctx.fillStyle =
      Math.random() > 0.5
        ? "rgba(255,255,255,0.035)"
        : "rgba(0,0,0,0.045)";

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 34; i++) {
    const y = Math.random() * canvas.height;
    const gradient = ctx.createLinearGradient(0, y, canvas.width, y + 80);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.5, "rgba(255,255,255,0.035)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, y, canvas.width, 80);
  }

  ctx.fillStyle = "rgba(255,255,255,0.025)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.8, 1.2);
  texture.anisotropy = 16;

  return texture;
}

function createCeilingTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#17100d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 3000; i++) {
    ctx.fillStyle =
      Math.random() > 0.5
        ? "rgba(255,210,150,0.025)"
        : "rgba(0,0,0,0.05)";

    ctx.fillRect(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() * 2.2,
      Math.random() * 2.2
    );
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.4, 2.4);
  texture.anisotropy = 16;

  return texture;
}

const goldMaterial = (
  <meshStandardMaterial
    color="#c99b4c"
    metalness={0.72}
    roughness={0.22}
    emissive="#4a2506"
    emissiveIntensity={0.28}
  />
);

export default function RoomShell({ theme }) {
  const backWallTexture = createMuseumWallTexture("#66513f", "#8a735f");
  const sideWallTexture = createMuseumWallTexture("#443226", "#6b5443");
  const ceilingTexture = createCeilingTexture();

  return (
    <>
      <ambientLight intensity={0.14} color={theme?.ambient || "#ffe2b8"} />

      <directionalLight
        position={[4, 9, 6]}
        intensity={1.18}
        color={theme?.directional || "#ffd6a3"}
        castShadow
      />

      <pointLight
        position={[0, 5.8, -2]}
        intensity={2.05}
        distance={16}
        color={theme?.glow || "#ffd0a0"}
      />

      <pointLight
        position={[-7, 4.2, -7]}
        intensity={1}
        distance={9}
        color={theme?.glow || "#ffd0a0"}
      />

      <pointLight
        position={[7, 4.2, -7]}
        intensity={1}
        distance={9}
        color={theme?.glow || "#ffd0a0"}
      />

      <pointLight
        position={[-5.2, 5.2, -7.2]}
        intensity={0.28}
        distance={5.5}
        color={theme?.directional || "#ffd6a3"}
      />

      <pointLight
        position={[0, 5.4, -7.2]}
        intensity={0.34}
        distance={6}
        color={theme?.directional || "#ffd6a3"}
      />

      <pointLight
        position={[5.2, 5.2, -7.2]}
        intensity={0.28}
        distance={5.5}
        color={theme?.directional || "#ffd6a3"}
      />

      {/* Premium parquet floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.22, 1]} receiveShadow>
        <planeGeometry args={[30, 34]} />
        <meshStandardMaterial
          map={createParquetTexture()}
          roughness={0.2}
          metalness={0.26}
          color="#8a4218"
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 4, -10]}>
        <planeGeometry args={[22, 12]} />
        <meshStandardMaterial
          map={backWallTexture}
          color="#6a533f"
          roughness={0.62}
          metalness={0.08}
        />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-11, 4, 1]}>
        <planeGeometry args={[22, 12]} />
        <meshStandardMaterial
          map={sideWallTexture}
          color="#4a3729"
          roughness={0.66}
          metalness={0.06}
        />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[11, 4, 1]}>
        <planeGeometry args={[22, 12]} />
        <meshStandardMaterial
          map={sideWallTexture}
          color="#4a3729"
          roughness={0.66}
          metalness={0.06}
        />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10.4, 1]}>
        <planeGeometry args={[34, 38]} />
        <meshStandardMaterial
          map={ceilingTexture}
          color="#221914"
          roughness={0.82}
          metalness={0.04}
          emissive="#080302"
          emissiveIntensity={0.08}
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
            <boxGeometry args={[2.7, 5.8, 0.48]} />
            <meshStandardMaterial
              color="#3a2418"
              roughness={0.38}
              metalness={0.16}
              emissive={theme?.side || "#2a1408"}
              emissiveIntensity={0.07}
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
          color="#d7b56d"
          emissive={theme?.glow || "#d7b56d"}
          emissiveIntensity={0.82}
          metalness={0.55}
          roughness={0.2}
        />
      </mesh>

      <mesh position={[10.85, 3.4, -3]}>
        <boxGeometry args={[0.08, 5.8, 0.08]} />
        <meshStandardMaterial
          color="#d7b56d"
          emissive={theme?.glow || "#d7b56d"}
          emissiveIntensity={0.82}
          metalness={0.55}
          roughness={0.2}
        />
      </mesh>

      <mesh position={[0, 6.95, -9.75]}>
        <boxGeometry args={[18, 0.07, 0.08]} />
        <meshStandardMaterial
          color="#d7b56d"
          emissive={theme?.glow || "#d7b56d"}
          emissiveIntensity={0.7}
          metalness={0.55}
          roughness={0.22}
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
