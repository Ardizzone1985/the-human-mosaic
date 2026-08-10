import { useState, useRef, useEffect } from "react";
import { Text, useTexture } from "@react-three/drei";
import LobbyShell from "./LobbyShell.jsx";
import logoImage from "./logo-cropped.png";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { supabase } from "./supabaseClient.js";
import SponsorPanel from "./components/sponsors/SponsorPanel.jsx";

function FeaturedRoomPhoto({ position, room, color = "#d7b56d" }) {
  const [featuredPhotos, setFeaturedPhotos] = useState([]);
const [activeIndex, setActiveIndex] = useState(0);

const featuredPhoto = featuredPhotos[activeIndex];

const imageUrl = featuredPhoto?.image_file_name
  ? "https://cqpujmwfiqbwdsmuwkmb.supabase.co/storage/v1/object/public/images/" + featuredPhoto.image_file_name
  : null;
  
  useEffect(() => {
    async function loadFeaturedPhoto() {
      const { data, error } = await supabase
        .from("submissions")
        .select("image_file_name, likes_count, views_count, comments_count")
.eq("room", room)
.eq("approval_status", "approved")
.order("likes_count", { ascending: false })
.limit(3);

      if (error) {
        console.error("Featured photo error:", error);
        return;
      }

      setFeaturedPhotos(data || []);
setActiveIndex(0);
    }

    loadFeaturedPhoto();
  }, [room]);

  useEffect(() => {
  if (featuredPhotos.length <= 1) return;

  const interval = setInterval(() => {
    setActiveIndex((current) => (current + 1) % featuredPhotos.length);
  }, 10000);

  return () => clearInterval(interval);
}, [featuredPhotos.length]);

  const texture = useTexture(imageUrl || logoImage);

  return (
    <group position={position}>

      <Text
  position={[0, 1.42, 0.08]}
  fontSize={0.13}
  color="#4b3522"
  anchorX="center"
  anchorY="middle"
  letterSpacing={0.12}
>
  👑 COMMUNITY FAVORITE
</Text>

      <Text
  position={[0, 1.12, 0.08]}
  fontSize={0.13}
  color="#4b3522"
  anchorX="center"
  anchorY="middle"
>
  {`❤️ ${featuredPhoto?.likes_count ?? 0}   💬 ${featuredPhoto?.comments_count ?? 0}   👁 ${featuredPhoto?.views_count ?? 0}`}
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
    window.history.pushState({}, "", `/?room=${room}`);
window.dispatchEvent(new PopStateEvent("popstate"));
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

function HumanityImpactDoor({
  position,
  rotation = [0, 0, 0],
  color = "#d7b56d",
}) {
  return (
    <group
      position={position}
      rotation={rotation}
    >
      {/* External frame */}
      <mesh position={[0, 0, -0.28]}>
        <boxGeometry args={[3.8, 6.1, 0.52]} />

        <meshStandardMaterial
          color="#6b4a1e"
          emissive={color}
          emissiveIntensity={0.22}
          roughness={0.34}
          metalness={0.28}
        />
      </mesh>

      {/* Main door */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[2.95, 5.25, 0.46]} />

        <meshStandardMaterial
          color="#2a1208"
          roughness={0.42}
          metalness={0.22}
          emissive={color}
          emissiveIntensity={0.06}
        />
      </mesh>

      {/* Inner panel */}
      <mesh position={[0, 0, 0.28]}>
        <boxGeometry args={[2.2, 4.4, 0.16]} />

        <meshStandardMaterial
          color="#0b0302"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Door handle */}
      <mesh position={[0.82, 0, 0.38]}>
        <sphereGeometry args={[0.08, 16, 16]} />

        <meshStandardMaterial
          color="#d7b56d"
          emissive="#d7b56d"
          emissiveIntensity={0.25}
          metalness={0.8}
          roughness={0.22}
        />
      </mesh>

      {/* Golden upper detail */}
      <mesh position={[0, 2.18, 0.24]}>
        <boxGeometry args={[2.55, 0.08, 0.08]} />

        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.32}
        />
      </mesh>

      <Text
  position={[0, 3.45, 0.28]}
  fontSize={0.48}
  color="#fff4d8"
  anchorX="center"
  letterSpacing={0.15}
  outlineWidth={0.01}
  outlineColor="#d7b56d"
  emissive="#fff4d8"
  emissiveIntensity={1.8}
>
  COMING
  SOON
</Text>

      <Text
        position={[0, 0.45, 0.4]}
        fontSize={0.30}
        color="#f2c879"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.1}
        textAlign="center"
        lineHeight={1.25}
      >
        HUMANITY IMPACT
      </Text>

      <Text
        position={[0, -0.35, 0.4]}
        fontSize={0.15}
        color="#e7dcc8"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.9}
        textAlign="center"
        lineHeight={1.4}
      >
        Together we create real impact.
      </Text>

      <mesh position={[0, -0.72, 0.32]}>
  <boxGeometry args={[1.55, 0.02, 0.02]} />
  <meshStandardMaterial
    color="#d7b56d"
    emissive="#d7b56d"
    emissiveIntensity={0.35}
  />
</mesh>

      {/* Subtle floor glow */}
      <mesh
        position={[0, -2.58, 0.55]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[1.25, 48]} />

        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.07}
        />
      </mesh>

      {/* Subtle rear glow */}
      <mesh position={[0, 0, -0.55]}>
        <planeGeometry args={[2.8, 4.8]} />

        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.05}
        />
      </mesh>

      <Text
        position={[0, -2.85, 0.28]}
        fontSize={0.11}
        color="#9f8b6a"
        anchorX="center"
        letterSpacing={0.08}
      >
        FUTURE EXPERIENCE
      </Text>
    </group>
  );
}

export default function Lobby({
  onOpenCommunityWall,
  onSponsorClick,
}) {
    const [roomCounts, setRoomCounts] = useState({
    Identity: 0,
    Love: 0,
    Creativity: 0,
  });

  const totalMosaic =
  roomCounts.Identity +
  roomCounts.Love +
  roomCounts.Creativity;

  const earlyAccessLimit = 1000;

const earlyAccessClaimed = Math.min(
  totalMosaic,
  earlyAccessLimit
);

const earlyAccessRemaining = Math.max(
  earlyAccessLimit - earlyAccessClaimed,
  0
);

const earlyAccessProgress =
  earlyAccessClaimed / earlyAccessLimit;

const earlyAccessBarWidth = 3.6;

const earlyAccessFillWidth = Math.max(
  0.04,
  earlyAccessBarWidth * earlyAccessProgress
);

  const [news, setNews] = useState([]);

  const [hoveredOfficialLink, setHoveredOfficialLink] = useState(null);

  const [communityWallHovered, setCommunityWallHovered] =
  useState(false);

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
  position={[0, -0.92, 0.12]}
  fontSize={0.18}
  color="#d7b56d"
  anchorX="center"
>
  {`TOTAL MOSAIC: ${totalMosaic.toLocaleString()} / 3,000,000`}
</Text>

 {/* Early Access separator */}
<mesh position={[0, -1.32, 0.1]}>
  <boxGeometry args={[3.8, 0.025, 0.025]} />

  <meshBasicMaterial
    color="#d7b56d"
    transparent
    opacity={0.5}
  />
</mesh>

<Text
  position={[0, -1.55, 0.12]}
  fontSize={0.18}
  color="#d7b56d"
  anchorX="center"
  letterSpacing={0.12}
>
  EARLY ACCESS
</Text>

<Text
  position={[0, -1.82, 0.12]}
  fontSize={0.105}
  color="#6b5a3f"
  anchorX="center"
  maxWidth={3.8}
  textAlign="center"
>
  First 1,000 participants join at reduced prices
</Text>

<Text
  position={[0, -2.08, 0.12]}
  fontSize={0.115}
  color="#4f4638"
  anchorX="center"
>
  IDENTITY €5   ·   LOVE €5   ·   CREATIVITY €10
</Text>

{/* Progress bar background */}
<mesh position={[0, -2.34, 0.1]}>
  <boxGeometry args={[earlyAccessBarWidth, 0.085, 0.035]} />

  <meshBasicMaterial
    color="#5e584f"
    transparent
    opacity={0.55}
  />
</mesh>

{/* Progress bar fill */}
<mesh
  position={[
    -earlyAccessBarWidth / 2 +
      earlyAccessFillWidth / 2,
    -2.34,
    0.13,
  ]}
>
  <boxGeometry
    args={[earlyAccessFillWidth, 0.105, 0.045]}
  />

  <meshBasicMaterial color="#d7b56d" />
</mesh>

<Text
  position={[0, -2.58, 0.12]}
  fontSize={0.105}
  color="#5b4630"
  anchorX="center"
>
  {`${earlyAccessClaimed.toLocaleString()} / ${earlyAccessLimit.toLocaleString()} spots claimed`}
</Text>

<Text
  position={[0, -2.82, 0.12]}
  fontSize={0.11}
  color="#8a7758"
  anchorX="center"
>
  {earlyAccessRemaining > 0
    ? `${earlyAccessRemaining.toLocaleString()} Early Access spots remaining`
    : "Early Access allocation completed"}
</Text>
</group>
        
      <group
  position={[0, 0.15, 10.55]}
  rotation={[0, Math.PI, 0]}
>
  <mesh position={[0, 0, -0.05]}>
    <boxGeometry args={[5.2, 1.70, 0.12]} />

    <meshStandardMaterial
      color="#140805"
      emissive="#8a4b12"
      emissiveIntensity={0.22}
      roughness={0.32}
      metalness={0.35}
    />
  </mesh>

  <mesh position={[0, 0.83, 0]}>
    <boxGeometry args={[4.85, 0.045, 0.08]} />

    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={0.7}
    />
  </mesh>

  <mesh position={[0, -0.83, 0]}>
    <boxGeometry args={[4.85, 0.045, 0.08]} />

    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={0.45}
    />
  </mesh>

  <Text
    position={[0, 0.43, 0.08]}
    fontSize={0.2}
    color="#f8d890"
    anchorX="center"
    letterSpacing={0.08}
  >
    VISIT OUR OFFICIAL WEBSITE
  </Text>

  <Text
    position={[0, 0.07, 0.08]}
    fontSize={0.1}
    color="#c9a96b"
    anchorX="center"
    maxWidth={4}
    textAlign="center"
  >
    Discover the story, mission, news and global vision of The Human Mosaic
  </Text>

  <Text
  position={[0, -0.28, 0.08]}
  fontSize={0.17}
  color={
    hoveredOfficialLink === "website"
      ? "#ffffff"
      : "#f2c879"
  }
  anchorX="center"
  fontWeight={700}
  onPointerOver={(event) => {
    event.stopPropagation();
    setHoveredOfficialLink("website");
    document.body.style.cursor = "pointer";
  }}
  onPointerOut={(event) => {
    event.stopPropagation();
    setHoveredOfficialLink(null);
    document.body.style.cursor = "default";
  }}
  onClick={(event) => {
    event.stopPropagation();

    window.open(
      "https://thehumanmosaic.art",
      "_blank",
      "noopener,noreferrer"
    );
  }}
>
  THEHUMANMOSAIC.ART
</Text>

        <Text
  position={[0, -0.46, 0.08]}
  fontSize={0.085}
  color="#9f8b6a"
  anchorX="center"
  letterSpacing={0.05}
>
  FOLLOW OUR GLOBAL JOURNEY
</Text>

  <Text
  position={[-0.95, -0.60, 0.08]}
  fontSize={0.11}
  color={
    hoveredOfficialLink === "instagram"
      ? "#ffffff"
      : "#d8c7ad"
  }
  anchorX="center"
  onPointerOver={(event) => {
    event.stopPropagation();
    setHoveredOfficialLink("instagram");
    document.body.style.cursor = "pointer";
  }}
  onPointerOut={(event) => {
    event.stopPropagation();
    setHoveredOfficialLink(null);
    document.body.style.cursor = "default";
  }}
  onClick={(event) => {
    event.stopPropagation();

    window.open(
      "https://www.instagram.com/thehumanmosaic.art",
      "_blank",
      "noopener,noreferrer"
    );
  }}
>
  INSTAGRAM
</Text>

  <Text
  position={[0.95, -0.60, 0.08]}
  fontSize={0.11}
  color={
    hoveredOfficialLink === "facebook"
      ? "#ffffff"
      : "#d8c7ad"
  }
  anchorX="center"
  onPointerOver={(event) => {
    event.stopPropagation();
    setHoveredOfficialLink("facebook");
    document.body.style.cursor = "pointer";
  }}
  onPointerOut={(event) => {
    event.stopPropagation();
    setHoveredOfficialLink(null);
    document.body.style.cursor = "default";
  }}
  onClick={(event) => {
    event.stopPropagation();

    window.open(
      "https://www.facebook.com/profile.php?id=61573309801007&locale=it_IT",
      "_blank",
      "noopener,noreferrer"
    );
  }}
>
  FACEBOOK
</Text>
</group>

      {/* Future Humanity Impact wall */}
<HumanityImpactDoor
  position={[-13.95, 1.45, 0]}
  rotation={[0, Math.PI / 2, 0]}
  color="#d7b56d"
/>

    <group position={[11.72, 3.3, 0]} rotation={[0, -Math.PI / 2, 0]}>
  {/* Left sponsor */}
<SponsorPanel
  position={[-4.2, 0, 0]}
  placement="lobby-left"
  label="PARTNER SPACE"
  onSponsorClick={onSponsorClick}
/>

  {/* Community wall */}
<group
  position={[0, 0.15, 0]}
  scale={communityWallHovered ? 1.035 : 1}
  onPointerOver={(event) => {
    event.stopPropagation();
    setCommunityWallHovered(true);
    document.body.style.cursor = "pointer";
  }}
  onPointerOut={(event) => {
    event.stopPropagation();
    setCommunityWallHovered(false);
    document.body.style.cursor = "default";
  }}
  onClick={(event) => {
    event.stopPropagation();
    onOpenCommunityWall?.();
  }}
>
  {/* External golden frame */}
<mesh position={[0, 0, -0.05]}>
  <boxGeometry args={[4.8, 5.6, 0.24]} />

  <meshStandardMaterial
    color={
      communityWallHovered
        ? "#f2c879"
        : "#b88932"
    }
    emissive="#d7b56d"
    emissiveIntensity={
      communityWallHovered ? 0.85 : 0.38
    }
    metalness={0.82}
    roughness={0.24}
  />
</mesh>

{/* Dark frame depth */}
<mesh position={[0, 0, 0.08]}>
  <boxGeometry args={[4.48, 5.28, 0.20]} />

  <meshStandardMaterial
    color="#241407"
    emissive="#6b4315"
    emissiveIntensity={0.16}
    metalness={0.34}
    roughness={0.42}
  />
</mesh>

{/* Black museum panel */}
<mesh position={[0, 0, 0.19]}>
  <boxGeometry args={[4.18, 4.98, 0.18]} />

  <meshStandardMaterial
    color="#050302"
    emissive="#120904"
    emissiveIntensity={
      communityWallHovered ? 0.24 : 0.10
    }
    metalness={0.16}
    roughness={0.72}
  />
</mesh>

{/* Inner golden border */}
<mesh position={[0, 0, 0.30]}>
  <boxGeometry args={[3.96, 4.76, 0.025]} />

  <meshBasicMaterial
    color="#d7b56d"
    transparent
    opacity={
      communityWallHovered ? 0.26 : 0.13
    }
  />
</mesh>

{/* Inner black surface */}
<mesh position={[0, 0, 0.325]}>
  <boxGeometry args={[3.88, 4.68, 0.028]} />

  <meshBasicMaterial color="#080504" />
</mesh>

  <Text
    position={[0, 1.85, 0.38]}
fontSize={0.32}
color={
  communityWallHovered
    ? "#fff4d8"
    : "#d7b56d"
}
    anchorX="center"
    letterSpacing={0.08}
  >
    COMMUNITY WALL
  </Text>

  <Text
    position={[0, 0.75, 0.38]}
fontSize={0.15}
color="#e2c486"
    anchorX="center"
    maxWidth={3.4}
    textAlign="center"
  >
    Messages from participants around the world
  </Text>

  <Text
    position={[0, -0.25, 0.38]}
fontSize={0.15}
color="#d7b56d"
    anchorX="center"
    maxWidth={3.5}
    textAlign="center"
  >
    “Every memory becomes part of humanity.”
  </Text>

  <Text
    position={[0, -1.35, 0.38]}
fontSize={0.14}
color={
  communityWallHovered
    ? "#ffffff"
    : "#f2c879"
}
    anchorX="center"
    letterSpacing={0.08}
  >
    {communityWallHovered
      ? "CLICK TO OPEN"
      : "OPEN COMMUNITY WALL"}
  </Text>
</group>

  {/* Right sponsor */}
<SponsorPanel
  position={[4.2, 0, 0]}
  placement="lobby-right"
  label="PARTNER SPACE"
  onSponsorClick={onSponsorClick}
/>
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
