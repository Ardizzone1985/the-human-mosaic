import GalleryPhotoGrid3D from "./GalleryPhotoGrid3D";

export default function GalleryPhotoWall3D({
  room = "Identity",
  wall = "Front",
  sectionNumber = 1,
  viewNumber = 1,
}) {
  return (
  <group
  position={
  wall === "Left"
    ? [-7, 2, 1]
    : wall === "Right"
    ? [7, 2, 1]
    : [0, 2, -6]
}
rotation={
  wall === "Left"
    ? [0, Math.PI / 2, 0]
    : wall === "Right"
    ? [0, -Math.PI / 2, 0]
    : [0, 0, 0]
}
>
      <mesh>
  <planeGeometry
    args={wall === "Front" ? [22, 8] : [14, 8]}
  />
        <meshStandardMaterial
          color="#e8e3d8"
          roughness={0.75}
          metalness={0.05}
        />
      </mesh>

      <group position={[0, -2, 0.05]}>
  <GalleryPhotoGrid3D
    room={room}
    wall={wall}
    sectionNumber={sectionNumber}
    viewNumber={viewNumber}
  />
</group>
    </group>
  );
}
