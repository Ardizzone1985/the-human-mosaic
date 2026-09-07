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
    </div>
  );
}
