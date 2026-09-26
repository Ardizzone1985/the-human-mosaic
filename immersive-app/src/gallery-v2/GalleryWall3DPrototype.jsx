import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Text, Html } from "@react-three/drei";
import GalleryWall3D from "./GalleryWall3D";

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

export default function GalleryWall3DPrototype() {
  const [sectionNumber, setSectionNumber] = useState(1);
  const [viewNumber, setViewNumber] = useState(1);
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
  position={[0, 2, 20]}
  rotation={[0, Math.PI, 0]}
>
  <planeGeometry args={[22, 8]} />
  <meshStandardMaterial
    color="#e8e3d8"
    roughness={0.75}
    metalness={0.05}
  />
</mesh>

        <Text
  position={[0, 4.8, 15.94]}
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
  position={[2.2, 1.2, 15.9]}
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
      defaultValue={sectionNumber}
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
  </div>
</Html>
      </Canvas>
    </div>
  );
}

