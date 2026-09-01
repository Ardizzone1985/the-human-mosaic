import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useCallback,
  useEffect,
  useState,
  useRef,
} from "react";
import RoomShell from "./RoomShell.jsx";
import LivePhotoWall from "./LivePhotoWall.jsx";
import InfoWall from "./InfoWall.jsx";
import HumanityImpactRoom from "./HumanityImpactRoom.jsx";
import DynamicSectionManager from "./DynamicSectionManager.jsx";
import Lobby from "./Lobby.jsx";
import * as THREE from "three";
import { supabase } from "./supabaseClient.js";
import PhotoModal from "./PhotoModal.jsx";
import CommunityWallModal from "./CommunityWallModal.jsx";
import PrivateMemoryModal from "./PrivateMemoryModal.jsx";
import usePhotoSocial from "./usePhotoSocial.js";
import WelcomeGate from "./WelcomeGate.jsx";
import AuthModal from "./auth/AuthModal.jsx";
import ResetPasswordForm from "./auth/ResetPasswordForm.jsx";
import { useAuth } from "./auth/AuthProvider.jsx";
import AppDialog from "./components/AppDialog.jsx";
import AdvertisePage from "./components/sponsors/AdvertisePage.jsx";
import SponsorModal from "./components/sponsors/SponsorModal.jsx";
import MuseumIdentity from "./MuseumIdentity.jsx";
import AvatarModal from "./AvatarModal.jsx";
import UploadMemoryModal from "./UploadMemoryModal.jsx";
import museumLogoUrl from "./logo-cropped.png";

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

  { id: "newsPanel", position: [6.4, 2.05, 7.15] },

  { id: "livePanel", position: [-6.4, 2.05, 7.15] },

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
  <meshBasicMaterial
    color="#d7b56d"
    transparent
    opacity={0.40}
  />
</mesh>

<mesh position={[0, 0.18, 0.01]}>
  <coneGeometry args={[0.18, 0.38, 3]} />
  <meshBasicMaterial color="#fff6dc" />
</mesh>
    </group>
  );
}

function Room({
  room,
  theme,
  onPhotoSelect,
  onSponsorClick,
}) {
  const currentRoom = room;
  const [currentPointId, setCurrentPointId] = useState("center");
const [targetPointId, setTargetPointId] = useState("center");
  const isDesktop =
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: fine)").matches;
  
    return (
    <>
      <RoomShell theme={theme} />
      <InfoWall
  room={currentRoom}
  onSponsorClick={onSponsorClick}
/>
<LivePhotoWall
  key={`photo-wall-${currentRoom}`}
  room={currentRoom}
  onPhotoSelect={onPhotoSelect}
/>
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
  const {
  user,
  profile,
  logout,
  loadProfile,
  loadingAuth,
  passwordRecovery,
  setPasswordRecovery,
} = useAuth();
  const [fadeIn, setFadeIn] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [selectedPrivateMemory, setSelectedPrivateMemory] = useState(null);
  const [replacementMemory, setReplacementMemory] = useState(null);
  const [replacementSubmissionId, setReplacementSubmissionId] =
  useState(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    return String(
      params.get("replacementSubmissionId") || ""
    ).trim();
  });
  const [authMode, setAuthMode] = useState(null);
  const [showMuseumIdentity, setShowMuseumIdentity] = useState(false);
  const [showAdvertisePage, setShowAdvertisePage] = useState(false);
  const [sponsorDialog, setSponsorDialog] = useState(null);
  const [showUploadMemoryModal, setShowUploadMemoryModal] =
  useState(false);
  const [paymentReturn, setPaymentReturn] =
  useState(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const status = params.get("payment");

    if (
      status !== "success" &&
      status !== "cancelled"
    ) {
      return null;
    }

    return {
      status,
      sessionId:
        params.get("session_id") || "",
      slotCode:
        params.get("slotCode") || "",
    };
  });
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showCommunityWall, setShowCommunityWall] = useState(false);
const [savingAvatar, setSavingAvatar] = useState(false);
const [avatarError, setAvatarError] = useState("");
  const [showWelcomeGate, setShowWelcomeGate] = useState(() => {
  return localStorage.getItem("humanMosaicWelcomeSeen") !== "true";
});
  
  const {
  newComment,
  setNewComment,
  photoComments,
  setPhotoComments,
  currentUser,
  userLikedPhoto,
  setUserLikedPhoto,
    dialog,
closeDialog,
    handleLike,
    handleSendComment,
} = usePhotoSocial(selectedPhoto, setSelectedPhoto);
  
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
  if (user) {
    localStorage.setItem("humanMosaicWelcomeSeen", "true");
    setShowWelcomeGate(false);
  }
}, [user]);

  useEffect(() => {
  if (
    !replacementSubmissionId ||
    loadingAuth
  ) {
    return;
  }

  /*
   * Il link può essere aperto anche senza una sessione attiva.
   * In quel caso conserviamo il parametro nell'URL e mostriamo
   * il login. Dopo l'autenticazione questo stesso effect riparte.
   */
  if (!user) {
    setShowWelcomeGate(false);
    setAuthMode("login");
    return;
  }

  let cancelled = false;

  async function openReplacementFromEmail() {
    const { data, error } = await supabase.rpc(
      "get_my_memories"
    );

    if (cancelled) return;

    if (error) {
      console.error(
        "Load email replacement memory error:",
        error
      );
      return;
    }

    const memories = Array.isArray(data)
      ? data
      : [];

    const memory = memories.find(
  (item) =>
    String(
      item?.submission_id ||
      item?.id ||
      ""
    ) === replacementSubmissionId
);

    if (!memory) {      
      return;
    }

    const status = String(
      memory.approval_status ||
        memory.status ||
        memory.submission_status ||
        ""
    ).toLowerCase();

    if (status !== "rejected") {
      return;
    }

    setAuthMode(null);
    setShowWelcomeGate(false);
    setShowMuseumIdentity(false);
    setSelectedPrivateMemory(memory);
  }

  openReplacementFromEmail();

  return () => {
    cancelled = true;
  };
}, [
  replacementSubmissionId,
  loadingAuth,
  user?.id,
]);

  useEffect(() => {
  if (!paymentReturn || loadingAuth) {
    return;
  }

  /*
   * Il pagamento dell'app richiede un utente
   * autenticato. Normalmente la sessione Supabase
   * sopravvive al redirect Stripe.
   */
  if (!user) {
    setShowWelcomeGate(false);
    setAuthMode("login");
    return;
  }

  setShowWelcomeGate(false);
  setShowMuseumIdentity(false);
  setShowUploadMemoryModal(true);
}, [paymentReturn, loadingAuth, user]);
  
useEffect(() => {
  setTimeout(() => {
    setFadeIn(true);
  }, 120);

  window.addEventListener("startFadeOut", () => {
  setFadeIn(false);
});
}, []);
    const [roomParam, setRoomParam] = useState(() => {
  return new URLSearchParams(window.location.search).get("room");
});

useEffect(() => {
  function handleRouteChange() {
    setRoomParam(new URLSearchParams(window.location.search).get("room"));
  }

  window.addEventListener("popstate", handleRouteChange);
  return () => window.removeEventListener("popstate", handleRouteChange);
}, []);

  useEffect(() => {
  setFadeIn(false);

  const timer = setTimeout(() => {
    setFadeIn(true);
  }, 220);

  return () => clearTimeout(timer);
}, [roomParam]);

  async function handleSaveAvatar(file) {
  if (!user || !file || savingAvatar) return;

  setSavingAvatar(true);
  setAvatarError("");

  try {
    const avatarPath = `${user.id}/avatar`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(avatarPath, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: "3600",
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(avatarPath);

    const basePublicUrl = publicUrlData?.publicUrl;

    if (!basePublicUrl) {
      throw new Error("The avatar public URL could not be created.");
    }

    // Il parametro v forza il browser a mostrare subito la nuova immagine.
    const avatarUrl = `${basePublicUrl}?v=${Date.now()}`;

    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({
        avatar_url: avatarUrl,
      })
      .eq("id", user.id);

    if (profileError) {
      throw profileError;
    }

    await loadProfile(user.id);
    setShowAvatarModal(false);
  } catch (error) {
    console.error("Save avatar error:", error);

    setAvatarError(
      error?.message ||
        "The avatar could not be saved. Please try again."
    );
  } finally {
    setSavingAvatar(false);
  }
}

async function handleUseMuseumLogo() {
  if (!user || savingAvatar) return;

  setSavingAvatar(true);
  setAvatarError("");

  try {
    const avatarPath = `${user.id}/avatar`;

    const { error: removeError } = await supabase.storage
      .from("avatars")
      .remove([avatarPath]);

    // Un file inesistente non deve impedire il ripristino del logo.
    if (removeError) {
      console.warn("Avatar removal warning:", removeError);
    }

    const { error: profileError } = await supabase
      .from("user_profiles")
      .update({
        avatar_url: null,
      })
      .eq("id", user.id);

    if (profileError) {
      throw profileError;
    }

    await loadProfile(user.id);
    setShowAvatarModal(false);
  } catch (error) {
    console.error("Reset avatar error:", error);

    setAvatarError(
      error?.message ||
        "The Museum Logo could not be restored. Please try again."
    );
  } finally {
    setSavingAvatar(false);
  }
}

  const handlePaymentReturnHandled = useCallback(() => {
  setPaymentReturn(null);

  const cleanUrl = new URL(
    window.location.href
  );

  cleanUrl.searchParams.delete("payment");
  cleanUrl.searchParams.delete("session_id");
  cleanUrl.searchParams.delete("slotCode");

  window.history.replaceState(
    {},
    document.title,
    `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`
  );
}, []);
  
const currentRoom =
  roomParam?.toLowerCase() === "identity"
    ? "Identity"
    : roomParam?.toLowerCase() === "love"
    ? "Love"
    : roomParam?.toLowerCase() === "creativity"
    ? "Creativity"
    : roomParam?.toLowerCase() === "humanity-impact"
    ? "Humanity Impact"
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

      {!loadingAuth && user && (
  <div style={userBar}>
    <button
  type="button"
  style={profileButton}
  onClick={() => setShowMuseumIdentity(true)}
>
  Welcome, {profile?.nickname || profile?.first_name || "Visitor"}
</button>

    <button
       type="button"
      style={logoutButton}
      onClick={async (e) => {
  e.preventDefault();
  e.stopPropagation();

  await logout();

  localStorage.removeItem("humanMosaicWelcomeSeen");
  setAuthMode(null);
  setShowWelcomeGate(true);

  window.history.replaceState({}, "", "/");
}}
    >
      Log out
    </button>
  </div>
)}

      {!loadingAuth && !user && !showWelcomeGate && (
  <div style={guestBar}>
    <span>Guest Mode</span>

    <button style={guestActionButton} onClick={() => setAuthMode("login")}>
      Login
    </button>

    <button style={guestActionButton} onClick={() => setAuthMode("register")}>
      Register
    </button>
  </div>
)}

      {showWelcomeGate && (
  <WelcomeGate
    onEnterGuest={() => {
      localStorage.setItem("humanMosaicWelcomeSeen", "true");
      setShowWelcomeGate(false);
    }}
    onLogin={() => {
      setAuthMode("login");
    }}
    onRegister={() => {
      setAuthMode("register");
    }}
    onAdvertise={() => {
      setShowAdvertisePage(true);
    }}
  />
)}

      {showAdvertisePage && (
  <AdvertisePage
    onClose={() => {
      setShowAdvertisePage(false);
    }}
    onApply={() => {
      const opportunitiesSection = document.getElementById(
        "partnership-opportunities"
      );

      opportunitiesSection?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }}
    onApplicationSuccess={() => {
  setSponsorDialog({
    icon: "🤝",
    title: "Partnership Request Received",
    message:
      "Thank you for your interest in partnering with The Human Mosaic.\n\nYour partnership application has been successfully received and is now under review by our team.\n\nWe carefully evaluate every proposal to ensure it aligns with our mission and values.\n\nIf your application is approved, we will contact you by email with the next steps, including partnership confirmation and payment instructions.\n\nTogether, we can inspire millions of people around the world.",
    confirmText: "RETURN TO THE MUSEUM",
  });
}}
  />
)}

      <AuthModal
  mode={authMode}
  onClose={() => setAuthMode(null)}
/>

      
      <AppDialog
  open={!!dialog}
  icon={dialog?.icon}
  title={dialog?.title}
  message={dialog?.message}
  confirmText={dialog?.confirmText}
  cancelText={dialog?.cancelText}
  onCancel={closeDialog}
  onConfirm={() => {
    const action = dialog?.action;

    closeDialog();

    if (action === "login") {
      setSelectedPhoto(null);
      setAuthMode("login");
    }
  }}
/>

      <AppDialog
  open={!!sponsorDialog}
  icon={sponsorDialog?.icon}
  title={sponsorDialog?.title}
  message={sponsorDialog?.message}
  confirmText={sponsorDialog?.confirmText}
  onCancel={() => {}}
  onConfirm={() => {
    setSponsorDialog(null);
    setShowAdvertisePage(false);
  }}
/>

      <MuseumIdentity
  open={showMuseumIdentity}
  user={user}
  profile={profile}
        museumLogoUrl={museumLogoUrl}
  onClose={() => setShowMuseumIdentity(false)}
  onUpload={() => {
  setShowMuseumIdentity(false);
  setShowUploadMemoryModal(true);
}}
  onChangeAvatar={() => {
  setAvatarError("");
  setShowAvatarModal(true);
}}
  onChangePassword={() => {}}
        onMemorySelect={(memory) => {
  
  setShowMuseumIdentity(false);

  const status = String(
  memory.approval_status ||
  memory.status ||
  memory.submission_status ||
  ""
).toLowerCase();
  
  if (status === "approved") {
    setSelectedPhoto(memory);
    return;
  }

  setSelectedPrivateMemory(memory);
}}
  onLogout={async () => {
    setShowMuseumIdentity(false);
    await logout();
  }}
/>

      <UploadMemoryModal
  open={showUploadMemoryModal}
  paymentReturn={paymentReturn}
  onPaymentReturnHandled={
    handlePaymentReturnHandled
  }
  replacementMemory={replacementMemory}
  onClose={() => {
    setShowUploadMemoryModal(false);
    setReplacementMemory(null);
  }}
/>

      <AvatarModal
  open={showAvatarModal}
  currentAvatarUrl={profile?.avatar_url}
  museumLogoUrl={museumLogoUrl}
  saving={savingAvatar}
  errorMessage={avatarError}
  onClose={() => {
    if (savingAvatar) return;

    setAvatarError("");
    setShowAvatarModal(false);
  }}
  onSave={handleSaveAvatar}
  onUseMuseumLogo={handleUseMuseumLogo}
/>

      {passwordRecovery && (
  <ResetPasswordForm
    onSuccess={() => {
      setPasswordRecovery(false);

      window.history.replaceState(
        {},
        document.title,
        window.location.pathname
      );
    }}
  />
)}      
      
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
           
      <PhotoModal
  selectedPhoto={selectedPhoto}
  photoComments={photoComments}
  newComment={newComment}
  setNewComment={setNewComment}
  userLikedPhoto={userLikedPhoto}
  handleLike={handleLike}
  handleSendComment={handleSendComment}
  onClose={() => setSelectedPhoto(null)}
/>

      <SponsorModal
  sponsor={selectedSponsor}
  onClose={() => {
    setSelectedSponsor(null);
    document.body.style.cursor = "default";
  }}
/>

      <CommunityWallModal
  open={showCommunityWall}
  user={user}
  profile={profile}
  onClose={() => setShowCommunityWall(false)}
/>

      <PrivateMemoryModal
  memory={selectedPrivateMemory}
  onClose={() => {
  setSelectedPrivateMemory(null);

  if (replacementSubmissionId) {
    setReplacementSubmissionId("");

    const cleanUrl = new URL(
      window.location.href
    );

    cleanUrl.searchParams.delete(
      "replacementSubmissionId"
    );

    window.history.replaceState(
      {},
      document.title,
      `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`
    );
  }
}}
  onReplaceImage={(memory) => {
  setSelectedPrivateMemory(null);
  setReplacementMemory(memory);
  setReplacementSubmissionId("");

  const cleanUrl = new URL(
    window.location.href
  );

  cleanUrl.searchParams.delete(
    "replacementSubmissionId"
  );

  window.history.replaceState(
    {},
    document.title,
    `${cleanUrl.pathname}${cleanUrl.search}${cleanUrl.hash}`
  );

  setShowUploadMemoryModal(true);
}}
/>
      
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
    <Lobby
  onOpenCommunityWall={() =>
    setShowCommunityWall(true)
  }
  onSponsorClick={(sponsor) => {
    setSelectedSponsor({
      ...sponsor,
      room: "Lobby",
    });
  }}
/>

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
) : currentRoom === "Humanity Impact" ? (
  <>
    <HumanityImpactRoom />
    <StreetViewLookControls />
  </>
) : (
  <Room
  key={currentRoom}
  room={currentRoom}
  theme={theme}
  onPhotoSelect={setSelectedPhoto}
  onSponsorClick={(sponsor) => {
    setSelectedSponsor({
      ...sponsor,
      room: currentRoom,
    });
  }}
/>
)}
</Canvas>
         </div>
      </>
  );
}

const userBar = {
  position: "fixed",
  top: 18,
  right: 18,
  zIndex: 2000000,
  pointerEvents: "auto",
  display: "flex",
  gap: "12px",
  alignItems: "center",
  padding: "10px 14px",
  borderRadius: "999px",
  background: "rgba(0,0,0,0.58)",
  border: "1px solid rgba(215,181,109,0.45)",
  color: "#f2c879",
  fontFamily: "Arial, sans-serif",
  fontSize: "13px",
  fontWeight: 700,
  backdropFilter: "blur(10px)",
};

const profileButton = {
  padding: 0,
  border: "none",
  background: "transparent",
  color: "#f2c879",
  fontFamily: "inherit",
  fontSize: "13px",
  fontWeight: 700,
  cursor: "pointer",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
};

const logoutButton = {
  border: "none",
  borderRadius: "999px",
  padding: "7px 12px",
  background: "#d7b56d",
  color: "#111",
  fontWeight: 800,
  cursor: "pointer",
};

const guestBar = {
  position: "fixed",
  top: 18,
  right: 18,
  zIndex: 2000000,
  pointerEvents: "auto",
  display: "flex",
  gap: "10px",
  alignItems: "center",
  padding: "10px 14px",
  borderRadius: "999px",
  background: "rgba(0,0,0,0.58)",
  border: "1px solid rgba(215,181,109,0.45)",
  color: "#f2c879",
  fontFamily: "Arial, sans-serif",
  fontSize: "13px",
  fontWeight: 700,
  backdropFilter: "blur(10px)",
};

const guestActionButton = {
  border: "none",
  borderRadius: "999px",
  padding: "7px 12px",
  background: "#d7b56d",
  color: "#111",
  fontWeight: 800,
  cursor: "pointer",
};
