import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState, useRef } from "react";
import RoomShell from "./RoomShell.jsx";
import LivePhotoWall from "./LivePhotoWall.jsx";
import InfoWall from "./InfoWall.jsx";
import DynamicSectionManager from "./DynamicSectionManager.jsx";
import Lobby from "./Lobby.jsx";
import * as THREE from "three";
import { supabase } from "./supabaseClient.js";

function parseSlotCode(slotCode) {
  if (!slotCode) return null;

  const rowMatch = slotCode.match(/R(\d+)/i);
  const colMatch = slotCode.match(/C(\d+)/i);

  if (!rowMatch || !colMatch) return null;

  return {
    row: Number(rowMatch[1]),
    col: Number(colMatch[1])
  };
}

function slotToPosition(slotCode, wall) {
  const parsed = parseSlotCode(slotCode);

  if (!parsed) {
    return {
      position: [0, 3, -5.55],
      rotation: [0, 0, 0]
    };
  }

  const slotSizeX = 0.32;
  const slotSizeY = 0.32;

  const col = parsed.col - 1;
  const row = parsed.row - 1;

  if (wall === "Front Wall") {
    return {
      position: [-8.5 + col * slotSizeX, 6.2 - row * slotSizeY, -5.45],
      rotation: [0, 0, 0]
    };
  }

  if (wall === "Left Wall") {
    return {
      position: [-10.55, 6.2 - row * slotSizeY, -4.8 + col * slotSizeX],
      rotation: [0, Math.PI / 2, 0]
    };
  }

  if (wall === "Right Wall") {
    return {
      position: [10.55, 6.2 - row * slotSizeY, -4.8 + col * slotSizeX],
      rotation: [0, -Math.PI / 2, 0]
    };
  }

  return {
    position: [0, 3, -5.45],
    rotation: [0, 0, 0]
  };
}

const ROOM_THEMES = {
  Identity: {
    ambient: "#ffddaa",
    directional: "#ffd89b",
    glow: "#ffb45e",
    side: "#6d3b12"
  },

  Love: {
    ambient: "#ffd6e8",
    directional: "#ff8fc2",
    glow: "#ff6fa8",
    side: "#7a2148"
  },

  Creativity: {
    ambient: "#d6e4ff",
    directional: "#8fb8ff",
    glow: "#5da2ff",
    side: "#1d3f78"
  }
};

const LOBBY_BOUNDS = {
  minX: -10.45,
  maxX: 10.45,
  minZ: -8.25,
  maxZ: 9.25,
  minY: 1.75,
  maxY: 3.1
};

const ROOM_BOUNDS = {
  minX: -10.45,
  maxX: 10.45,
  minZ: -9.55,
  maxZ: 10.05,
  minY: 1.75,
  maxY: 3.1
};

const ROOM_VIEWPOINTS = [
  { id: "center", position: [0, 2.05, 1.2] },
  { id: "front", position: [0, 2.05, -5.6] },
  { id: "back", position: [0, 2.05, 6.8] },
  { id: "left", position: [-6.8, 2.05, 1.2] },
  { id: "right", position: [6.8, 2.05, 1.2] },
  { id: "frontLeft", position: [-5.6, 2.05, -5.2] },
  { id: "frontRight", position: [5.6, 2.05, -5.2] },
  { id: "backLeft", position: [-5.6, 2.05, 5.8] },
  { id: "backRight", position: [5.6, 2.05, 5.8] }
];

const LOBBY_VIEWPOINTS = [
  { id: "center", position: [0, 2.05, 1.8] },

  { id: "welcomeWall", position: [0, 2.05, 7.2] },

  { id: "infoWall", position: [-7.2, 2.05, 0] },

  { id: "futureWall", position: [7.2, 2.05, 0] }
];

function applyCameraBounds(camera, bounds) {
  camera.position.x = THREE.MathUtils.clamp(
    camera.position.x,
    bounds.minX,
    bounds.maxX
  );

  camera.position.z = THREE.MathUtils.clamp(
    camera.position.z,
    bounds.minZ,
    bounds.maxZ
  );

  camera.position.y = THREE.MathUtils.clamp(
    camera.position.y,
    bounds.minY,
    bounds.maxY
  );
}

function applyInfoWallCollision(camera) {
  const wallMinX = -3.8;
  const wallMaxX = 3.8;

  const wallMinZ = -10.2;
  const wallMaxZ = -8.7;

  if (
    camera.position.x > wallMinX &&
    camera.position.x < wallMaxX &&
    camera.position.z > wallMinZ &&
    camera.position.z < wallMaxZ
  ) {
    camera.position.z = wallMaxZ;
  }
}

function applyCornerCollisions(camera) {
  const margin = 0.55;

  if (camera.position.x < ROOM_BOUNDS.minX + margin) {
    camera.position.x = ROOM_BOUNDS.minX + margin;
  }

  if (camera.position.x > ROOM_BOUNDS.maxX - margin) {
    camera.position.x = ROOM_BOUNDS.maxX - margin;
  }

  if (camera.position.z < ROOM_BOUNDS.minZ + margin) {
    camera.position.z = ROOM_BOUNDS.minZ + margin;
  }

  if (camera.position.z > ROOM_BOUNDS.maxZ - margin) {
    camera.position.z = ROOM_BOUNDS.maxZ - margin;
  }
}

function RoomCameraBounds() {
  const { camera } = useThree();

  useFrame(() => {
    applyCameraBounds(camera, ROOM_BOUNDS);
    applyInfoWallCollision(camera);
    applyCornerCollisions(camera);
  });

  return null;
}

function StreetViewControls({ currentPointId, targetPointId, points = ROOM_VIEWPOINTS }) {
  const { camera } = useThree();

  useEffect(() => {
    const startPoint = points.find((p) => p.id === currentPointId);
    if (!startPoint) return;

    camera.position.set(...startPoint.position);
    camera.rotation.order = "YXZ";
  }, [camera, currentPointId]);

  useFrame(() => {
    const targetPoint = points.find((p) => p.id === targetPointId);
    if (!targetPoint) return;

    camera.position.lerp(
      new THREE.Vector3(...targetPoint.position),
      0.06
    );
  });

  return null;
}

function StreetViewLookControls() {
  const { camera, gl } = useThree();
  const dragging = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const yaw = useRef(0);
  const pitch = useRef(0);

  useEffect(() => {
    camera.rotation.order = "YXZ";

    function start(x, y) {
      dragging.current = true;
      lastX.current = x;
      lastY.current = y;
    }

    function move(x, y) {
      if (!dragging.current) return;

      const dx = x - lastX.current;
      const dy = y - lastY.current;

      lastX.current = x;
      lastY.current = y;

      yaw.current -= dx * 0.004;
      pitch.current -= dy * 0.004;

      pitch.current = THREE.MathUtils.clamp(
        pitch.current,
        -Math.PI / 3.2,
        Math.PI / 3.2
      );

      camera.rotation.y = yaw.current;
      camera.rotation.x = pitch.current;
    }

    function end() {
      dragging.current = false;
    }

    function onMouseDown(e) {
      start(e.clientX, e.clientY);
    }

    function onMouseMove(e) {
      move(e.clientX, e.clientY);
    }

    function onMouseUp() {
      end();
    }

    function onTouchStart(e) {
      if (e.touches.length !== 1) return;
      start(e.touches[0].clientX, e.touches[0].clientY);
    }

    function onTouchMove(e) {
      if (e.touches.length !== 1) return;
      move(e.touches[0].clientX, e.touches[0].clientY);
    }

    function onTouchEnd() {
      end();
    }

    const el = gl.domElement;

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [camera, gl]);

  return null;
}

function FloorArrow({ point, onMove }) {
  return (
    <group
      position={[point.position[0], 0.02, point.position[2]]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onMove(point.id);
      }}
    >
      <mesh>
        <circleGeometry args={[0.42, 32]} />
        <meshBasicMaterial color="#d7b56d" transparent opacity={0.55} />
      </mesh>

      <mesh position={[0, 0.18, 0.01]}>
        <coneGeometry args={[0.18, 0.38, 3]} />
        <meshBasicMaterial color="#fff0c0" />
      </mesh>
    </group>
  );
}

function Room({ room, theme, onPhotoSelect }) {
  const currentRoom = room;
  const [currentPointId, setCurrentPointId] = useState("center");
const [targetPointId, setTargetPointId] = useState("center");
  const isDesktop =
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: fine)").matches;
  
    return (
    <>
      <RoomShell theme={theme} />
      <InfoWall room={currentRoom} />
<LivePhotoWall room={currentRoom} onPhotoSelect={onPhotoSelect} />
<DynamicSectionManager room={currentRoom} />
      <RoomCameraBounds />
      <StreetViewControls
  currentPointId={currentPointId}
  targetPointId={targetPointId}
/>
      <StreetViewLookControls />
{ROOM_VIEWPOINTS.map((point) => (
  <FloorArrow
    key={point.id}
    point={point}
    onMove={(id) => {
            setTargetPointId(id);
    }}
  />
))}
   
    </>
  );
}

export default function App() {
  const [fadeIn, setFadeIn] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [userLikedPhoto, setUserLikedPhoto] = useState(false);
  const [lobbyTargetPointId, setLobbyTargetPointId] = useState("center");
  const [showMobileTutorial, setShowMobileTutorial] = useState(() => {
  return localStorage.getItem("humanMosaicMobileTutorialSeen") !== "true";
});
  const [showLobbyIntro, setShowLobbyIntro] = useState(() => {
  return localStorage.getItem("humanMosaicLobbyIntroSeen") !== "true";
});
  
  const isMobile =
  typeof window !== "undefined" &&
  !window.matchMedia("(pointer: fine)").matches;

  useEffect(() => {
  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUser(user);
  }

  loadUser();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setCurrentUser(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}, []);

  useEffect(() => {
  async function checkUserLike() {
    if (!currentUser || !selectedPhoto?.id) {
      setUserLikedPhoto(false);
      return;
    }

    const { data } = await supabase
      .from("photo_likes")
      .select("id")
      .eq("submission_id", selectedPhoto.id)
      .eq("user_id", currentUser.id)
      .maybeSingle();

    setUserLikedPhoto(!!data);
  }
    
  checkUserLike();
}, [currentUser, selectedPhoto?.id]);

  useEffect(() => {
  async function registerView() {
    if (!selectedPhoto?.id) return;

    const viewKey = `humanMosaicViewed_${selectedPhoto.id}`;
    const lastView = localStorage.getItem(viewKey);
    const now = Date.now();

    // Conta una visualizzazione ogni 30 minuti per dispositivo
    if (lastView && now - Number(lastView) < 30 * 60 * 1000) return;

    const { data: freshPhoto, error: fetchError } = await supabase
  .from("submissions")
  .select("views_count")
  .eq("id", selectedPhoto.id)
  .single();

if (fetchError) {
  console.error("Fetch views error:", fetchError);
  return;
}

const newViewsCount = (freshPhoto?.views_count || 0) + 1;

const { error } = await supabase
  .from("submissions")
  .update({ views_count: newViewsCount })
  .eq("id", selectedPhoto.id);

    if (error) {
      console.error("View error:", error);
      return;
    }

    localStorage.setItem(viewKey, String(now));

    setSelectedPhoto({
      ...selectedPhoto,
      views_count: newViewsCount,
    });
  }

  registerView();
}, [selectedPhoto?.id]);

async function handleLike() {
  if (!selectedPhoto?.id) return;

  if (!currentUser) {
    alert("Please sign in to like this memory.");
    return;
  }

  const { data: existingLike, error: checkError } = await supabase
    .from("photo_likes")
    .select("id")
    .eq("submission_id", selectedPhoto.id)
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (checkError) {
    console.error("Check like error:", checkError);
    return;
  }

  if (existingLike) {
    alert("You have already liked this memory.");
    return;
  }

  const { error: insertError } = await supabase
    .from("photo_likes")
    .insert({
      submission_id: selectedPhoto.id,
      user_id: currentUser.id,
    });

  if (insertError) {
    console.error("Insert like error:", insertError);
    return;
  }

  const newLikesCount = (selectedPhoto.likes_count || 0) + 1;

  const { error: updateError } = await supabase
    .from("submissions")
    .update({ likes_count: newLikesCount })
    .eq("id", selectedPhoto.id);

  if (updateError) {
    console.error("Update likes_count error:", updateError);
    return;
  }

  setSelectedPhoto({
    ...selectedPhoto,
    likes_count: newLikesCount,
  });
}

  async function handleSendComment() {
  if (!currentUser) {
    alert("Please sign in to comment.");
    return;
  }

  if (!selectedPhoto?.id) return;

  if (!newComment.trim()) {
    alert("Write a comment first.");
    return;
  }

  const { error } = await supabase
    .from("photo_comments")
    .insert({
      submission_id: selectedPhoto.id,
      user_id: currentUser.id,
      comment: newComment.trim(),
    });

  if (error) {
    console.error(error);
    alert("Unable to send comment.");
    return;
  }

  const newCommentsCount = (selectedPhoto.comments_count || 0) + 1;

  await supabase
    .from("submissions")
    .update({
      comments_count: newCommentsCount,
    })
    .eq("id", selectedPhoto.id);

  setSelectedPhoto({
    ...selectedPhoto,
    comments_count: newCommentsCount,
  });

  setNewComment("");

  alert("Comment published!");
}
  
useEffect(() => {
  setTimeout(() => {
    setFadeIn(true);
  }, 120);

  window.addEventListener("startFadeOut", () => {
  setFadeIn(false);
});
}, []);
    const params = new URLSearchParams(window.location.search);

const roomParam = params.get("room");

const currentRoom =
  roomParam?.toLowerCase() === "identity"
    ? "Identity"
    : roomParam?.toLowerCase() === "love"
    ? "Love"
    : roomParam?.toLowerCase() === "creativity"
    ? "Creativity"
    : null;

const theme =
  ROOM_THEMES[currentRoom] || ROOM_THEMES.Identity;

const isLobby = !currentRoom;
  return (
    <>
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "#000",
      pointerEvents: "none",
      opacity: fadeIn ? 0 : 1,
      transition: "opacity 1.8s ease",
      zIndex: 9999
    }}
  />
      {!isLobby && (
  <div
    style={{
      position: "fixed",
      top: 18,
      left: 18,
      right: 18,
      zIndex: 20,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      pointerEvents: "none"
    }}
  >
    <div
      style={{
        padding: "10px 14px",
        borderRadius: "999px",
        background: "rgba(0,0,0,0.45)",
        border: "1px solid rgba(215,181,109,0.35)",
        color: "#f2c879",
        fontSize: "12px",
        letterSpacing: "0.12em",
        fontWeight: 700,
        backdropFilter: "blur(10px)"
      }}
    >
      {currentRoom?.toUpperCase()} ROOM
    </div>

  </div>
)}

      {isMobile && showMobileTutorial && (
  <div
    onClick={() => {
  localStorage.setItem("humanMosaicMobileTutorialSeen", "true");
  setShowMobileTutorial(false);
}}
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 999998,
      background: "rgba(0,0,0,0.72)",
      backdropFilter: "blur(10px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      boxSizing: "border-box"
    }}
  >
    <div
      style={{
        width: "min(92vw, 420px)",
        padding: "26px 22px",
        borderRadius: "26px",
        background: "rgba(18, 8, 4, 0.96)",
        border: "1px solid rgba(215,181,109,0.55)",
        color: "#fff",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0 30px 90px rgba(0,0,0,0.75)"
      }}
    >
      <div
        style={{
          color: "#f2c879",
          fontSize: "18px",
          fontWeight: 800,
          letterSpacing: "0.12em",
          marginBottom: "18px"
        }}
      >
        THE HUMAN MOSAIC
      </div>

      <div style={{ color: "#d8c7ad", fontSize: "15px", lineHeight: 1.7 }}>
        <strong>Tap the floor arrows</strong><br />
        Move through the museum<br /><br />

        <strong>Drag the screen</strong><br />
        Look around<br /><br />

        <strong>Tap a photo</strong><br />
        Open participant details
      </div>

      <div
        style={{
          marginTop: "22px",
          color: "#f2c879",
          fontSize: "13px",
          letterSpacing: "0.08em"
        }}
      >
        TAP TO START
      </div>
    </div>
  </div>
)}

      {isLobby && showLobbyIntro && !showMobileTutorial && (
  <div
    onClick={() => {
      localStorage.setItem("humanMosaicLobbyIntroSeen", "true");
      setShowLobbyIntro(false);
    }}
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 999997,
      background: "rgba(0,0,0,0.72)",
      backdropFilter: "blur(10px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      boxSizing: "border-box"
    }}
  >
    <div
      style={{
        width: "min(92vw, 460px)",
        padding: "30px 24px",
        borderRadius: "28px",
        background: "rgba(18, 8, 4, 0.96)",
        border: "1px solid rgba(215,181,109,0.6)",
        color: "#fff",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0 30px 90px rgba(0,0,0,0.78)"
      }}
    >
      <div style={{ color: "#f2c879", fontSize: "13px", letterSpacing: "0.22em", marginBottom: "12px" }}>
        THE HUMAN MOSAIC
      </div>

      <div style={{ color: "#ffffff", fontSize: "32px", fontWeight: 800, letterSpacing: "0.08em", marginBottom: "14px" }}>
        CHOOSE YOUR ROOM
      </div>

      <div style={{ color: "#d8c7ad", fontSize: "15px", lineHeight: 1.75 }}>
        Enter <strong>Identity</strong>, <strong>Love</strong> or <strong>Creativity</strong>.<br /><br />
        Explore memories from around the world inside a living global artwork.
      </div>

      <div style={{ marginTop: "24px", color: "#f2c879", fontSize: "13px", letterSpacing: "0.08em" }}>
        TAP TO ENTER THE MUSEUM
      </div>
    </div>
  </div>
)}
           
      {selectedPhoto && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.72)",
      backdropFilter: "blur(10px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      zIndex: 999999,
      boxSizing: "border-box"
    }}
  >
    <div
      style={{
        width: "min(94vw, 460px)",
        maxHeight: "82vh",
        overflowY: "auto",
        padding: "18px",
        borderRadius: "24px",
        background: "rgba(12, 6, 3, 0.96)",
        border: "1px solid rgba(215,181,109,0.55)",
        color: "#fff",
        boxShadow: "0 30px 90px rgba(0,0,0,0.75)",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <img
        src={
          "https://cqpujmwfiqbwdsmuwkmb.supabase.co/storage/v1/object/public/images/" +
          selectedPhoto.image_file_name
        }
        alt=""
        style={{
          width: "100%",
          maxHeight: "46vh",
          objectFit: "contain",
          background: "#000",
          borderRadius: "18px",
          marginBottom: "18px",
          border: "1px solid rgba(215,181,109,0.3)"
        }}
      />

      <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "18px"
  }}
>
  <div
    style={{
      flex: 1,
      padding: "10px",
      borderRadius: "14px",
      background: "rgba(215,181,109,0.10)",
      border: "1px solid rgba(215,181,109,0.22)",
      textAlign: "center",
      fontSize: "13px",
      color: "#f6d98a",
      fontWeight: 700
    }}
  >
    ❤️ {selectedPhoto?.likes_count ?? 0}
  </div>

  <div
    style={{
      flex: 1,
      padding: "10px",
      borderRadius: "14px",
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.12)",
      textAlign: "center",
      fontSize: "13px",
      color: "#e8ded0",
      fontWeight: 700
    }}
  >
    👁 {selectedPhoto?.views_count ?? 0}
  </div>

  <div
    style={{
      flex: 1,
      padding: "10px",
      borderRadius: "14px",
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.12)",
      textAlign: "center",
      fontSize: "13px",
      color: "#e8ded0",
      fontWeight: 700
    }}
  >
    💬 {selectedPhoto?.comments_count ?? 0}
  </div>
</div>

      <div style={{ color: "#d7b56d", fontSize: "12px", letterSpacing: "0.12em" }}>
        COUNTRY
      </div>

      <div style={{ fontSize: "20px", fontWeight: "700", margin: "6px 0 18px" }}>
        {selectedPhoto?.country || "Country not available."}
      </div>

      <div style={{ color: "#d7b56d", fontSize: "12px", letterSpacing: "0.12em" }}>
        NOTE
      </div>

      <div style={{ fontSize: "15px", lineHeight: "1.5", marginTop: "8px", color: "#e8ded0" }}>
        {selectedPhoto?.note || selectedPhoto?.notes || selectedPhoto?.optional_note || "No note added."}
      </div>

      <button
  onClick={handleLike}
  style={{
    width: "100%",
    padding: "14px",
    marginBottom: "12px",
    borderRadius: "14px",
    border: "none",
    background: "#d7b56d",
    color: "#111",
    fontWeight: 700,
    fontSize: "16px",
    cursor: "pointer"
  }}
>
    {
  userLikedPhoto
    ? "❤️ You liked this memory"
    : "❤️ Like this memory"
}
</button>

      <div
  style={{
    marginTop: "12px",
    padding: "14px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)"
  }}
>
  <div
    style={{
      color: "#d7b56d",
      fontSize: "12px",
      letterSpacing: "0.12em",
      marginBottom: "10px"
    }}
  >
    COMMENTS
  </div>

  <textarea
    value={newComment}
onChange={(e) => setNewComment(e.target.value)}
    placeholder="Write a comment..."
    style={{
      width: "100%",
      minHeight: "72px",
      borderRadius: "12px",
      border: "1px solid rgba(215,181,109,0.28)",
      background: "rgba(0,0,0,0.28)",
      color: "#fff",
      padding: "12px",
      resize: "vertical",
      boxSizing: "border-box",
      fontFamily: "Arial, sans-serif"
    }}
  />

  <button
    onClick={handleSendComment}
    style={{
      marginTop: "10px",
      width: "100%",
      padding: "12px",
      borderRadius: "999px",
      border: "none",
      background: "#f2c879",
      color: "#1b0d05",
      fontWeight: "700",
      cursor: "pointer"
    }}
  >
    Send comment
  </button>
</div>

      <button
        onClick={() => setSelectedPhoto(null)}
        style={{
          marginTop: "22px",
          width: "100%",
          padding: "15px",
          borderRadius: "999px",
          border: "none",
          background: "#d7b56d",
          color: "#1b0d05",
          fontWeight: "700",
          cursor: "pointer"
        }}
      >
        Close
      </button>
    </div>
  </div>
)}
      
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#050505"
      }}
    >
      <Canvas
  camera={{ position: [0, 1.75, 8.8], fov: 58 }}
  shadows={false}
  gl={{
    antialias: false,
    powerPreference: "high-performance"
  }}
  dpr={[1, 1.5]}
>
  <fog attach="fog" args={["#050505", 10, 30]} />

  <color attach="background" args={["#1a1714"]} />      

  {/* <AtmosphereParticles /> */}

  <ambientLight intensity={0.55} color={theme.ambient} />

<ambientLight intensity={0.45} color="#ffffff" />

<directionalLight
    position={[4, 8, 4]}
  intensity={2.4}
  color={theme.directional}
  shadow-mapSize-width={2048}
  shadow-mapSize-height={2048}
  shadow-camera-near={0.5}
  shadow-camera-far={40}
  shadow-bias={-0.00008}
/>

<pointLight
  position={[0, 5.2, -1]}
  intensity={1.6}
  distance={22}
  color="#fff8ef"
/>

<pointLight
  position={[-7, 4.2, -2]}
  intensity={0.85}
  distance={18}
  color="#ffffff"
/>

<pointLight
  position={[7, 4.2, -2]}
  intensity={0.85}
  distance={18}
  color="#ffffff"
/>

  <spotLight
    position={[-6, 7, -3]}
  angle={0.42}
  penumbra={1}
  intensity={2.8}
  distance={28}
  color="#fff6e8"
  target-position={[-7, 3, -9]}
/>

<spotLight
    position={[0, 7, -3]}
  angle={0.42}
  penumbra={1}
  intensity={2.8}
  distance={28}
  color="#fff6e8"
  target-position={[0, 3, -9]}
/>

<spotLight
    position={[6, 7, -3]}
  angle={0.42}
  penumbra={1}
  intensity={2.8}
  distance={28}
  color="#fff6e8"
  target-position={[7, 3, -9]}
/>      

  {isLobby ? (
  <>
    <Lobby />

    <StreetViewControls
  currentPointId="center"
  targetPointId={lobbyTargetPointId}
  points={LOBBY_VIEWPOINTS}
/>

<StreetViewLookControls />

    {LOBBY_VIEWPOINTS.map((point) => (
  <FloorArrow
    key={point.id}
    point={point}
    onMove={(id) => {
      setLobbyTargetPointId(id);
    }}
  />
))}

  </>
) : (
  <Room room={currentRoom} theme={theme} onPhotoSelect={setSelectedPhoto} />
)}
</Canvas>
         </div>
      </>
  );
}
