import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import GalleryV2Prototype from "./gallery-v2/GalleryV2Prototype.jsx";
import "./style.css";
import { AuthProvider } from "./auth/AuthProvider.jsx";

const pathname = window.location.pathname.replace(/\/+$/, "");
const isGalleryV2 = pathname === "/gallery-v2";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isGalleryV2 ? (
      <GalleryV2Prototype />
    ) : (
      <AuthProvider>
        <App />
      </AuthProvider>
    )}
  </React.StrictMode>
);
