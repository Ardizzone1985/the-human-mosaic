export default function GallerySlot({
  slot,
  realSlot,
  imageUrl,
}) {
  return (
    <div
      style={{
        width: "48px",
        height: "48px",
        background: realSlot ? "#f7f5ef" : "#d9d9d9",
        border: imageUrl
  ? "2px solid #b89b5e"
  : realSlot
    ? "1px solid #b89b5e"
    : "1px dashed #888",
        color: "#222",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "10px",
        boxSizing: "border-box",
        overflow: "hidden",
        boxShadow: imageUrl
  ? "0 1px 4px rgba(0, 0, 0, 0.35)"
  : "none",
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={realSlot?.slot_code ?? slot.galleryKey}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        realSlot?.slot_code ?? slot.galleryKey
      )}
    </div>
  );
}
