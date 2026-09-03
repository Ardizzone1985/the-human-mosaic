import { useEffect, useState } from "react";
import { Text } from "@react-three/drei";
import RoomShell from "./RoomShell.jsx";
import { supabase } from "./supabaseClient.js";

export default function HumanityImpactRoom() {
  const [peopleInMosaic, setPeopleInMosaic] = useState(null);
  const [donationsCompleted, setDonationsCompleted] = useState(null);
const [totalDonated, setTotalDonated] = useState(null);
  const [impactDonations, setImpactDonations] = useState([]);
  const [doorHovered, setDoorHovered] = useState(false);

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
  color="#d8d0c3"
  roughness={0.72}
  metalness={0.04}
  emissive="#f2efe8"
  emissiveIntensity={0.02}
/>
</mesh>

      {/* HOME door */}
      <group
        position={[0, 0.55, 10.55]}
        rotation={[0, Math.PI, 0]}
        scale={doorHovered ? 1.06 : 1}
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
        onClick={(e) => {
          e.stopPropagation();
          goHome();
        }}
      >
        {/* Outer frame */}
        <mesh position={[0, 0, -0.08]}>
          <boxGeometry args={[2.4, 3.7, 0.18]} />
          <meshStandardMaterial
            color={doorHovered ? "#d7b56d" : "#5a3a16"}
            emissive="#d7b56d"
            emissiveIntensity={doorHovered ? 0.6 : 0.18}
            roughness={0.34}
            metalness={0.28}
          />
        </mesh>

        {/* Door */}
        <mesh>
          <boxGeometry args={[1.85, 3.2, 0.2]} />
          <meshStandardMaterial
            color="#3b1f12"
            roughness={0.42}
            metalness={0.18}
          />
        </mesh>

        {/* Black inset */}
        <mesh position={[0, 0, 0.12]}>
          <boxGeometry args={[1.45, 2.65, 0.04]} />
          <meshStandardMaterial
            color="#160703"
            roughness={0.65}
          />
        </mesh>

        {/* Handle */}
        <mesh position={[0.72, 0, 0.22]}>
          <sphereGeometry args={[0.065, 16, 16]} />
          <meshStandardMaterial
            color="#d7b56d"
            emissive="#d7b56d"
            emissiveIntensity={doorHovered ? 0.75 : 0.28}
            metalness={0.8}
            roughness={0.22}
          />
        </mesh>

        <Text
          position={[0, 0.35, 0.25]}
          fontSize={0.25}
          color="#f2c879"
          anchorX="center"
          anchorY="middle"
        >
          HOME
        </Text>

        <Text
          position={[0, -0.08, 0.25]}
          fontSize={0.12}
          color="#d8c7ad"
          anchorX="center"
          anchorY="middle"
        >
          Return to Lobby
        </Text>
      </group>
    </>
  );
}
