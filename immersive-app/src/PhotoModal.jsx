export default function PhotoModal({
  selectedPhoto,
  photoComments,
  newComment,
  setNewComment,
  userLikedPhoto,
  handleLike,
  handleSendComment,
  onClose,
}) {
  if (!selectedPhoto) return null;

  return (
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
        boxSizing: "border-box",
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
          fontFamily: "Arial, sans-serif",
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
            border: "1px solid rgba(215,181,109,0.3)",
          }}
        />

        <div style={{ display: "flex", gap: "10px", marginBottom: "18px" }}>
          <div style={statBoxGold}>❤️ {selectedPhoto?.likes_count ?? 0}</div>
          <div style={statBox}>👁 {selectedPhoto?.views_count ?? 0}</div>
          <div style={statBox}>💬 {selectedPhoto?.comments_count ?? 0}</div>
        </div>

        <Label>COUNTRY</Label>
        <div style={{ fontSize: "20px", fontWeight: "700", margin: "6px 0 18px" }}>
          {selectedPhoto?.country || "Country not available."}
        </div>

        <Label>NOTE</Label>
        <div style={{ fontSize: "15px", lineHeight: "1.5", marginTop: "8px", color: "#e8ded0" }}>
          {selectedPhoto?.note || selectedPhoto?.notes || selectedPhoto?.optional_note || "No note added."}
        </div>

        <button onClick={handleLike} style={likeButton}>
          {userLikedPhoto ? "❤️ You liked this memory" : "❤️ Like this memory"}
        </button>

        <div style={commentsBox}>
          <Label>COMMENTS</Label>

          {photoComments.length > 0 && (
            <div style={{ marginBottom: "12px" }}>
              {photoComments.map((comment) => (
                <div key={comment.id} style={commentItem}>
                  {comment.comment}
                </div>
              ))}
            </div>
          )}

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            style={textareaStyle}
          />

          <button onClick={handleSendComment} style={sendButton}>
            Send comment
          </button>
        </div>

        <button onClick={onClose} style={closeButton}>
          Close
        </button>
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <div style={{ color: "#d7b56d", fontSize: "12px", letterSpacing: "0.12em", marginBottom: "10px" }}>
      {children}
    </div>
  );
}

const statBoxGold = {
  flex: 1,
  padding: "10px",
  borderRadius: "14px",
  background: "rgba(215,181,109,0.10)",
  border: "1px solid rgba(215,181,109,0.22)",
  textAlign: "center",
  fontSize: "13px",
  color: "#f6d98a",
  fontWeight: 700,
};

const statBox = {
  ...statBoxGold,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#e8ded0",
};

const likeButton = {
  width: "100%",
  padding: "14px",
  marginTop: "18px",
  marginBottom: "12px",
  borderRadius: "14px",
  border: "none",
  background: "#d7b56d",
  color: "#111",
  fontWeight: 700,
  fontSize: "16px",
  cursor: "pointer",
};

const commentsBox = {
  marginTop: "12px",
  padding: "14px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
};

const commentItem = {
  padding: "10px",
  marginBottom: "8px",
  borderRadius: "12px",
  background: "rgba(0,0,0,0.22)",
  color: "#e8ded0",
  fontSize: "13px",
  lineHeight: 1.4,
};

const textareaStyle = {
  width: "100%",
  minHeight: "72px",
  borderRadius: "12px",
  border: "1px solid rgba(215,181,109,0.28)",
  background: "rgba(0,0,0,0.28)",
  color: "#fff",
  padding: "12px",
  resize: "vertical",
  boxSizing: "border-box",
  fontFamily: "Arial, sans-serif",
};

const sendButton = {
  marginTop: "10px",
  width: "100%",
  padding: "12px",
  borderRadius: "999px",
  border: "none",
  background: "#f2c879",
  color: "#1b0d05",
  fontWeight: "700",
  cursor: "pointer",
};

const closeButton = {
  marginTop: "22px",
  width: "100%",
  padding: "15px",
  borderRadius: "999px",
  border: "none",
  background: "#d7b56d",
  color: "#1b0d05",
  fontWeight: "700",
  cursor: "pointer",
};
