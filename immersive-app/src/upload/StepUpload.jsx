export default function StepUpload({
  room,
  wall,
  section,
  spot,
  reservedSlotCode,
  accentColor,
  selectedFile,
  previewUrl,
  memoryNote,
  uploadFormError,
  rightsConfirmed,
  guidelinesConfirmed,
  isSubmitting,
  onImageSelection,
  onMemoryNoteChange,
  onRightsConfirmedChange,
  onGuidelinesConfirmedChange,
  onSubmit,
}) {
  const formReady =
  Boolean(selectedFile) &&
  rightsConfirmed &&
  guidelinesConfirmed &&
  !isSubmitting;

  return (
    <section style={sectionStyle}>
      <div style={sectionEyebrow}>
        POSITION SECURELY RESERVED
      </div>

      <h2 style={sectionTitle}>
        Upload Your Memory
      </h2>

      <p style={sectionDescription}>
        Your selected position is reserved for 15 minutes.
        Choose the image that will represent your place inside
        The Human Mosaic.
      </p>

      <div style={reservedPositionCard}>
        <div
          style={{
            ...reservedPositionIcon,
            background: accentColor,
          }}
        >
          ✓
        </div>

        <div>
          <div style={reservedPositionTitle}>
            Your Place
          </div>

          <div style={reservedPositionDetails}>
            {room} · {wall} · {section} · {spot}
          </div>

          <div
            style={{
              ...reservedPositionCode,
              color: accentColor,
            }}
          >
            {reservedSlotCode}
          </div>
        </div>
      </div>

      <div style={uploadLayout}>
        <div style={uploadColumn}>
          <label style={filePicker}>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={isSubmitting}
              onChange={onImageSelection}
              style={hiddenFileInput}
            />

            <span style={filePickerIcon}>🖼</span>

            <span style={filePickerTitle}>
              Choose Your Image
            </span>

            <span style={filePickerText}>
              JPG, PNG or WEBP · Maximum 8 MB
            </span>

            <span
              style={{
                ...filePickerButton,
                background: accentColor,
              }}
            >
              Select Image
            </span>
          </label>

          {selectedFile && (
            <div style={selectedFileInformation}>
              <strong>{selectedFile.name}</strong>

              <span>
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </div>
          )}

          <label style={fieldGroup}>
            <span style={fieldLabel}>
              Memory Note
            </span>

            <textarea
              value={memoryNote}
              maxLength={500}
              onChange={(event) =>
                onMemoryNoteChange(event.target.value)
              }
              disabled={isSubmitting}
              placeholder="Write a short description of your memory..."
              style={noteTextarea}
            />

            <span style={characterCounter}>
              {memoryNote.length} / 500
            </span>
          </label>
        </div>

        <div style={previewColumn}>
          <div style={previewLabel}>
            IMAGE PREVIEW
          </div>

          <div style={previewFrame}>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Selected memory preview"
                style={previewImage}
              />
            ) : (
              <div style={emptyPreview}>
                <div style={emptyPreviewIcon}>🖼</div>

                <div style={emptyPreviewTitle}>
                  No image selected
                </div>

                <div style={emptyPreviewText}>
                  Your memory preview will appear here.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={confirmationArea}>
        <label style={confirmationLabel}>
          <input
            type="checkbox"
            checked={rightsConfirmed}
            disabled={isSubmitting}
            onChange={(event) =>
              onRightsConfirmedChange(
                event.target.checked
              )
            }
            style={confirmationCheckbox}
          />

          <span>
            I confirm that I own this image or have all
            necessary rights and consent to submit it,
            including consent for identifiable people and
            minors where applicable.
          </span>
        </label>

        <label style={confirmationLabel}>
          <input
            type="checkbox"
            checked={guidelinesConfirmed}
            disabled={isSubmitting}
            onChange={(event) =>
              onGuidelinesConfirmedChange(
                event.target.checked
              )
            }
            style={confirmationCheckbox}
          />

          <span>
            I confirm that this memory follows the{" "}
            <strong>{room} Room</strong> guideline,
            Community Guidelines, Terms, Privacy Policy and
            Content License.
          </span>
        </label>
      </div>

      {uploadFormError && (
        <div style={uploadErrorBox}>
          {uploadFormError}
        </div>
      )}

      <button
  type="button"
  onClick={onSubmit}
  disabled={!formReady}
  style={{
    ...submitMemoryButton,
    background: accentColor,
    opacity: formReady ? 1 : 0.48,
    cursor: formReady
      ? "pointer"
      : "not-allowed",
  }}
>
  {isSubmitting
    ? "Submitting Memory..."
    : "Submit Memory for Review"}
</button>

      <div style={reviewNotice}>
        Your memory will remain pending until it is reviewed.
        Approved memories become visible in the museum and
        receive the official certificate.
      </div>
    </section>
  );
}

const sectionStyle = {
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
  color: "#111111",
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
