import { useEffect, useMemo, useRef, useState } from "react";
import { Text, useTexture } from "@react-three/drei";
import RoomShell from "./RoomShell.jsx";
import { supabase } from "./supabaseClient.js";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import SponsorPanel from "./components/sponsors/SponsorPanel.jsx";

// Same Wood051 PBR finish used by the architectural doors in Lobby.jsx.
function ImpactWalnutMaterial({ tint = "#ffffff", roughness = 0.72 }) {
  const [colorMap, normalMap, roughnessMap] = useTexture([
    "/textures/Wood051_1K-JPG_Color.jpg",
    "/textures/Wood051_1K-JPG_NormalGL.jpg",
    "/textures/Wood051_1K-JPG_Roughness.jpg",
  ]);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.anisotropy = 8;
  normalMap.anisotropy = 8;
  roughnessMap.anisotropy = 8;
  return (
    <meshStandardMaterial
      color={tint}
      map={colorMap}
      normalMap={normalMap}
      normalScale={new THREE.Vector2(0.32, 0.32)}
      roughnessMap={roughnessMap}
      roughness={roughness}
      metalness={0}
    />
  );
}

export default function HumanityImpactRoom() {
  const plasterTexture = useTexture("/textures/Plaster001_1K-JPG_Color.jpg");
  const [peopleInMosaic, setPeopleInMosaic] = useState(null);
  const [donationsCompleted, setDonationsCompleted] = useState(null);
const [totalDonated, setTotalDonated] = useState(null);
  const [impactDonations, setImpactDonations] = useState([]);
  const [doorHovered, setDoorHovered] = useState(false);
  const globeRef = useRef();
  const lastHomeTapRef = useRef(0);
const homeTriggeredRef = useRef(false);

function handleHomeDoubleClick(e) {
  e.stopPropagation();

  if (homeTriggeredRef.current) return;

  const now = Date.now();

  if (now - lastHomeTapRef.current <= 400) {
    lastHomeTapRef.current = 0;
    homeTriggeredRef.current = true;
    goHome();
  } else {
    lastHomeTapRef.current = now;
  }
}
  const milestoneTarget = 1000;
  const globePoints = useMemo(() => {
  const points = [];
  const count = 420;
  const radius = 1.45;

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);

    const theta = Math.PI * (3 - Math.sqrt(5)) * i;

    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;

    points.push(
      x * radius,
      y * radius,
      z * radius
    );
  }

  return new Float32Array(points);
}, []);

const milestoneProgress =
  peopleInMosaic === null
    ? 0
    : Math.min((peopleInMosaic / milestoneTarget) * 100, 100);

  function goHome() {
    window.dispatchEvent(new Event("startFadeOut"));

    setTimeout(() => {
      window.history.pushState({}, "", "/");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }, 450);
  }

  const impactTheme = {
    ambient: "#f4dfb7",
    directional: "#ffe2a8",
    glow: "#d7b56d",
    side: "#6b5128",
  };

    useEffect(() => {
    async function loadPeopleInMosaic() {
      const { count, error } = await supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("approval_status", "approved");

      if (error) {
        console.error("Humanity Impact people count error:", error);
        return;
      }

      setPeopleInMosaic(count ?? 0);
    }

    loadPeopleInMosaic();
  }, []);

  useEffect(() => {
  async function loadImpactDonations() {
    const { data, error } = await supabase
      .from("impact_donations")
      .select("id, organization_name, donation_date, amount, currency")
.eq("is_published", true)
.order("donation_date", { ascending: true });

    if (error) {
      console.error("Humanity Impact donations error:", error);
      return;
    }

    const donations = data || [];
    setImpactDonations(donations);

    setDonationsCompleted(donations.length);

    const total = donations.reduce((sum, donation) => {
      return sum + Number(donation.amount || 0);
    }, 0);

    setTotalDonated(total);
  }

  loadImpactDonations();
}, []);

  useFrame((_, delta) => {
  if (!globeRef.current) return;

  globeRef.current.rotation.y += delta * 0.08;
});

  return (
    <>
      <RoomShell
  theme={impactTheme}
  hideFrontPanels={true}
/>
      {/* HERO WALL — Humanity Impact */}

{/* Main dark museum panel */}
<mesh position={[0, 4.3, -9.72]}>
  <boxGeometry args={[12.8, 5.9, 0.18]} />
  <meshStandardMaterial
    color="#120d08"
    roughness={0.46}
    metalness={0.18}
    emissive="#2a1606"
    emissiveIntensity={0.08}
  />
</mesh>

{/* Outer gold frame */}
<mesh position={[0, 7.25, -9.60]}>
  <boxGeometry args={[13.1, 0.08, 0.08]} />
  <meshStandardMaterial
    color="#d7b56d"
    emissive="#d7b56d"
    emissiveIntensity={0.65}
    metalness={0.72}
    roughness={0.22}
  />
</mesh>

<mesh position={[0, 1.35, -9.60]}>
  <boxGeometry args={[13.1, 0.08, 0.08]} />
  <meshStandardMaterial
    color="#d7b56d"
    emissive="#d7b56d"
    emissiveIntensity={0.45}
    metalness={0.72}
    roughness={0.22}
  />
</mesh>

<mesh position={[-6.52, 4.3, -9.60]}>
  <boxGeometry args={[0.08, 5.95, 0.08]} />
  <meshStandardMaterial
    color="#d7b56d"
    emissive="#d7b56d"
    emissiveIntensity={0.45}
    metalness={0.72}
    roughness={0.22}
  />
</mesh>

<mesh position={[6.52, 4.3, -9.60]}>
  <boxGeometry args={[0.08, 5.95, 0.08]} />
  <meshStandardMaterial
    color="#d7b56d"
    emissive="#d7b56d"
    emissiveIntensity={0.45}
    metalness={0.72}
    roughness={0.22}
  />
</mesh>

{/* Title */}
<Text
  position={[0, 6.35, -9.48]}
  fontSize={0.62}
  color="#f2c879"
  anchorX="center"
  anchorY="middle"
  letterSpacing={0.08}
>
  HUMANITY IMPACT
</Text>

{/* Subtitle */}
<Text
  position={[0, 5.55, -9.48]}
  fontSize={0.24}
  color="#e5d6bb"
  anchorX="center"
  anchorY="middle"
>
  Together we create real impact.
</Text>

{/* Intro */}
<Text
  position={[0, 4.82, -9.48]}
  fontSize={0.17}
  color="#bda989"
  anchorX="center"
  anchorY="middle"
  maxWidth={9.5}
  textAlign="center"
>
  Every contribution to The Human Mosaic helps transform a global artwork into real-world action.
</Text>

{/* Divider */}
<mesh position={[0, 4.18, -9.47]}>
  <boxGeometry args={[9.8, 0.025, 0.03]} />
  <meshBasicMaterial
    color="#d7b56d"
    transparent
    opacity={0.55}
  />
</mesh>

{/* Placeholder labels */}
<Text
  position={[-4, 3.25, -9.46]}
  fontSize={0.18}
  color="#f2c879"
  anchorX="center"
  anchorY="middle"
  letterSpacing={0.08}
>
  PEOPLE IN THE MOSAIC
</Text>

<Text
  position={[0, 3.25, -9.46]}
  fontSize={0.18}
  color="#f2c879"
  anchorX="center"
  anchorY="middle"
  letterSpacing={0.08}
>
  DONATIONS COMPLETED
</Text>

<Text
  position={[4, 3.25, -9.46]}
  fontSize={0.18}
  color="#f2c879"
  anchorX="center"
  anchorY="middle"
  letterSpacing={0.08}
>
  TOTAL DONATED
</Text>

{/* Temporary values */}
<Text
  position={[-4, 2.55, -9.46]}
  fontSize={0.52}
  color="#ffffff"
  anchorX="center"
  anchorY="middle"
>
  {peopleInMosaic === null
    ? "—"
    : peopleInMosaic.toLocaleString("en-US")}
</Text>

<Text
  position={[0, 2.55, -9.46]}
  fontSize={0.52}
  color="#ffffff"
  anchorX="center"
  anchorY="middle"
>
  {donationsCompleted === null
    ? "—"
    : donationsCompleted.toLocaleString("en-US")}
</Text>
      
<Text
  position={[4, 2.55, -9.46]}
  fontSize={0.52}
  color="#ffffff"
  anchorX="center"
  anchorY="middle"
>
  {totalDonated === null
    ? "—"
    : `€${totalDonated.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`}
</Text>

      {/* IMPACT JOURNEY — Left Wall */}

{/* Main timeline panel */}
<group
  position={[-10.72, 4.3, 0.2]}
  rotation={[0, Math.PI / 2, 0]}
>
  {/* Dark museum panel */}
  <mesh>
    <boxGeometry args={[12.8, 6.6, 0.18]} />
    <meshStandardMaterial
      color="#120d08"
      roughness={0.48}
      metalness={0.16}
      emissive="#241407"
      emissiveIntensity={0.07}
    />
  </mesh>

  {/* Gold frame */}
  <mesh position={[0, 3.32, 0.12]}>
    <boxGeometry args={[13.05, 0.08, 0.08]} />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={0.55}
      metalness={0.7}
      roughness={0.22}
    />
  </mesh>

  <mesh position={[0, -3.32, 0.12]}>
    <boxGeometry args={[13.05, 0.08, 0.08]} />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={0.4}
      metalness={0.7}
      roughness={0.22}
    />
  </mesh>

  <mesh position={[-6.52, 0, 0.12]}>
    <boxGeometry args={[0.08, 6.65, 0.08]} />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={0.4}
      metalness={0.7}
      roughness={0.22}
    />
  </mesh>

  <mesh position={[6.52, 0, 0.12]}>
    <boxGeometry args={[0.08, 6.65, 0.08]} />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={0.4}
      metalness={0.7}
      roughness={0.22}
    />
  </mesh>

  {/* Heading */}
  <Text
    position={[0, 2.55, 0.18]}
    fontSize={0.52}
    color="#f2c879"
    anchorX="center"
    anchorY="middle"
    letterSpacing={0.08}
  >
    IMPACT JOURNEY
  </Text>

  <Text
    position={[0, 1.95, 0.18]}
    fontSize={0.19}
    color="#d8c7ad"
    anchorX="center"
    anchorY="middle"
  >
    Real actions. Real contributions. Real impact.
  </Text>

  {/* Timeline */}
  <mesh position={[0, 0.2, 0.18]}>
    <boxGeometry args={[9.8, 0.035, 0.035]} />
    <meshBasicMaterial
      color="#d7b56d"
      transparent
      opacity={0.65}
    />
  </mesh>

  {/* Dynamic Impact Journey */}
{impactDonations.map((donation, index) => {
  const count = impactDonations.length;

  const x =
    count === 1
      ? 0
      : -4.2 + (index * 8.4) / (count - 1);

  const [year, month, day] =
    donation.donation_date.split("-");

  const monthNames = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ];

  const formattedDate =
    `${day} ${monthNames[Number(month) - 1]} ${year}`;

  const amount = Number(donation.amount || 0);

  return (
    <group key={donation.id}>
      {/* Timeline point */}
      <mesh position={[x, 0.2, 0.23]}>
        <sphereGeometry args={[0.13, 24, 24]} />
        <meshStandardMaterial
          color="#f2c879"
          emissive="#d7b56d"
          emissiveIntensity={0.75}
          metalness={0.65}
          roughness={0.2}
        />
      </mesh>

      {/* Date */}
      <Text
        position={[x, -0.45, 0.20]}
        fontSize={0.20}
        color="#f2c879"
        anchorX="center"
      >
        {formattedDate}
      </Text>

      {/* Organization */}
      <Text
        position={[x, -1.0, 0.20]}
        fontSize={0.24}
        color="#ffffff"
        anchorX="center"
        maxWidth={3.2}
        textAlign="center"
      >
        {donation.organization_name.toUpperCase()}
      </Text>

      {/* Amount */}
      <Text
        position={[x, -1.48, 0.20]}
        fontSize={0.32}
        color="#ffffff"
        anchorX="center"
      >
        {donation.currency === "EUR"
          ? `€${amount.toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}`
          : `${amount.toLocaleString("en-US")} ${donation.currency}`}
      </Text>
    </group>
  );
})}
</group>

      {/* OUR COMMITMENT — Right Wall */}

<group
  position={[10.72, 4.3, 0.2]}
  rotation={[0, -Math.PI / 2, 0]}
>
  {/* Main dark museum panel */}
  <mesh>
    <boxGeometry args={[12.8, 6.6, 0.18]} />
    <meshStandardMaterial
      color="#120d08"
      roughness={0.48}
      metalness={0.16}
      emissive="#241407"
      emissiveIntensity={0.07}
    />
  </mesh>

  {/* Gold frame */}
  <mesh position={[0, 3.32, 0.12]}>
    <boxGeometry args={[13.05, 0.08, 0.08]} />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={0.55}
      metalness={0.7}
      roughness={0.22}
    />
  </mesh>

  <mesh position={[0, -3.32, 0.12]}>
    <boxGeometry args={[13.05, 0.08, 0.08]} />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={0.4}
      metalness={0.7}
      roughness={0.22}
    />
  </mesh>

  <mesh position={[-6.52, 0, 0.12]}>
    <boxGeometry args={[0.08, 6.65, 0.08]} />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={0.4}
      metalness={0.7}
      roughness={0.22}
    />
  </mesh>

  <mesh position={[6.52, 0, 0.12]}>
    <boxGeometry args={[0.08, 6.65, 0.08]} />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={0.4}
      metalness={0.7}
      roughness={0.22}
    />
  </mesh>

  {/* Heading */}
  <Text
    position={[0, 2.55, 0.18]}
    fontSize={0.52}
    color="#f2c879"
    anchorX="center"
    anchorY="middle"
    letterSpacing={0.08}
  >
    OUR COMMITMENT
  </Text>

  <Text
    position={[0, 1.95, 0.18]}
    fontSize={0.19}
    color="#d8c7ad"
    anchorX="center"
    anchorY="middle"
  >
    Participation becomes real-world action.
  </Text>

  {/* Intro */}
  <Text
    position={[0, 1.15, 0.18]}
    fontSize={0.17}
    color="#bda989"
    anchorX="center"
    anchorY="middle"
    maxWidth={9.5}
    textAlign="center"
    lineHeight={1.45}
  >
    The Human Mosaic is committed to transforming the growth of this global artwork into meaningful contributions for humanity and the planet.
  </Text>

  {/* Divider */}
  <mesh position={[0, 0.35, 0.18]}>
    <boxGeometry args={[9.8, 0.03, 0.03]} />
    <meshBasicMaterial
      color="#d7b56d"
      transparent
      opacity={0.6}
    />
  </mesh>

  {/* Milestone 1 */}
  <group position={[-3.4, -1.05, 0.18]}>
    <Text
      position={[0, 0.45, 0]}
      fontSize={0.30}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
    >
      1,000
    </Text>

    <Text
      position={[0, 0, 0]}
      fontSize={0.16}
      color="#f2c879"
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.08}
    >
      PARTICIPANTS
    </Text>

    <Text
      position={[0, -0.52, 0]}
      fontSize={0.14}
      color="#d8c7ad"
      anchorX="center"
      anchorY="middle"
      maxWidth={3.0}
      textAlign="center"
    >
      A new impact milestone is activated.
    </Text>
  </group>

  {/* Arrow / transformation */}
  <Text
    position={[0, -1.02, 0.18]}
    fontSize={0.42}
    color="#d7b56d"
    anchorX="center"
    anchorY="middle"
  >
    →
  </Text>

  {/* Impact outcome */}
  <group position={[3.4, -1.05, 0.18]}>
    <Text
      position={[0, 0.45, 0]}
      fontSize={0.26}
      color="#ffffff"
      anchorX="center"
      anchorY="middle"
    >
      REAL IMPACT
    </Text>

    <Text
      position={[0, -0.05, 0]}
      fontSize={0.16}
      color="#f2c879"
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.06}
    >
      HUMANITY + PLANET
    </Text>

    <Text
      position={[0, -0.55, 0]}
      fontSize={0.14}
      color="#d8c7ad"
      anchorX="center"
      anchorY="middle"
      maxWidth={3.2}
      textAlign="center"
    >
      Contributions are directed toward humanitarian and environmental causes.
    </Text>
  </group>
</group>
      
      {/* Rear wall — HOME wall */}
<mesh position={[0, 4, 10.85]}>
  <boxGeometry args={[22, 12, 0.28]} />

  <meshStandardMaterial
  map={plasterTexture}
  color="#f5f2ec"
  roughness={0.85}
  metalness={0}
/>
</mesh>

      {/* IMPACT TRANSPARENCY — Rear Wall Left */}

<group
  position={[-5.2, 4.15, 10.66]}
  rotation={[0, Math.PI, 0]}
>
  {/* Dark museum panel */}
  <mesh>
    <boxGeometry args={[6.2, 5.1, 0.16]} />
    <meshStandardMaterial
      color="#120d08"
      roughness={0.48}
      metalness={0.16}
      emissive="#241407"
      emissiveIntensity={0.07}
    />
  </mesh>

  {/* Gold frame */}
  <mesh position={[0, 2.57, 0.11]}>
    <boxGeometry args={[6.35, 0.07, 0.07]} />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={0.55}
      metalness={0.7}
      roughness={0.22}
    />
  </mesh>

  <mesh position={[0, -2.57, 0.11]}>
    <boxGeometry args={[6.35, 0.07, 0.07]} />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={0.4}
      metalness={0.7}
      roughness={0.22}
    />
  </mesh>

  <mesh position={[-3.17, 0, 0.11]}>
    <boxGeometry args={[0.07, 5.15, 0.07]} />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={0.4}
      metalness={0.7}
      roughness={0.22}
    />
  </mesh>

  <mesh position={[3.17, 0, 0.11]}>
    <boxGeometry args={[0.07, 5.15, 0.07]} />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={0.4}
      metalness={0.7}
      roughness={0.22}
    />
  </mesh>

  {/* Heading */}
  <Text
    position={[0, 1.75, 0.16]}
    fontSize={0.36}
    color="#f2c879"
    anchorX="center"
    anchorY="middle"
    letterSpacing={0.07}
  >
    IMPACT TRANSPARENCY
  </Text>

  <Text
    position={[0, 1.25, 0.16]}
    fontSize={0.15}
    color="#d8c7ad"
    anchorX="center"
    anchorY="middle"
  >
    Every contribution. Clearly documented.
  </Text>

  {/* Divider */}
  <mesh position={[0, 0.72, 0.16]}>
    <boxGeometry args={[4.8, 0.025, 0.025]} />
    <meshBasicMaterial
      color="#d7b56d"
      transparent
      opacity={0.6}
    />
  </mesh>

  {/* Total donated */}
  <Text
    position={[-1.65, 0.15, 0.16]}
    fontSize={0.14}
    color="#f2c879"
    anchorX="center"
    anchorY="middle"
    letterSpacing={0.06}
  >
    TOTAL DONATED
  </Text>

  <Text
    position={[-1.65, -0.35, 0.16]}
    fontSize={0.42}
    color="#ffffff"
    anchorX="center"
    anchorY="middle"
  >
    {totalDonated === null
      ? "—"
      : `€${totalDonated.toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}`}
  </Text>

  {/* Contributions */}
  <Text
    position={[1.65, 0.15, 0.16]}
    fontSize={0.14}
    color="#f2c879"
    anchorX="center"
    anchorY="middle"
    letterSpacing={0.06}
  >
    CONTRIBUTIONS
  </Text>

  <Text
    position={[1.65, -0.35, 0.16]}
    fontSize={0.42}
    color="#ffffff"
    anchorX="center"
    anchorY="middle"
  >
    {donationsCompleted === null
      ? "—"
      : donationsCompleted.toLocaleString("en-US")}
  </Text>

  {/* Footer */}
  <Text
    position={[0, -1.45, 0.16]}
    fontSize={0.14}
    color="#bda989"
    anchorX="center"
    anchorY="middle"
    maxWidth={5}
    textAlign="center"
  >
    Published contributions are recorded in the Impact Journey.
  </Text>
</group>

      {/* NEXT MILESTONE — Rear Wall Right */}

<group
  position={[5.2, 4.15, 10.66]}
  rotation={[0, Math.PI, 0]}
>
  {/* Dark museum panel */}
  <mesh>
    <boxGeometry args={[6.2, 5.1, 0.16]} />
    <meshStandardMaterial
      color="#120d08"
      roughness={0.48}
      metalness={0.16}
      emissive="#241407"
      emissiveIntensity={0.07}
    />
  </mesh>

  {/* Gold frame */}
  <mesh position={[0, 2.57, 0.11]}>
    <boxGeometry args={[6.35, 0.07, 0.07]} />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={0.55}
      metalness={0.7}
      roughness={0.22}
    />
  </mesh>

  <mesh position={[0, -2.57, 0.11]}>
    <boxGeometry args={[6.35, 0.07, 0.07]} />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={0.4}
      metalness={0.7}
      roughness={0.22}
    />
  </mesh>

  <mesh position={[-3.17, 0, 0.11]}>
    <boxGeometry args={[0.07, 5.15, 0.07]} />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={0.4}
      metalness={0.7}
      roughness={0.22}
    />
  </mesh>

  <mesh position={[3.17, 0, 0.11]}>
    <boxGeometry args={[0.07, 5.15, 0.07]} />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={0.4}
      metalness={0.7}
      roughness={0.22}
    />
  </mesh>

  {/* Heading */}
  <Text
    position={[0, 1.75, 0.16]}
    fontSize={0.36}
    color="#f2c879"
    anchorX="center"
    anchorY="middle"
    letterSpacing={0.07}
  >
    NEXT MILESTONE
  </Text>

  <Text
    position={[0, 1.25, 0.16]}
    fontSize={0.15}
    color="#d8c7ad"
    anchorX="center"
    anchorY="middle"
  >
    Our next step toward real-world impact.
  </Text>

  {/* Divider */}
  <mesh position={[0, 0.72, 0.16]}>
    <boxGeometry args={[4.8, 0.025, 0.025]} />
    <meshBasicMaterial
      color="#d7b56d"
      transparent
      opacity={0.6}
    />
  </mesh>

  {/* Current progress */}
  <Text
    position={[0, 0.15, 0.16]}
    fontSize={0.38}
    color="#ffffff"
    anchorX="center"
    anchorY="middle"
  >
    {peopleInMosaic === null
      ? "— / 1,000"
      : `${peopleInMosaic.toLocaleString("en-US")} / 1,000`}
  </Text>

  <Text
    position={[0, -0.28, 0.16]}
    fontSize={0.14}
    color="#f2c879"
    anchorX="center"
    anchorY="middle"
    letterSpacing={0.08}
  >
    PARTICIPANTS
  </Text>

  {/* Progress bar background */}
  <mesh position={[0, -0.88, 0.16]}>
    <boxGeometry args={[4.8, 0.18, 0.035]} />
    <meshBasicMaterial
      color="#3a3024"
      transparent
      opacity={0.85}
    />
  </mesh>

  {/* Progress bar fill */}
  <mesh
    position={[
      -2.4 + (4.8 * milestoneProgress) / 200,
      -0.88,
      0.19,
    ]}
  >
    <boxGeometry
      args={[
        (4.8 * milestoneProgress) / 100,
        0.18,
        0.04,
      ]}
    />
    <meshStandardMaterial
      color="#d7b56d"
      emissive="#d7b56d"
      emissiveIntensity={0.7}
      metalness={0.6}
      roughness={0.2}
    />
  </mesh>

  {/* Percentage */}
  <Text
    position={[0, -1.28, 0.16]}
    fontSize={0.22}
    color="#ffffff"
    anchorX="center"
    anchorY="middle"
  >
    {peopleInMosaic === null
      ? "—"
      : `${milestoneProgress.toFixed(1)}%`}
  </Text>

  {/* Footer */}
  <Text
    position={[0, -1.75, 0.16]}
    fontSize={0.14}
    color="#bda989"
    anchorX="center"
    anchorY="middle"
    maxWidth={5}
    textAlign="center"
  >
    Every participant brings the Mosaic closer to the next impact milestone.
  </Text>
</group>

      {/* PARTNER SPACE — Left Side */}
<SponsorPanel
  position={[-10.58, 3.35, 8.15]}
  rotation={[0, Math.PI / 2, 0]}
  label="PARTNER SPACE"
  placement="humanity-impact-left"
  layout="vertical"
/>

      {/* PARTNER SPACE — Right Side */}
<SponsorPanel
  position={[10.58, 3.35, 8.15]}
  rotation={[0, -Math.PI / 2, 0]}
  label="PARTNER SPACE"
  placement="humanity-impact-right"
  layout="vertical"
/>

      {/* IMPACT GLOBE — Center Sculpture */}

<group
  ref={globeRef}
  position={[0, 3.15, 1.2]}
>
  {/* Golden particle sphere */}
  <points>
    <bufferGeometry>
      <bufferAttribute
        attach="attributes-position"
        args={[globePoints, 3]}
      />
    </bufferGeometry>

    <pointsMaterial
      color="#e4c675"
      size={0.055}
      sizeAttenuation
      transparent
      opacity={0.88}
      depthWrite={false}
    />
  </points>

  {/* Central core */}
  <mesh>
    <sphereGeometry args={[0.09, 16, 16]} />
    <meshBasicMaterial color="#f4d68a" />
  </mesh>

  {/* Subtle inner halo */}
  <mesh>
    <sphereGeometry args={[0.72, 20, 20]} />
    <meshBasicMaterial
      color="#d7b56d"
      transparent
      opacity={0.025}
      depthWrite={false}
    />
  </mesh>

  <pointLight
    color="#d7b56d"
    intensity={0.45}
    distance={4}
    decay={2}
  />
</group>

      {/* HOME — Wood051 architectural door matching the Lobby */}
      <group
        position={[0, 1.60, 10.55]}
        rotation={[0, Math.PI, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setDoorHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setDoorHovered(false);
          document.body.style.cursor = "default";
        }}
        onClick={handleHomeDoubleClick}
      >
        {/* Walnut backing and overlapping trim conceal light gaps. */}
        <mesh position={[0, 0, -0.32]}>
          <boxGeometry args={[3.28, 5.66, 0.045]} />
          <ImpactWalnutMaterial roughness={0.82} />
        </mesh>
        {[-1.34, 1.34].map((x) => (
          <mesh key={`home-jamb-${x}`} position={[x, 0, 0.035]}>
            <boxGeometry args={[0.38, 5.60, 0.14]} />
            <ImpactWalnutMaterial roughness={0.82} />
          </mesh>
        ))}
        {[-1.43, 1.43].map((x) => (
          <mesh key={`home-lip-${x}`} position={[x, 0, 0.16]}>
            <boxGeometry args={[0.30, 5.54, 0.075]} />
            <ImpactWalnutMaterial roughness={0.82} />
          </mesh>
        ))}
        <mesh position={[0, 2.68, 0.035]}>
          <boxGeometry args={[3.18, 0.25, 0.14]} />
          <ImpactWalnutMaterial roughness={0.82} />
        </mesh>
        <mesh position={[0, -0.015, 0.02]}>
          <boxGeometry args={[2.70, 5.27, 0.085]} />
          <ImpactWalnutMaterial roughness={0.78} />
        </mesh>
        <mesh position={[0, -2.70, 0.085]}>
          <boxGeometry args={[3.06, 0.16, 0.16]} />
          <ImpactWalnutMaterial roughness={0.84} />
        </mesh>
        {[-1.16, 1.16].map((y) => (
          <group key={`home-panel-${y}`}>
            <mesh position={[0, y, 0.077]}>
              <boxGeometry args={[2.24, 2.11, 0.014]} />
              <ImpactWalnutMaterial tint="#b5a79d" roughness={0.86} />
            </mesh>
            <mesh position={[0, y, 0.087]}>
              <boxGeometry args={[2.08, 1.95, 0.014]} />
              <ImpactWalnutMaterial roughness={0.72} />
            </mesh>
          </group>
        ))}
        {/* Brushed brass handle and restrained upper detail. */}
        <mesh position={[0.99, -0.18, 0.107]}>
          <boxGeometry args={[0.09, 0.31, 0.023]} />
          <meshStandardMaterial color="#ae8950" metalness={0.76} roughness={0.36} />
        </mesh>
        <mesh position={[0.89, -0.12, 0.137]}>
          <boxGeometry args={[0.25, 0.045, 0.048]} />
          <meshStandardMaterial color="#c4a16a" metalness={0.76} roughness={0.32} />
        </mesh>
        <mesh position={[0, 2.45, 0.108]}>
          <boxGeometry args={[2.13, 0.023, 0.012]} />
          <meshStandardMaterial color="#d7b56d" roughness={0.6} metalness={0.1} />
        </mesh>

        {/* HOME museum plaque */}
        <group position={[0, 3.85, 0.28]}>
          <mesh position={[0, 0, -0.03]}>
            <boxGeometry args={[2.25, 0.78, 0.12]} />
            <meshStandardMaterial color="#8b6428" emissive="#d7b56d" emissiveIntensity={0.22} metalness={0.55} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[2.05, 0.58, 0.10]} />
            <meshStandardMaterial color="#120b05" roughness={0.48} metalness={0.18} />
          </mesh>
          {[-0.86, 0.86].map((x) => (
            <mesh key={`home-plaque-detail-${x}`} position={[x, 0, 0.11]}>
              <boxGeometry args={[0.16, 0.025, 0.025]} />
              <meshStandardMaterial color="#d7b56d" emissive="#d7b56d" emissiveIntensity={0.45} />
            </mesh>
          ))}
          <Text position={[0, 0, 0.12]} fontSize={0.27} color="#f2c879" anchorX="center" anchorY="middle" letterSpacing={0.12}>
            HOME
          </Text>
        </group>
        <Text position={[0, -2.85, 0.28]} fontSize={0.12} color={doorHovered ? "#ffffff" : "#9f8b6a"} anchorX="center">
          DOUBLE CLICK / DOUBLE TAP
        </Text>
      </group>
    </>
  );
}
