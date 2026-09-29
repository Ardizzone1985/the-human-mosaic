import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Text, Html, useTexture } from "@react-three/drei";
import GalleryWall3D from "./GalleryWall3D";
import logoImage from "../logo-cropped.png";

function StreetViewLookControls() {
  const { camera, gl } = useThree();
  const dragging = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const yaw = useRef(0);
  const pitch = useRef(0);

  useEffect(() => {
    camera.rotation.order = "YXZ";

    function start(x, y) {
      dragging.current = true;
      lastX.current = x;
      lastY.current = y;
    }

    function move(x, y) {
      if (!dragging.current) return;

      const dx = x - lastX.current;
      const dy = y - lastY.current;

      lastX.current = x;
      lastY.current = y;

      yaw.current -= dx * 0.004;
      pitch.current -= dy * 0.004;

      pitch.current = Math.max(
        -Math.PI / 3.2,
        Math.min(Math.PI / 3.2, pitch.current)
      );

      camera.rotation.y = yaw.current;
      camera.rotation.x = pitch.current;
    }

    function end() {
      dragging.current = false;
    }

    function onMouseDown(e) {
      start(e.clientX, e.clientY);
    }

    function onMouseMove(e) {
      move(e.clientX, e.clientY);
    }

    function onMouseUp() {
      end();
    }

    function onTouchStart(e) {
      if (e.touches.length !== 1) return;
      start(e.touches[0].clientX, e.touches[0].clientY);
    }

    function onTouchMove(e) {
      if (e.touches.length !== 1) return;
      move(e.touches[0].clientX, e.touches[0].clientY);
    }

    function onTouchEnd() {
      end();
    }

    const el = gl.domElement;

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [camera, gl]);

  return null;
}

const GALLERY_VIEWPOINTS = [
  { id: "center", position: [0, 2.05, 5] },
  { id: "front", position: [0, 2.05, -2.8] },
  { id: "back", position: [0, 2.05, 12.8] },
  { id: "left", position: [-7.2, 2.05, 5] },
  { id: "right", position: [7.2, 2.05, 5] },
  { id: "frontLeft", position: [-6.2, 2.05, -2.2] },
  { id: "frontRight", position: [6.2, 2.05, -2.2] },
  { id: "backLeft", position: [-6.2, 2.05, 12.2] },
  { id: "backRight", position: [6.2, 2.05, 12.2] },
];

function StreetViewControls({ currentPointId, targetPointId }) {
  const { camera } = useThree();

  useEffect(() => {
    const startPoint = GALLERY_VIEWPOINTS.find(
      (point) => point.id === currentPointId
    );

    if (!startPoint) return;

    camera.position.set(...startPoint.position);
    camera.rotation.order = "YXZ";
  }, [camera, currentPointId]);

  useFrame(() => {
    const targetPoint = GALLERY_VIEWPOINTS.find(
      (point) => point.id === targetPointId
    );

    if (!targetPoint) return;

    camera.position.lerp(
      new THREE.Vector3(...targetPoint.position),
      0.06
    );
  });

  return null;
}

function FloorArrow({ point, onMove }) {
  return (
    <group
      position={[point.position[0], -1.96, point.position[2]]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onMove(point.id);
      }}
    >
      <mesh>
        <circleGeometry args={[0.42, 32]} />
        <meshBasicMaterial
          color="#d7b56d"
          transparent
          opacity={0.4}
        />
      </mesh>

      <mesh position={[0, 0.18, 0.01]}>
        <coneGeometry args={[0.18, 0.38, 3]} />
        <meshBasicMaterial color="#fff6dc" />
      </mesh>
    </group>
  );
}

function InfoWallLogo() {
  const logoTexture = useTexture(logoImage);

  return (
  <>
    <mesh
      position={[8.5, 5.5, 19.88]}
      rotation={[0, Math.PI, 0]}
    >
      <planeGeometry args={[5.5, 2.75]} />
      <meshBasicMaterial
        map={logoTexture}
        transparent
      />
    </mesh>

    <Text
      position={[10.5, 3.65, 19.87]}
      rotation={[0, Math.PI, 0]}
      fontSize={0.42}
      color="#4f4638"
      anchorX="left"
      anchorY="middle"
    >
      IDENTITY ROOM
    </Text>

    <Text
  position={[10.5, 2.85, 19.87]}
  rotation={[0, Math.PI, 0]}
  fontSize={0.24}
  color="#6b5a3f"
  anchorX="left"
  anchorY="top"
  maxWidth={7}
  lineHeight={1.35}
>
  A permanent immersive digital museum where every image becomes part of a global human mosaic.
</Text>

    <Text
  position={[10.5, 1.75, 19.87]}
  rotation={[0, Math.PI, 0]}
  fontSize={0.19}
  color="#8a6a2f"
  anchorX="left"
  anchorY="middle"
>
  Explore. Discover. Be part of the story.
</Text>

    <group
  position={[-5.5, 4.8, 19.86]}
  rotation={[0, Math.PI, 0]}
>
  <mesh>
    <planeGeometry args={[2.8, 2.8]} />
    <meshStandardMaterial
      color="#d8d0c4"
      roughness={0.65}
      metalness={0.05}
    />
  </mesh>

  <Text
    position={[0, 0, 0.03]}
    fontSize={0.22}
    color="#8a6a2f"
    anchorX="center"
    anchorY="middle"
  >
    SPONSOR SPACE
  </Text>
      </group>

      <group
  position={[-9, 4.8, 19.86]}
  rotation={[0, Math.PI, 0]}
>
  <mesh>
    <planeGeometry args={[2.8, 2.8]} />
    <meshStandardMaterial
      color="#d8d0c4"
      roughness={0.65}
      metalness={0.05}
    />
  </mesh>

  <Text
    position={[0, 0, 0.03]}
    fontSize={0.22}
    color="#8a6a2f"
    anchorX="center"
    anchorY="middle"
  >
    SPONSOR SPACE
  </Text>
</group>

    <group
  position={[-5.5, 1.3, 19.86]}
  rotation={[0, Math.PI, 0]}
>
  <mesh>
    <planeGeometry args={[2.8, 2.8]} />
    <meshStandardMaterial
      color="#d8d0c4"
      roughness={0.65}
      metalness={0.05}
    />
  </mesh>

  <Text
    position={[0, 0, 0.03]}
    fontSize={0.22}
    color="#8a6a2f"
    anchorX="center"
    anchorY="middle"
  >
    SPONSOR SPACE
  </Text>
</group>

    <group
  position={[-9, 0.1, 19.84]}
  rotation={[0, Math.PI, 0]}
>
      <mesh position={[0, 2.75, 0.02]}>
  <planeGeometry args={[2.8, 0.65]} />
  <meshStandardMaterial
    color="#1b1712"
    roughness={0.5}
    metalness={0.15}
  />
</mesh>
      
      <mesh position={[0, 0, -0.04]}>
  <planeGeometry args={[3.05, 4.85]} />
  <meshStandardMaterial
    color="#4a3217"
    roughness={0.5}
    metalness={0.25}
  />
</mesh>
      
<mesh position={[0, 0, -0.02]}>
  <planeGeometry args={[2.75, 4.55]} />
  <meshStandardMaterial
    color="#8a652d"
    roughness={0.42}
    metalness={0.38}
  />
</mesh>
      
  <mesh>
    <planeGeometry args={[2.4, 4.2]} />
    <meshStandardMaterial
      color="#1b1712"
      roughness={0.55}
      metalness={0.12}
    />
  </mesh>

      <mesh position={[-0.82, -0.05, 0.08]}>
  <sphereGeometry args={[0.09, 20, 20]} />
  <meshStandardMaterial
    color="#d4af37"
    metalness={0.75}
    roughness={0.25}
  />
</mesh>
  
</group>
  </>
);
}

export default function GalleryWall3DPrototype() {
  const [sectionNumber, setSectionNumber] = useState(1);
  const [viewNumber, setViewNumber] = useState(1);
  const [sectionInput, setSectionInput] = useState("1");
  const [viewInput, setViewInput] = useState("1");
  const [currentPointId] = useState("center");
  const [targetPointId, setTargetPointId] = useState("center");
    return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#111",
      }}
    >
      <Canvas camera={{ position: [0, 2.05, 5], fov: 50 }}>
        <StreetViewLookControls />
        <InfoWallLogo />
        
        <StreetViewControls
        currentPointId={currentPointId}
        targetPointId={targetPointId}
        />

        {GALLERY_VIEWPOINTS  
  .map((point) => (
    <FloorArrow
      key={point.id}
      point={point}
      onMove={(id) => {
        setTargetPointId(id);
      }}
    />
  ))}
                
        <ambientLight intensity={1.2} />
        <directionalLight
          position={[4, 6, 4]}
          intensity={1.5}
        />

        <GalleryWall3D
  key={sectionNumber}
  sectionNumber={sectionNumber}
  viewNumber={viewNumber}
  setViewNumber={setViewNumber}
/>

        {/* pavimento */}
<mesh
  position={[0, -2, 5]}
  rotation={[-Math.PI / 2, 0, 0]}
>
  <planeGeometry args={[30, 30]} />
  <meshStandardMaterial
    color="#d8d2c5"
    roughness={0.8}
    metalness={0.05}
  />
</mesh>

        {/* INFO WALL */}
<mesh
  position={[0, 3, 20]}
  rotation={[0, Math.PI, 0]}
>
  <planeGeometry args={[30, 10]} />
  <meshStandardMaterial
    color="#e8e3d8"
    roughness={0.75}
    metalness={0.05}
  />
</mesh>

        <Text
  position={[0, 4.8, 19.94]}
  rotation={[0, Math.PI, 0]}
  fontSize={0.42}
  color="#4f4638"
  anchorX="center"
  anchorY="middle"
>
  {`SECTION ${sectionNumber}  ·  VIEW ${viewNumber} / ${
    sectionNumber === 1667 ? 4 : 5
  }`}
</Text>

        <Html
  position={[2.2, 1.2, 19.9]}
  rotation={[0, Math.PI, 0]}
  transform
  distanceFactor={8}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "10px 14px",
      background: "rgba(25, 20, 15, 0.88)",
      border: "1px solid #b98942",
      borderRadius: "6px",
      color: "#f2c879",
      fontFamily: "Arial, sans-serif",
      whiteSpace: "nowrap",
    }}
  >
    <span>SECTION</span>

    <input
      type="number"
      min="1"
      max="1667"
      value={sectionInput}
      onChange={(e) => {
  const value = e.target.value;

  if (
    value === "" ||
    (/^\d{1,4}$/.test(value) &&
      Number(value) >= 1 &&
      Number(value) <= 1667)
  ) {
    setSectionInput(value);
  }
}}
      style={{
        width: "70px",
        padding: "6px",
        border: "1px solid #b98942",
        borderRadius: "4px",
        background: "#f7f5ef",
        color: "#222",
        textAlign: "center",
      }}
    />

    <span>VIEW</span>
    <input
  type="number"
  min="1"
  max={sectionNumber === 1667 ? 4 : 5}
  value={viewInput}
  onChange={(e) => {
  const value = e.target.value;

  if (value === "" || /^[1-5]$/.test(value)) {
    setViewInput(value);
  }
}}
  style={{
    width: "50px",
    padding: "6px",
    border: "1px solid #b98942",
    borderRadius: "4px",
    background: "#f7f5ef",
    color: "#222",
    textAlign: "center",
  }}
/>

    <button
  type="button"
      onClick={() => {
  const nextSection = Number(sectionInput);
  const nextView = Number(viewInput);

  if (!nextSection || !nextView) return;

  const maxView = nextSection === 1667 ? 4 : 5;

  if (
    nextSection < 1 ||
    nextSection > 1667 ||
    nextView < 1 ||
    nextView > maxView
  ) {
    return;
  }

  setSectionNumber(nextSection);
  setViewNumber(nextView);
}}
  style={{
    padding: "6px 12px",
    border: "1px solid #b98942",
    borderRadius: "4px",
    background: "#b98942",
    color: "#17130f",
    fontWeight: "700",
    cursor: "pointer",
  }}
>
  GO
</button>
  </div>
</Html>
      </Canvas>
    </div>
  );
}

