import { useState } from "react";
import PrototypeWall from "./PrototypeWall";

export default function GalleryV2Prototype() {
  const [activeSection, setActiveSection] = useState(1);

  return (
    <div>
      <h1>Gallery v2 Prototype</h1>
      <p>Isolated development environment.</p>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() =>
            setActiveSection((current) => Math.max(1, current - 1))
          }
        >
          Previous Section
        </button>

        <button
          onClick={() =>
            setActiveSection((current) => current + 1)
          }
        >
          Next Section
        </button>
      </div>

      <PrototypeWall sectionNumber={activeSection} />
    </div>
  );
}
