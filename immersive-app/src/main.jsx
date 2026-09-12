import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import GalleryV2Prototype from "./gallery-v2/GalleryV2Prototype.jsx";
import GalleryWall3DPrototype from "./gallery-v2/GalleryWall3DPrototype.jsx";
import "./style.css";
import { AuthProvider } from "./auth/AuthProvider.jsx";

const pathname = window.location.pathname.replace(/\/+$/, "");
const isGalleryV2 = pathname === "/gallery-v2";
const isGalleryV23D = pathname === "/gallery-v2-3d";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isGalleryV23D ? (
  <GalleryWall3DPrototype />
) : isGalleryV2 ? (
  <GalleryV2Prototype />
) : (
  <AuthProvider>
    <App />
  </AuthProvider>
)}
  </React.StrictMode>
);
