import { Stars } from "@react-three/drei";

export default function AtmosphereParticles() {
  return (
    <Stars
      radius={18}
      depth={10}
      count={450}
      factor={0.55}
      saturation={0}
      fade
      speed={0.18}
    />
  );
}
