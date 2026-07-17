import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";
import StepChooseRoom from "./upload/StepChooseRoom.jsx";
import StepChooseWall from "./upload/StepChooseWall.jsx";
import StepChooseSpot from "./upload/StepChooseSpot.jsx";
import StepSecurePayment from "./upload/StepSecurePayment.jsx";
import StepUpload from "./upload/StepUpload.jsx";

const STEPS = [
  "Choose Room",
  "Choose Wall",
  "Choose Spot",
  "Secure Payment",
  "Upload",
];

const ROOMS = [
  {
    name: "Identity",
    icon: "🪞",
    color: "#d7b56d",
    description:
      "Share a memory connected to your identity, culture, roots or personal story.",
  },
  {
    name: "Love",
    icon: "❤️",
    color: "#ff9fbd",
    description:
      "Share a memory about family, friendship, affection, passions or meaningful bonds.",
  },
  {
    name: "Creativity",
    icon: "🎨",
    color: "#9fc3ff",
    description:
      "Share photography, art, drawings, concepts or other forms of human creativity.",
  },
];

const WALLS = [
  {
    name: "Front Wall",
    icon: "▤",
    description:
      "The main wall facing the entrance and the most immediate view inside the Room.",
  },
  {
    name: "Left Wall",
    icon: "◧",
    description:
      "A side perspective that becomes visible while exploring the Room.",
  },
  {
    name: "Right Wall",
    icon: "◨",
    description:
      "A complementary exhibition wall along the visitor's museum journey.",
  },
];

const WALL_SECTIONS = {
  "Front Wall": [
    "F1",
    "F2",
    "F3",
    "F4",
    "F5",
    "F6",
    "F7",
    "F8",
    "F9",
    "F10",
  ],
  "Left Wall": ["L1", "L2", "L3", "L4", "L5", "L6"],
  "Right Wall": ["R1", "R2", "R3", "R4", "R5", "R6"],
};

const HOLD_MINUTES = 15;

export default function UploadMemoryModal({ open, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedWall, setSelectedWall] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSlotCode, setSelectedSlotCode] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [reservedSlotCode, setReservedSlotCode] = useState(null);
const [isReservingSlot, setIsReservingSlot] = useState(false);
const [reservationError, setReservationError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
const [previewUrl, setPreviewUrl] = useState("");
const [memoryNote, setMemoryNote] = useState("");
const [uploadFormError, setUploadFormError] = useState("");
const [rightsConfirmed, setRightsConfirmed] = useState(false);
const [guidelinesConfirmed, setGuidelinesConfirmed] = useState(false);

  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
      setSelectedRoom(null);
      setSelectedWall(null);
      setSelectedSection(null);
      setSelectedSlotCode(null);
      setSelectedSpot(null);
      setSlots([]);
      setSlotsError("");
      setReservedSlotCode(null);
setIsReservingSlot(false);
setReservationError("");
      setSelectedFile(null);
setPreviewUrl("");
setMemoryNote("");
setUploadFormError("");
setRightsConfirmed(false);
setGuidelinesConfirmed(false);
    }
  }, [open]);

  useEffect(() => {
  return () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };
}, [previewUrl]);

  useEffect(() => {
    if (!open) return;

    function handleEscape(event) {
  if (event.key === "Escape") {
    handleRequestClose();
  }
}

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose, reservedSlotCode, isReservingSlot]);

  useEffect(() => {
    async function loadSlots() {
      if (
        !open ||
        currentStep !== 3 ||
        !selectedRoom ||
        !selectedWall ||
        !selectedSection
      ) {
        return;
      }

      setLoadingSlots(true);
      setSlotsError("");
      setSlots([]);
      setSelectedSlotCode(null);
      setSelectedSpot(null);

      const { data, error } = await supabase
        .from("slots")
        .select(
          `
          id,
          room,
          wall,
          section,
          row_number,
          col_number,
          slot_code,
          status,
          reserved_at,
          payment_confirmed
          `
        )
        .eq("room", selectedRoom)
        .eq("wall", selectedWall)
        .eq("section", selectedSection)
        .order("row_number", { ascending: true })
        .order("col_number", { ascending: true })
        .limit(1000);

      setLoadingSlots(false);

      if (error) {
        console.error("Load upload slots error:", error);
        setSlotsError(
          "The available positions could not be loaded. Please try again."
        );
        return;
      }

      setSlots(Array.isArray(data) ? data : []);
    }

    loadSlots();
  }, [
    open,
    currentStep,
    selectedRoom,
    selectedWall,
    selectedSection,
  ]);

  if (!open) return null;

  const activeRoom = ROOMS.find(
    (room) => room.name === selectedRoom
  );

  const accentColor = activeRoom?.color || "#d7b56d";

  const availableSections =
    WALL_SECTIONS[selectedWall] || [];

  const availableSlotsCount = slots.filter((slot) =>
  isSlotAvailable(slot)
).length;

  const unavailableSlotsCount =
    slots.length - availableSlotsCount;

  const canContinue =
    currentStep === 1
      ? Boolean(selectedRoom)
      : currentStep === 2
      ? Boolean(selectedWall)
      : currentStep === 3
      ? Boolean(
          selectedSection &&
            selectedSlotCode &&
            selectedSpot
        )
      : false;

  function handleImageSelection(event) {
  const file = event.target.files?.[0];

  setUploadFormError("");

  if (!file) {
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  const maxSizeBytes = 8 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    event.target.value = "";

    setSelectedFile(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }

    setUploadFormError(
      "Invalid file format. Please choose a JPG, PNG or WEBP image."
    );

    return;
  }

  if (file.size > maxSizeBytes) {
    event.target.value = "";

    setSelectedFile(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }

    setUploadFormError(
      "The selected image is too large. The maximum size is 8 MB."
    );

    return;
  }

  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }

  const nextPreviewUrl = URL.createObjectURL(file);

  setSelectedFile(file);
  setPreviewUrl(nextPreviewUrl);
}

  function handleUploadInterfaceTest() {
  setUploadFormError("");

  if (!selectedFile) {
    setUploadFormError(
      "Please choose an image before submitting your memory."
    );
    return;
  }

  if (!rightsConfirmed || !guidelinesConfirmed) {
    setUploadFormError(
      "Please confirm the required rights and project guidelines."
    );
    return;
  }

  console.log("Upload interface ready:", {
    room: selectedRoom,
    wall: selectedWall,
    section: selectedSection,
    spot: selectedSpot,
    slotCode: reservedSlotCode,
    fileName: selectedFile.name,
    fileType: selectedFile.type,
    fileSize: selectedFile.size,
    note: memoryNote.trim(),
  });
}

  async function releaseReservedSlot(slotCode = reservedSlotCode) {
  if (!slotCode) return true;

  const { data, error } = await supabase.rpc(
    "release_my_app_slot",
    {
      p_slot_code: slotCode,
    }
  );

  if (error) {
    console.error("Release reserved slot error:", error);
    return false;
  }

  setReservedSlotCode(null);
  return data === true;
}

  async function handleRequestClose() {
  if (isReservingSlot) return;

  setReservationError("");

  if (reservedSlotCode) {
    const released = await releaseReservedSlot(
      reservedSlotCode
    );

    if (!released) {
      setReservationError(
        "The reserved position could not be released. Please try again before closing."
      );
      return;
    }
  }

  onClose?.();
}
async function handleContinue() {
  if (!canContinue || isReservingSlot) return;

  setReservationError("");

  if (currentStep === 1) {
    setCurrentStep(2);
    return;
  }

  if (currentStep === 2) {
    const firstSection =
      WALL_SECTIONS[selectedWall]?.[0] || null;

    setSelectedSection(firstSection);
    setSelectedSlotCode(null);
    setSelectedSpot(null);
    setCurrentStep(3);
    return;
  }

  if (currentStep === 3) {
    setIsReservingSlot(true);

    const { data, error } = await supabase.rpc(
      "reserve_app_slot",
      {
        p_slot_code: selectedSlotCode,
      }
    );

    setIsReservingSlot(false);

    if (error) {
      console.error("Reserve app slot error:", error);

      setReservationError(
        error.message?.includes("Authentication required")
          ? "Please sign in again before reserving your position."
          : "Your position could not be reserved. Please try again."
      );

      return;
    }

    const reservedSlot = Array.isArray(data)
      ? data[0]
      : null;

    if (!reservedSlot) {
      setReservationError(
        "This position has just been reserved by another participant. Please choose another available spot."
      );

      setSelectedSlotCode(null);
      setSelectedSpot(null);

      return;
    }

    setReservedSlotCode(reservedSlot.slot_code);
    setReservationError("");
    setCurrentStep(4);
  }
}

async function handleBack() {
  if (isReservingSlot) return;

  setReservationError("");

  if (currentStep === 2) {
    setCurrentStep(1);
    return;
  }

  if (currentStep === 3) {
    setSelectedSlotCode(null);
    setSelectedSpot(null);
    setCurrentStep(2);
    return;
  }

  if (currentStep === 4) {
    const released = await releaseReservedSlot(
      reservedSlotCode
    );

    if (!released) {
      setReservationError(
        "The reserved position could not be released. Please try again."
      );
      return;
    }

    if (previewUrl) {
  URL.revokeObjectURL(previewUrl);
}

setSelectedFile(null);
setPreviewUrl("");
setMemoryNote("");
setUploadFormError("");
setRightsConfirmed(false);
setGuidelinesConfirmed(false);

    setCurrentStep(3);
  }
}

  function selectRoom(roomName) {
    setSelectedRoom(roomName);
    setSelectedWall(null);
    setSelectedSection(null);
    setSelectedSlotCode(null);
    setSelectedSpot(null);
  }

  function selectWall(wallName) {
    setSelectedWall(wallName);
    setSelectedSection(null);
    setSelectedSlotCode(null);
    setSelectedSpot(null);
  }

  function selectSection(sectionName) {
    setSelectedSection(sectionName);
    setSelectedSlotCode(null);
    setSelectedSpot(null);
  }

  return (
    <div
      style={overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-memory-title"
      onMouseDown={(event) => {
  if (event.target === event.currentTarget) {
    handleRequestClose();
  }
}}
    >
      <div style={panel}>
        <button
          type="button"
          onClick={handleRequestClose}
          disabled={isReservingSlot}
          style={closeButton}
          aria-label="Close Upload Memory"
        >
          ×
        </button>

        <header style={header}>
          <div style={eyebrow}>THE HUMAN MOSAIC</div>

          <h1 id="upload-memory-title" style={title}>
            Create Your Legacy
          </h1>

          <p style={subtitle}>
            Choose where your memory will become part of the
            permanent global artwork.
          </p>
        </header>

        <ProgressWizard
          currentStep={currentStep}
          accentColor={accentColor}
        />

        {currentStep === 1 && (
  <StepChooseRoom
    rooms={ROOMS}
    selectedRoom={selectedRoom}
    onSelectRoom={selectRoom}
  />
)}

        {currentStep === 2 && (
  <StepChooseWall
    room={selectedRoom}
    walls={WALLS}
    selectedWall={selectedWall}
    onSelectWall={selectWall}
  />
)}

        {currentStep === 3 && (
  <StepChooseSpot
    room={selectedRoom}
    wall={selectedWall}
    sections={availableSections}
    selectedSection={selectedSection}
    onSelectSection={selectSection}
    slots={slots}
    loadingSlots={loadingSlots}
    slotsError={slotsError}
    availableSlotsCount={availableSlotsCount}
    unavailableSlotsCount={unavailableSlotsCount}
    selectedSlotCode={selectedSlotCode}
    accentColor={accentColor}
    isSlotAvailable={isSlotAvailable}
    onSelectSlot={({ slotCode, visibleSpot }) => {
      setSelectedSlotCode(slotCode);
      setSelectedSpot(visibleSpot);
    }}
  />
)}

        {currentStep === 4 && (
  <StepUpload
    room={selectedRoom}
    wall={selectedWall}
    section={selectedSection}
    spot={selectedSpot}
    reservedSlotCode={reservedSlotCode}
    accentColor={accentColor}
    selectedFile={selectedFile}
    previewUrl={previewUrl}
    memoryNote={memoryNote}
    uploadFormError={uploadFormError}
    rightsConfirmed={rightsConfirmed}
    guidelinesConfirmed={guidelinesConfirmed}
    onImageSelection={handleImageSelection}
    onMemoryNoteChange={setMemoryNote}
    onRightsConfirmedChange={setRightsConfirmed}
    onGuidelinesConfirmedChange={
      setGuidelinesConfirmed
    }
    onSubmit={handleUploadInterfaceTest}
  />
)}

        {reservationError && (
  <div style={reservationErrorBox}>
    <strong>Reservation not completed</strong>

    <span>{reservationError}</span>
  </div>
)}

        <section style={summaryCard}>
          <div style={selectionSummary}>
            <SummaryItem
              label="ROOM"
              value={selectedRoom}
            />

            <SummaryItem
              label="WALL"
              value={selectedWall}
            />

            {currentStep >= 3 && (
              <>
                <SummaryItem
                  label="SECTION"
                  value={selectedSection}
                />

                <SummaryItem
                  label="SPOT"
                  value={selectedSpot}
                />
              </>
            )}
          </div>

          <div style={navigationActions}>
            {currentStep > 1 && (
              <button
                type="button"
                style={backButton}
                onClick={handleBack}
              >
                ← Back
              </button>
            )}

            {currentStep < 4 && (
  <button
    type="button"
    disabled={!canContinue || isReservingSlot}
    style={{
      ...continueButton,
      opacity:
        canContinue && !isReservingSlot ? 1 : 0.42,
      cursor:
        canContinue && !isReservingSlot
          ? "pointer"
          : "not-allowed",
      background: accentColor,
    }}
    onClick={handleContinue}
  >
    {isReservingSlot
      ? "Reserving..."
      : "Continue →"}
  </button>
)}
          </div>
        </section>

        <p style={testNote}>
          Your selected position remains reserved for 15 minutes while you complete the upload.
        </p>
      </div>
    </div>
  );
}

function ProgressWizard({
  currentStep,
  accentColor,
}) {
  return (
    <div style={progressArea}>
      <div style={progressTrack}>
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const completed =
            stepNumber < currentStep;
          const active =
            stepNumber === currentStep;
          const reached =
            stepNumber <= currentStep;

          return (
            <div key={step} style={progressItem}>
              <div style={progressTopRow}>
                <div
                  style={{
                    ...progressDot,
                    borderColor: reached
                      ? accentColor
                      : "rgba(255,255,255,0.16)",
                    background:
                      completed || active
                        ? accentColor
                        : "#0b0b0b",
                    color:
                      completed || active
                        ? "#111"
                        : "#746b60",
                  }}
                >
                  {completed ? "✓" : stepNumber}
                </div>

                {index < STEPS.length - 1 && (
                  <div
                    style={{
                      ...progressLine,
                      background:
                        stepNumber <
                        currentStep
                          ? accentColor
                          : "rgba(255,255,255,0.12)",
                    }}
                  />
                )}
              </div>

              <div
                style={{
                  ...progressLabel,
                  color: active
                    ? accentColor
                    : reached
                    ? "#d8cdbd"
                    : "#71695f",
                }}
              >
                {step}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div>
      <div style={summaryLabel}>{label}</div>

      <div style={summaryValue}>
        {value || "Not selected"}
      </div>
    </div>
  );
}

function isSlotAvailable(slot) {
  if (!slot) return false;

  if (slot.payment_confirmed === true) {
    return false;
  }

  if (slot.status === "available") {
    return true;
  }

  if (
    slot.status === "reserved" &&
    slot.reserved_at
  ) {
    const reservedTime = new Date(
      slot.reserved_at
    ).getTime();

    if (Number.isNaN(reservedTime)) {
      return false;
    }

    const elapsed =
      Date.now() - reservedTime;

    return (
      elapsed >
      HOLD_MINUTES * 60 * 1000
    );
  }

  return false;
}

const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 4700000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  boxSizing: "border-box",
  background: "rgba(0,0,0,0.8)",
  backdropFilter: "blur(14px)",
};

const panel = {
  position: "relative",
  width: "min(1040px, 96vw)",
  maxHeight: "92vh",
  overflowY: "auto",
  padding: "38px",
  boxSizing: "border-box",
  borderRadius: "30px",
  border: "1px solid rgba(215,181,109,0.5)",
  background:
    "linear-gradient(155deg, rgba(28,19,10,0.99), rgba(7,7,7,0.99) 50%)",
  boxShadow: "0 40px 130px rgba(0,0,0,0.85)",
  color: "#ffffff",
  fontFamily: "Arial, sans-serif",
};

const closeButton = {
  position: "absolute",
  top: "18px",
  right: "20px",
  width: "42px",
  height: "42px",
  borderRadius: "999px",
  border: "1px solid rgba(215,181,109,0.4)",
  background: "rgba(255,255,255,0.06)",
  color: "#f2c879",
  cursor: "pointer",
  fontSize: "28px",
  lineHeight: 1,
};

const header = {
  padding: "8px 42px 24px",
  textAlign: "center",
};

const eyebrow = {
  color: "#d7b56d",
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "0.24em",
};

const title = {
  margin: "12px 0 10px",
  color: "#ffffff",
  fontSize: "clamp(34px, 6vw, 54px)",
  lineHeight: 1.05,
};

const subtitle = {
  maxWidth: "620px",
  margin: "0 auto",
  color: "#cfc5b5",
  fontSize: "15px",
  lineHeight: 1.65,
};

const progressArea = {
  margin: "4px 0 30px",
  padding: "20px 18px 16px",
  borderRadius: "22px",
  border: "1px solid rgba(215,181,109,0.2)",
  background: "rgba(255,255,255,0.025)",
};

const progressTrack = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  alignItems: "start",
};

const progressItem = {
  minWidth: 0,
};

const progressTopRow = {
  display: "flex",
  alignItems: "center",
};

const progressDot = {
  width: "30px",
  height: "30px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  border: "1px solid",
  fontSize: "11px",
  fontWeight: 900,
  transition: "all 200ms ease",
};

const progressLine = {
  width: "100%",
  height: "2px",
  transition: "background 200ms ease",
};

const progressLabel = {
  marginTop: "9px",
  paddingRight: "8px",
  fontSize: "10px",
  fontWeight: 900,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const section = {
  marginTop: "6px",
};

const sectionEyebrow = {
  color: "#d7b56d",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.18em",
};

const sectionTitle = {
  margin: "6px 0 8px",
  color: "#ffffff",
  fontSize: "26px",
};

const sectionDescription = {
  margin: "0 0 18px",
  color: "#a99e8f",
  fontSize: "14px",
  lineHeight: 1.6,
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(210px, 1fr))",
  gap: "14px",
};

const selectionCard = {
  minHeight: "270px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "25px 20px",
  borderRadius: "22px",
  border: "1px solid",
  background:
    "linear-gradient(155deg, rgba(255,255,255,0.065), rgba(255,255,255,0.025))",
  color: "#ffffff",
  cursor: "pointer",
  font: "inherit",
  textAlign: "center",
  transition:
    "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
};

const cardIcon = {
  fontSize: "38px",
};

const wallIcon = {
  fontSize: "46px",
  fontWeight: 900,
  lineHeight: 1,
};

const cardName = {
  marginTop: "14px",
  fontSize: "23px",
  fontWeight: 900,
};

const cardDescription = {
  minHeight: "72px",
  marginTop: "12px",
  color: "#bdb2a2",
  fontSize: "13px",
  lineHeight: 1.55,
};

const selectionBadge = {
  marginTop: "18px",
  padding: "7px 11px",
  borderRadius: "999px",
  border: "1px solid",
  fontSize: "9px",
  fontWeight: 900,
  letterSpacing: "0.12em",
};

const sectionTabs = {
  display: "flex",
  flexWrap: "wrap",
  gap: "9px",
  marginBottom: "18px",
};

const sectionTab = {
  minWidth: "54px",
  padding: "10px 13px",
  borderRadius: "999px",
  border: "1px solid",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 900,
  transition:
    "background 160ms ease, color 160ms ease",
};

const slotPanel = {
  padding: "20px",
  borderRadius: "22px",
  border: "1px solid rgba(215,181,109,0.24)",
  background: "rgba(255,255,255,0.025)",
};

const slotPanelHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "14px",
  marginBottom: "18px",
};

const slotPanelEyebrow = {
  color: "#958a7b",
  fontSize: "10px",
  fontWeight: 900,
  letterSpacing: "0.14em",
};

const slotPanelTitle = {
  marginTop: "6px",
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: 900,
};

const slotCountBadge = {
  padding: "8px 12px",
  borderRadius: "999px",
  border: "1px solid rgba(215,181,109,0.24)",
  background: "rgba(215,181,109,0.07)",
  color: "#cfc3b2",
  fontSize: "11px",
  fontWeight: 800,
};

const slotGridScroller = {
  width: "100%",
  overflowX: "auto",
  padding: "8px 2px 14px",
};

const slotGrid = {
  minWidth: "620px",
  display: "grid",
  gridTemplateColumns:
    "repeat(10, minmax(48px, 1fr))",
  gap: "8px",
};

const slotButton = {
  aspectRatio: "1 / 1",
  minHeight: "48px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "4px",
  borderRadius: "10px",
  border: "1px solid",
  font: "inherit",
  transition:
    "transform 150ms ease, box-shadow 150ms ease, background 150ms ease",
};

const slotNumber = {
  fontSize: "9px",
  fontWeight: 900,
  lineHeight: 1.15,
  textAlign: "center",
};

const slotMessage = {
  padding: "30px 18px",
  borderRadius: "16px",
  border: "1px dashed rgba(215,181,109,0.25)",
  color: "#a99e8f",
  textAlign: "center",
  fontSize: "13px",
};

const slotErrorMessage = {
  ...slotMessage,
  border: "1px solid rgba(255,130,130,0.34)",
  color: "#ffb2b2",
  background: "rgba(255,90,90,0.055)",
};

const slotLegend = {
  display: "flex",
  flexWrap: "wrap",
  gap: "15px",
  marginTop: "12px",
  color: "#9c9284",
  fontSize: "11px",
};

const legendItem = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
};

const legendBox = {
  width: "13px",
  height: "13px",
  borderRadius: "4px",
  border: "1px solid rgba(215,181,109,0.24)",
};

const summaryCard = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "18px",
  marginTop: "24px",
  padding: "18px",
  borderRadius: "20px",
  border: "1px solid rgba(215,181,109,0.26)",
  background: "rgba(215,181,109,0.06)",
};

const selectionSummary = {
  display: "flex",
  flexWrap: "wrap",
  gap: "18px 30px",
};

const summaryLabel = {
  color: "#958a7b",
  fontSize: "10px",
  fontWeight: 900,
  letterSpacing: "0.14em",
};

const summaryValue = {
  marginTop: "6px",
  color: "#f2c879",
  fontSize: "17px",
  fontWeight: 900,
};

const navigationActions = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  gap: "10px",
};

const continueButton = {
  minWidth: "150px",
  padding: "13px 20px",
  border: "none",
  borderRadius: "999px",
  color: "#111111",
  fontSize: "13px",
  fontWeight: 900,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

const backButton = {
  minWidth: "120px",
  padding: "13px 20px",
  borderRadius: "999px",
  border: "1px solid rgba(215,181,109,0.35)",
  background: "rgba(255,255,255,0.04)",
  color: "#f2c879",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 900,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const testNote = {
  margin: "16px 0 0",
  color: "#847a6d",
  fontSize: "12px",
  textAlign: "center",
  lineHeight: 1.5,
};

const reservationErrorBox = {
  display: "grid",
  gap: "6px",
  marginTop: "20px",
  padding: "15px 18px",
  borderRadius: "17px",
  border: "1px solid rgba(255,130,130,0.4)",
  background: "rgba(255,70,70,0.07)",
  color: "#ffb5b5",
  fontSize: "13px",
  lineHeight: 1.5,
};

const reservedPositionCard = {
  display: "flex",
  alignItems: "center",
  gap: "18px",
  marginTop: "22px",
  padding: "22px",
  borderRadius: "22px",
  border: "1px solid rgba(215,181,109,0.32)",
  background:
    "linear-gradient(135deg, rgba(215,181,109,0.12), rgba(255,255,255,0.03))",
};

const reservedPositionIcon = {
  width: "54px",
  height: "54px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background: "#d7b56d",
  color: "#111",
  fontSize: "24px",
  fontWeight: 900,
};

const reservedPositionTitle = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: 900,
};

const reservedPositionDetails = {
  marginTop: "7px",
  color: "#d8cdbd",
  fontSize: "14px",
  lineHeight: 1.5,
};

const reservedPositionCode = {
  marginTop: "7px",
  color: "#f2c879",
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "0.05em",
  overflowWrap: "anywhere",
};

const uploadLayout = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px",
  marginTop: "24px",
};

const uploadColumn = {
  display: "grid",
  alignContent: "start",
  gap: "18px",
};

const previewColumn = {
  minWidth: 0,
};

const filePicker = {
  minHeight: "235px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  boxSizing: "border-box",
  borderRadius: "22px",
  border: "1px dashed rgba(215,181,109,0.45)",
  background: "rgba(255,255,255,0.025)",
  cursor: "pointer",
  textAlign: "center",
};

const hiddenFileInput = {
  position: "absolute",
  width: "1px",
  height: "1px",
  opacity: 0,
  pointerEvents: "none",
};

const filePickerIcon = {
  fontSize: "38px",
};

const filePickerTitle = {
  marginTop: "12px",
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: 900,
};

const filePickerText = {
  marginTop: "8px",
  color: "#9e9487",
  fontSize: "12px",
  lineHeight: 1.5,
};

const filePickerButton = {
  marginTop: "17px",
  padding: "10px 16px",
  borderRadius: "999px",
  color: "#111111",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.07em",
  textTransform: "uppercase",
};

const selectedFileInformation = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "8px",
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid rgba(215,181,109,0.22)",
  background: "rgba(215,181,109,0.055)",
  color: "#d9cebf",
  fontSize: "12px",
  overflowWrap: "anywhere",
};

const fieldGroup = {
  position: "relative",
  display: "grid",
  gap: "9px",
};

const fieldLabel = {
  color: "#d7b56d",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
};

const noteTextarea = {
  width: "100%",
  minHeight: "135px",
  padding: "15px",
  boxSizing: "border-box",
  resize: "vertical",
  borderRadius: "16px",
  border: "1px solid rgba(215,181,109,0.25)",
  outline: "none",
  background: "rgba(255,255,255,0.045)",
  color: "#ffffff",
  fontFamily: "Arial, sans-serif",
  fontSize: "14px",
  lineHeight: 1.55,
};

const characterCounter = {
  justifySelf: "end",
  color: "#847b70",
  fontSize: "10px",
};

const previewLabel = {
  marginBottom: "9px",
  color: "#d7b56d",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.12em",
};

const previewFrame = {
  width: "100%",
  aspectRatio: "1 / 1",
  overflow: "hidden",
  borderRadius: "22px",
  border: "1px solid rgba(215,181,109,0.25)",
  background: "#050505",
};

const previewImage = {
  width: "100%",
  height: "100%",
  display: "block",
  objectFit: "contain",
};

const emptyPreview = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  boxSizing: "border-box",
  color: "#847b70",
  textAlign: "center",
};

const emptyPreviewIcon = {
  fontSize: "40px",
  opacity: 0.55,
};

const emptyPreviewTitle = {
  marginTop: "12px",
  color: "#b8ad9e",
  fontSize: "16px",
  fontWeight: 800,
};

const emptyPreviewText = {
  marginTop: "7px",
  fontSize: "12px",
  lineHeight: 1.5,
};

const confirmationArea = {
  display: "grid",
  gap: "12px",
  marginTop: "22px",
  padding: "18px",
  borderRadius: "18px",
  border: "1px solid rgba(215,181,109,0.2)",
  background: "rgba(255,255,255,0.025)",
};

const confirmationLabel = {
  display: "flex",
  alignItems: "flex-start",
  gap: "11px",
  color: "#bdb2a3",
  fontSize: "12px",
  lineHeight: 1.55,
  cursor: "pointer",
};

const confirmationCheckbox = {
  marginTop: "3px",
  flexShrink: 0,
  accentColor: "#d7b56d",
};

const uploadErrorBox = {
  marginTop: "16px",
  padding: "14px 16px",
  borderRadius: "15px",
  border: "1px solid rgba(255,130,130,0.38)",
  background: "rgba(255,70,70,0.07)",
  color: "#ffb5b5",
  fontSize: "12px",
  lineHeight: 1.5,
};

const submitMemoryButton = {
  width: "100%",
  marginTop: "18px",
  padding: "15px 20px",
  border: "none",
  borderRadius: "999px",
  color: "#111111",
  fontSize: "13px",
  fontWeight: 900,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const reviewNotice = {
  marginTop: "12px",
  color: "#8f8578",
  fontSize: "11px",
  lineHeight: 1.55,
  textAlign: "center",
};
