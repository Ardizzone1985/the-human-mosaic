import { Text, useTexture } from "@react-three/drei";
import useSponsors from "../../hooks/useSponsors.js";

export default function SponsorPanel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  label = "PARTNER SPACE",
  placement,
  onSponsorClick,
  layout = "horizontal",
}) {
  if (!placement) {
    console.warn("SponsorPanel: missing placement");
  }

  const {
    sponsor,
    loading,
  } = useSponsors(placement);

  const isVertical = layout === "vertical";

  const outerFrameSize = isVertical
    ? [2.72, 4.18, 0.12]
    : [3.72, 1.68, 0.12];

  const innerFrameSize = isVertical
    ? [2.55, 4.02, 0.05]
    : [3.55, 1.52, 0.05];

  const canvasSize = isVertical
    ? [2.22, 3.72, 0.03]
    : [3.22, 1.22, 0.03];

  function handleSponsorClick(event) {
    if (!sponsor) {
      return;
    }

    event.stopPropagation();

    if (typeof onSponsorClick === "function") {
      onSponsorClick(sponsor);
    }
  }

  function handlePointerOver(event) {
    if (!sponsor) {
      return;
    }

    event.stopPropagation();
    document.body.style.cursor = "pointer";
  }

  function handlePointerOut(event) {
    if (!sponsor) {
      return;
    }

    event.stopPropagation();
    document.body.style.cursor = "default";
  }

  return (
    <group
      position={position}
      rotation={rotation}
      onClick={handleSponsorClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* Outer wood frame */}
      <mesh>
        <boxGeometry args={outerFrameSize} />

        <meshStandardMaterial
          color="#9b6a2f"
          roughness={0.55}
          metalness={0.12}
        />
      </mesh>

      {/* Inner golden frame */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={innerFrameSize} />

        <meshStandardMaterial
          color="#d8b36d"
          roughness={0.32}
          metalness={0.38}
          emissive="#d8b36d"
          emissiveIntensity={0.08}
        />
      </mesh>

      {/* Internal canvas */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={canvasSize} />

        <meshStandardMaterial
          color="#efe8dd"
          roughness={0.88}
          metalness={0}
        />
      </mesh>

      {sponsor ? (
        <>
          {sponsor.logo_url && (
            <SponsorArtwork
              key={sponsor.logo_url}
              image={sponsor.logo_url}
              layout={layout}
            />
          )}

          <Text
            position={
              isVertical
                ? [0, -0.95, 0.1]
                : [0, -0.38, 0.1]
            }
            fontSize={isVertical ? 0.12 : 0.09}
            color="#8a6a2f"
            anchorX="center"
            anchorY="middle"
            maxWidth={isVertical ? 1.85 : 2.75}
            textAlign="center"
          >
            {sponsor.company || sponsor.title}
          </Text>
        </>
      ) : (
        <>
          <Text
            position={
              isVertical
                ? [0, 0.22, 0.09]
                : [0, 0.13, 0.09]
            }
            fontSize={isVertical ? 0.18 : 0.15}
            color="#4d4031"
            anchorX="center"
            anchorY="middle"
            maxWidth={isVertical ? 1.85 : 2.7}
            textAlign="center"
          >
            {label}
          </Text>

          <Text
            position={
              isVertical
                ? [0, -0.25, 0.09]
                : [0, -0.17, 0.09]
            }
            fontSize={isVertical ? 0.095 : 0.08}
            color="#8a6a2f"
            anchorX="center"
            anchorY="middle"
            maxWidth={isVertical ? 1.75 : 2.7}
            textAlign="center"
          >
            Become a partner of The Human Mosaic
          </Text>
        </>
      )}
    </group>
  );
}

function SponsorArtwork({
  image,
  layout = "horizontal",
}) {
  const texture = useTexture(image);
  texture.colorSpace = "srgb";

  const isVertical = layout === "vertical";

  return (
    <mesh
      position={
        isVertical
          ? [0, 0.55, 0.095]
          : [0, 0.12, 0.095]
      }
    >
      <planeGeometry
        args={
          isVertical
            ? [1.85, 1.35]
            : [2.6, 0.75]
        }
      />

      <meshBasicMaterial
        map={texture}
        transparent
        toneMapped={false}
      />
    </mesh>
  );
}
