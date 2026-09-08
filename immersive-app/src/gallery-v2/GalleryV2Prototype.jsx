import { useState } from "react";
import PrototypeWall from "./PrototypeWall";

export default function GalleryV2Prototype() {
  const [activeSection, setActiveSection] = useState(1);

  return (
    <div>
      <h1>Gallery v2 Prototype</h1>
      <p>Isolated development environment.</p>

      <PrototypeWall sectionNumber={activeSection} />
    </div>
  );
}
