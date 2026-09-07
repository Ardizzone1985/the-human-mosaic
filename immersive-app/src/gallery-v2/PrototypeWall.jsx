const ROWS = 60;
const COLUMNS = 10;

export default function PrototypeWall() {
  const slots = Array.from(
    { length: ROWS * COLUMNS },
    (_, index) => index + 1
  );

  return (
    <div>
      <h2>Prototype Wall</h2>

      <p>
        {ROWS} rows × {COLUMNS} columns = {slots.length} slots
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${COLUMNS}, 40px)`,
          gap: "4px",
          marginTop: "20px",
        }}
      >
        {slots.map((slot) => (
          <div
            key={slot}
            style={{
              width: "40px",
              height: "40px",
              border: "1px solid #999",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              boxSizing: "border-box",
            }}
          >
            {slot}
          </div>
        ))}
      </div>
    </div>
  );
}
