import GalleryPhotoGrid3D from "./GalleryPhotoGrid3D";

export default function GalleryPhotoWall3D({
  room = "Identity",
  wall = "Front",
  sectionNumber = 1,
  viewNumber = 1,
}) {
  return (
    <group>
      <mesh>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial
          color="#e8e3d8"
          roughness={0.75}
          metalness={0.05}
        />
      </mesh>

      <GalleryPhotoGrid3D
        room={room}
        wall={wall}
        sectionNumber={sectionNumber}
        viewNumber={viewNumber}
      />
    </group>
  );
}
