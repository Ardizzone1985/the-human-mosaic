import { useState, useRef, useEffect } from "react";
import { Text, useTexture } from "@react-three/drei";
import LobbyShell from "./LobbyShell.jsx";
import logoImage from "./logo-cropped.png";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { supabase } from "./supabaseClient.js";

function FeaturedRoomPhoto({ position, room, color = "#d7b56d" }) {
  const [featuredPhoto, setFeaturedPhoto] = useState(null);
const imageUrl = featuredPhoto?.image_file_name
  ? "https://cqpujmwfiqbwdsmuwkmb.supabase.co/storage/v1/object/public/images/" + featuredPhoto.image_file_name
  : null;
  
  useEffect(() => {
    async function loadFeaturedPhoto() {
      const { data, error } = await supabase
        .from("submissions")
        .select("image_file_name, likes_count")
.eq("room", room)
.eq("approval_status", "approved")
.order("likes_count", { ascending: false })
.limit(1);

      if (error) {
        console.error("Featured photo error:", error);
        return;
      }

      setFeaturedPhoto(data?.[0] || null);
    }

    loadFeaturedPhoto();
  }, [room]);

  const texture = useTexture(imageUrl || logoImage);

  return (
    <group position={position}>

      <Text
  position={[0, 1.25, 0.08]}
  fontSize={0.13}
  color="#f2c879"
  anchorX="center"
  anchorY="middle"
  letterSpacing={0.12}
>
  MOST LOVED MEMORY
</Text>

      <Text
  position={[0, 1.02, 0.08]}
  fontSize={0.09}
  color="#ffffff"
  anchorX="center"
  anchorY="middle"
>
  {`❤️ ${featuredPhoto?.likes_count ?? 0} Likes`}
</Text>

      <mesh position={[0, 0.35, -0.08]}>
  <planeGeometry args={[2.25, 1.75]} />
  <meshBasicMaterial
  color={color}
  transparent
  opacity={0.05}
  depthWrite={false}
/>
</mesh>
      
      <mesh position={[0, 0.35, 0.09]}>
        <planeGeometry args={[1.45, 1.05]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.22}
          metalness={0.05}
          emissive="#ffffff"
          emissiveIntensity={0.05}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.82, 1.42, 0.06]} />
        <meshStandardMaterial
          color="#120806"
          emissive={color}
          emissiveIntensity={0.22}
          roughness={0.35}
          metalness={0.22}
        />
      </mesh>

      <mesh position={[0, 0.35, -0.04]}>
        <planeGeometry args={[2.1, 1.65]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

function RoomDoor({ position, label, room, color = "#d7b56d" }) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef();

  useFrame((state) => {
  if (!groupRef.current) return;

  const t = state.clock.elapsedTime;

  // Floating cinematic movement
  groupRef.current.position.y =
    position[1] + Math.sin(t * 1.2 + position[0]) * 0.04;

  // Smooth hover scaling
  const targetScale = hovered ? 1.12 : 1;

  groupRef.current.scale.lerp(
    new THREE.Vector3(targetScale, targetScale, targetScale),
    0.08
  );
});

  function enterRoom() {
  window.dispatchEvent(new Event("startFadeOut"));

  setTimeout(() => {
    window.location.href = `/?room=${room}`;
  }, 900);
}

  return (
  <group
  ref={groupRef}
    position={position}
    scale={hovered ? 1.08 : 1}
    onPointerOver={(e) => {
      e.stopPropagation();
      setHovered(true);
      document.body.style.cursor = "pointer";
    }}
    onPointerOut={(e) => {
      e.stopPropagation();
      setHovered(false);
      document.body.style.cursor = "default";
    }}
    onClick={(e) => {
      e.stopPropagation();
      enterRoom();
    }}
  >
    <mesh position={[0, 0, -0.28]}>
  <boxGeometry args={[3.8, 6.1, 0.52]} />
      <meshStandardMaterial
        color={hovered ? color : "#6b4a1e"}
        emissive={color}
        emissiveIntensity={hovered ? 1.4 : 0.45}
        roughness={0.34}
        metalness={0.28}
      />
    </mesh>

    <mesh position={[0, 0, 0.02]}>
  <boxGeometry args={[2.95, 5.25, 0.46]} />
      <meshStandardMaterial
        color="#2a1208"
        roughness={0.42}
        metalness={0.22}
        emissive={color}
        emissiveIntensity={hovered ? 0.34 : 0.08}
      />
    </mesh>

    <mesh position={[0, 0, 0.28]}>
  <boxGeometry args={[2.2, 4.4, 0.16]} />
      <meshStandardMaterial
        color="#0b0302"
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>

    <mesh position={[0.82, 0, 0.28]}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial
        color="#d7b56d"
        emissive="#d7b56d"
        emissiveIntensity={hovered ? 0.7 : 0.25}
        metalness={0.8}
        roughness={0.22}
      />
    </mesh>

    <mesh position={[0, 2.18, 0.24]}>
      <boxGeometry args={[2.55, 0.08, 0.08]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} />
    </mesh>

    <Text
      position={[0, 3.45, 0.28]}
      fontSize={0.28}
      color={hovered ? "#ffffff" : color}
      anchorX="center"
    >
      {label}
    </Text>

    {/* Floor reflection glow */}
<mesh position={[0, -2.58, 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
  <circleGeometry args={[1.25, 48]} />
  <meshBasicMaterial
    color={color}
    transparent
    opacity={hovered ? 0.22 : 0.09}
  />
</mesh>

    {/* Cinematic rear glow */}
<mesh position={[0, 0, -0.55]}>
  <planeGeometry args={[2.8, 4.8]} />
  <meshBasicMaterial
    color={color}
    transparent
    opacity={hovered ? 0.18 : 0.08}
  />
</mesh>

    {/* Vertical cinematic halo */}
<mesh position={[0, 0.35, -0.7]}>
  <planeGeometry args={[3.4, 5.8]} />
  <meshBasicMaterial
    color={color}
    transparent
    opacity={hovered ? 0.10 : 0.035}
  />
</mesh>

    {/* Portal wall glow */}
<mesh position={[0, 0.55, -1.05]}>
  <planeGeometry args={[5.2, 7.2]} />
  <meshBasicMaterial
    color={color}
    transparent
    opacity={hovered ? 0.16 : 0.055}
  />
</mesh>

{/* Floor cinematic spill */}
<mesh
  position={[0, -2.92, 1.25]}
  rotation={[-Math.PI / 2, 0, 0]}
>
  <planeGeometry args={[3.8, 4.8]} />
  <meshBasicMaterial
    color={color}
    transparent
    opacity={hovered ? 0.11 : 0.045}
  />
</mesh>

    <Text
      position={[0, -2.85, 0.28]}
      fontSize={0.12}
      color={hovered ? "#ffffff" : "#d8c7ad"}
      anchorX="center"
    >
      CLICK TO ENTER
    </Text>
  </group>
);
}

export default function Lobby() {
    const [roomCounts, setRoomCounts] = useState({
    Identity: 0,
    Love: 0,
    Creativity: 0,
  });

  const totalMosaic =
  roomCounts.Identity +
  roomCounts.Love +
  roomCounts.Creativity;

  const [news, setNews] = useState([]);

  useEffect(() => {
async function loadNews() {
  const { data, error } = await supabase
    .from("project_news")
    .select("title, message, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("News error:", error);
    return;
  }

  setNews(data || []);
}

    loadNews();
    
    async function loadRoomCounts() {
      const { data, error } = await supabase
        .from("submissions")
        .select("room, approval_status");

      if (error) {
        console.error("Lobby stats error:", error);
        return;
      }

      let counts = {
        Identity: 0,
        Love: 0,
        Creativity: 0,
      };

      data.forEach((item) => {
        if (item.approval_status !== "approved") return;

        if (item.room === "Identity") counts.Identity++;
        if (item.room === "Love") counts.Love++;
        if (item.room === "Creativity") counts.Creativity++;
      });

      setRoomCounts(counts);
    }

    loadRoomCounts();
  }, []);
  const logoTexture = useTexture(logoImage);
  return (
    <>
      <LobbyShell />
      
<mesh position={[0, 4.2, 10.55]} rotation={[0, Math.PI, 0]}>
  <planeGeometry args={[7.4, 3.7]} />
  <meshBasicMaterial map={logoTexture} transparent />
</mesh>

      <Text
  position={[0, 6.75, 10.55]}
rotation={[0, Math.PI, 0]}
  fontSize={0.52}
  color="#f2c879"
  anchorX="center"
>
  WELCOME TO
</Text>

     <Text
  position={[0, 1.55, 10.55]}
rotation={[0, Math.PI, 0]}
  fontSize={0.28}
color="#6b5a3f"
  anchorX="center"
  maxWidth={6}
  textAlign="center"
>
  A permanent global immersive artwork
</Text>

      <group
  position={[-12.7, 1.7, 10.55]}
  rotation={[0, Math.PI, 0]}
  onPointerOver={() => {
    document.body.style.cursor = "pointer";
  }}
  onPointerOut={() => {
    document.body.style.cursor = "default";
  }}
  onClick={() => {
    window.dispatchEvent(new Event("startFadeOut"));

    setTimeout(() => {
      window.location.href = "https://thehumanmosaic.art";
    }, 700);
  }}
>
  <mesh position={[0, 0, -0.04]}>
    <boxGeometry args={[2.4, 3.8, 0.14]} />
    <meshStandardMaterial
      color="#3a2418"
      emissive="#8a4b12"
      emissiveIntensity={0.16}
      roughness={0.42}
      metalness={0.18}
    />
  </mesh>

  <mesh position={[0, 0, 0.08]}>
    <boxGeometry args={[1.8, 3.0, 0.08]} />
    <meshStandardMaterial
      color="#140805"
      roughness={0.62}
      metalness={0.12}
    />
  </mesh>

  <mesh position={[0.48, 0, 0.16]}>
    <sphereGeometry args={[0.045, 16, 16]} />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={0.35}
      metalness={0.7}
      roughness={0.25}
    />
  </mesh>

  <Text
  position={[0, 2.25, 0.18]}
  fontSize={0.22}
  color="#5b4630"
  anchorX="center"
  anchorY="middle"
  letterSpacing={0.08}
>
  EXIT
</Text>
</group>

      {/* Welcome Wall - Project News Panel */}
<group position={[-6.5, 4.45, 10.45]} rotation={[0, Math.PI, 0]}>
  <Text
    position={[0, 2.55, 0.12]}
    fontSize={0.36}
    color="#5b4630"
    anchorX="center"
    letterSpacing={0.08}
  >
    PROJECT NEWS
  </Text>

  <Text
    position={[0, 1.85, 0.12]}
    fontSize={0.16}
    color="#6b5a3f"
    anchorX="center"
    maxWidth={3.8}
    textAlign="center"
  >
    Latest updates from The Human Mosaic
  </Text>

  {news.length > 0 ? (
  <>
   <Text
  position={[0, 1.25, 0.12]}
  fontSize={0.13}
  color="#8a7758"
  anchorX="center"
>
  {new Date(news[0].created_at).toLocaleDateString("en-GB", {
    year: "numeric",
  month: "long",
  day: "numeric",
  })}
</Text>
    <Text
      position={[0, 0.85, 0.12]}
      fontSize={0.18}
      color="#4f4638"
      anchorX="center"
      maxWidth={3.6}
      textAlign="center"
    >
      {news[0].title}      
    </Text>

    <Text
      position={[0, 0.10, 0.12]}
      fontSize={0.13}
      color="#6b5a3f"
      anchorX="center"
      maxWidth={3.8}
      textAlign="center"
    >
      {news[0].message}
    </Text>
  </>
) : (
  <Text
    position={[0, 0.7, 0.12]}
    fontSize={0.18}
    color="#4f4638"
    anchorX="center"
    maxWidth={3.6}
    textAlign="center"
  >
    No news available
  </Text>
)}

  <Text
    position={[0, -1.95, 0.12]}
    fontSize={0.13}
    color="#5b4630"
    anchorX="center"
    maxWidth={3.4}
    textAlign="center"
  >
    Updated from the official admin area
  </Text>
</group>

{/* Welcome Wall - Live Participation Panel */}
<group position={[6.5, 4.45, 10.45]} rotation={[0, Math.PI, 0]}>
  <Text
    position={[0, 2.55, 0.12]}
    fontSize={0.36}
    color="#5b4630"
    anchorX="center"
    letterSpacing={0.08}
  >
    LIVE PARTICIPATION
  </Text>

  <Text
    position={[0, 1.85, 0.12]}
    fontSize={0.16}
    color="#6b5a3f"
    anchorX="center"
    maxWidth={3.8}
    textAlign="center"
  >
    Real-time growth of the artwork
  </Text>

  <Text
    position={[0, 0.75, 0.12]}
    fontSize={0.22}
    color="#d7b56d"
    anchorX="center"
  >
    {`IDENTITY: ${roomCounts.Identity.toLocaleString()} / 1,000,000`}
  </Text>

  <Text
    position={[0, 0.2, 0.12]}
    fontSize={0.22}
    color="#c9829b"
    anchorX="center"
  >
    {`LOVE: ${roomCounts.Love.toLocaleString()} / 1,000,000`}
  </Text>

  <Text
    position={[0, -0.35, 0.12]}
    fontSize={0.22}
    color="#8fa8d8"
    anchorX="center"
  >
    {`CREATIVITY: ${roomCounts.Creativity.toLocaleString()} / 1,000,000`}
  </Text>

  <Text
  position={[0, -1.05, 0.12]}
  fontSize={0.18}
  color="#d7b56d"
  anchorX="center"
>
  {`TOTAL MOSAIC: ${totalMosaic.toLocaleString()} / 3,000,000`}
</Text>

  <Text
    position={[0, -1.95, 0.12]}
    fontSize={0.13}
    color="#5b4630"
    anchorX="center"
    maxWidth={3.4}
    textAlign="center"
  >
    Connected to approved submissions
  </Text>
</group>
        
      <group
  position={[0, 0.35, 10.55]}
rotation={[0, Math.PI, 0]}
  onPointerOver={() => {
    document.body.style.cursor = "pointer";
  }}
  onPointerOut={() => {
    document.body.style.cursor = "default";
  }}
  onClick={() => {
    window.location.href = "https://thehumanmosaic.art/join.html";
  }}
>
  <mesh position={[0, 0, -0.05]}>
    <boxGeometry args={[3.65, 1.25, 0.12]} />
    <meshStandardMaterial
      color="#140805"
      emissive="#8a4b12"
      emissiveIntensity={0.28}
      roughness={0.32}
      metalness={0.35}
    />
  </mesh>

  <mesh position={[0, 0.68, 0]}>
    <boxGeometry args={[3.7, 0.045, 0.08]} />
    <meshStandardMaterial color="#d7b56d" emissive="#d7b56d" emissiveIntensity={0.7} />
  </mesh>

  <mesh position={[0, -0.68, 0]}>
    <boxGeometry args={[3.7, 0.045, 0.08]} />
    <meshStandardMaterial color="#d7b56d" emissive="#d7b56d" emissiveIntensity={0.45} />
  </mesh>

  <Text
    position={[0, 0.22, 0.08]}
    fontSize={0.22}
    color="#f8d890"
    anchorX="center"
    letterSpacing={0.08}
  >
    JOIN THE MOSAIC
  </Text>

  <Text
    position={[0, -0.18, 0.08]}
    fontSize={0.115}
    color="#c9a96b"
    anchorX="center"
    maxWidth={3}
    textAlign="center"
  >
    Reserve your place in the permanent artwork
  </Text>
</group>

    <group position={[11.72, 3.3, 0]} rotation={[0, -Math.PI / 2, 0]}>
  {/* Left sponsor */}
  <group position={[-4.2, 0, 0]}>
    <mesh>
      <boxGeometry args={[2.6, 4.2, 0.16]} />
      <meshStandardMaterial color="#7f7a72" emissive="#d7c7a0" emissiveIntensity={0.03} roughness={0.5} />
    </mesh>

    <Text position={[0, 1.25, 0.12]} fontSize={0.22} color="#f2c879" anchorX="center">
      PARTNER SPACE
    </Text>

    <Text position={[0, 0.55, 0.12]} fontSize={0.12} color="#c9a96b" anchorX="center" maxWidth={2.1} textAlign="center">
      Future sponsor / partner area
    </Text>
  </group>

  {/* Community wall */}
  <group position={[0, 0.15, 0]}>
    <mesh>
      <boxGeometry args={[4.4, 5.2, 0.18]} />
      <meshStandardMaterial color="#8d877f" emissive="#d7c7a0" emissiveIntensity={0.4} roughness={0.46} />
    </mesh>

    <Text position={[0, 1.85, 0.14]} fontSize={0.26} color="#f2c879" anchorX="center" letterSpacing={0.08}>
      COMMUNITY WALL
    </Text>

    <Text position={[0, 0.75, 0.14]} fontSize={0.14} color="#d8c7ad" anchorX="center" maxWidth={3.4} textAlign="center">
      Messages from participants around the world
    </Text>

    <Text position={[0, -0.25, 0.14]} fontSize={0.13} color="#c9a96b" anchorX="center" maxWidth={3.5} textAlign="center">
      “Every memory becomes part of humanity.”
    </Text>

    <Text position={[0, -1.0, 0.14]} fontSize={0.12} color="#9f8b6a" anchorX="center">
      Coming soon
    </Text>
  </group>

  {/* Right sponsor */}
  <group position={[4.2, 0, 0]}>
    <mesh>
      <boxGeometry args={[2.6, 4.2, 0.16]} />
      <meshStandardMaterial color="#7f7a72" emissive="#d7c7a0" emissiveIntensity={0.03} roughness={0.5} />
    </mesh>

    <Text position={[0, 1.25, 0.12]} fontSize={0.22} color="#f2c879" anchorX="center">
      PARTNER SPACE
    </Text>

    <Text position={[0, 0.55, 0.12]} fontSize={0.12} color="#c9a96b" anchorX="center" maxWidth={2.1} textAlign="center">
      Future sponsor / partner area
    </Text>
  </group>
</group>

      <FeaturedRoomPhoto
  position={[-8, 6.15, -7.35]}
  room="Identity"
  color="#d7b56d"
/>

<FeaturedRoomPhoto
  position={[0, 6.15, -7.35]}
  room="Love"
  color="#ff9fbd"
/>

<FeaturedRoomPhoto
  position={[8, 6.15, -7.35]}
  room="Creativity"
  color="#9fc3ff"
/>
      
      <RoomDoor
        position={[-8, 1.45, -7.6]}
        label="IDENTITY"
        room="Identity"
        color="#d7b56d"
      />

      <RoomDoor
        position={[0, 1.45, -7.6]}
        label="LOVE"
        room="Love"
        color="#ff9fbd"
      />

      <RoomDoor
        position={[8, 1.45, -7.6]}
        label="CREATIVITY"
        room="Creativity"
        color="#9fc3ff"
      />
    </>
  );
}
