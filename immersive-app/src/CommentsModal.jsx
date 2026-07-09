export default function CommentsModal({ photoComments, onClose }) {
  return (
    <div style={overlay}>
      <div style={card}>
        <div style={title}>COMMENTS</div>

        {photoComments.length > 0 ? (
          photoComments.map((comment) => (
            <div key={comment.id} style={commentItem}>
              <div style={commentText}>{comment.comment}</div>
              <div style={commentDate}>
                {comment.created_at
                  ? new Date(comment.created_at).toLocaleString("en-GB")
                  : ""}
              </div>
            </div>
          ))
        ) : (
          <div style={emptyText}>No comments yet.</div>
        )}

        <button type="button" onClick={onClose} style={closeButton}>
          Close comments
        </button>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed",
  inset: 0,
  zIndex: 1000001,
  background: "rgba(0,0,0,0.78)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
};

const card = {
  width: "min(92vw, 440px)",
  maxHeight: "75vh",
  overflowY: "auto",
  padding: "22px",
  borderRadius: "24px",
  background: "rgba(12, 6, 3, 0.98)",
  border: "1px solid rgba(215,181,109,0.55)",
  color: "#fff",
  fontFamily: "Arial, sans-serif",
};

const title = {
  color: "#d7b56d",
  fontSize: "14px",
  letterSpacing: "0.16em",
  fontWeight: 800,
  marginBottom: "16px",
};

const commentItem = {
  padding: "12px",
  marginBottom: "10px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.10)",
};

const commentText = {
  color: "#e8ded0",
  fontSize: "14px",
  lineHeight: 1.45,
};

const commentDate = {
  marginTop: "8px",
  color: "#9f9180",
  fontSize: "12px",
};

const emptyText = {
  color: "#d8c7ad",
  fontSize: "14px",
  marginBottom: "16px",
};

const closeButton = {
  marginTop: "14px",
  width: "100%",
  padding: "13px",
  borderRadius: "999px",
  border: "none",
  background: "#d7b56d",
  color: "#1b0d05",
  fontWeight: 800,
  cursor: "pointer",
};
