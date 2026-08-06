function formatPrice(priceCents, currency = "EUR") {
  const amount = Number(priceCents || 0) / 100;

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatRoom(room) {
  if (!room) return "Museum";

  return room
    .split("-")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export default function SponsorPlanCard({
  plan,
  onApply,
}) {
  if (!plan) return null;

  const {
  id,
  name,
  room,
  duration_days: durationDays,
  price_cents: priceCents,
  currency,
  description,
  is_featured: isFeatured,
  max_slots: maxSlots = 0,
  available_slots: availableSlots = 0,
} = plan;

const numericMaxSlots = Number(maxSlots) || 0;
const numericAvailableSlots =
  Number(availableSlots) || 0;

const isFullyBooked =
  numericMaxSlots > 0 &&
  numericAvailableSlots <= 0;

  function handleApply() {
  if (isFullyBooked) {
    return;
  }

  if (typeof onApply === "function") {
    onApply(plan);
  }
}

  return (
    <article
      style={{
        ...card,
        ...(isFeatured ? featuredCard : {}),
      }}
    >
      {isFeatured && (
        <div style={featuredBadge}>
          FEATURED PARTNERSHIP
        </div>
      )}

      <div style={roomLabel}>
        {formatRoom(room)}
      </div>

      <h3 style={title}>
        {name}
      </h3>

      <div style={duration}>
        {durationDays} Days
      </div>

      <div
  style={{
    ...availabilityBadge,
    ...(isFullyBooked
      ? availabilityBadgeFull
      : {}),
  }}
>
  {isFullyBooked
    ? "FULLY BOOKED"
    : `${numericAvailableSlots} OF ${numericMaxSlots} SPACES AVAILABLE`}
</div>

      <p style={descriptionStyle}>
        {description}
      </p>

      <div style={divider} />

      <div style={benefits}>
        <Benefit text="Exclusive curated placement" />
        <Benefit text="Integrated museum visibility" />
        <Benefit text="Partnership subject to approval" />
      </div>

      <div style={priceArea}>
        <span style={priceLabel}>
          Partnership contribution
        </span>

        <strong style={price}>
          {formatPrice(priceCents, currency)}
        </strong>

        <span style={priceNote}>
          for {durationDays} days
        </span>
      </div>

      <button
  type="button"
  style={{
    ...applyButton,
    ...(isFeatured ? featuredButton : {}),
    ...(isFullyBooked
      ? disabledApplyButton
      : {}),
  }}
  onClick={handleApply}
  disabled={isFullyBooked}
  aria-disabled={isFullyBooked}
  aria-label={
    isFullyBooked
      ? `${name} is fully booked`
      : `Apply for ${name}`
  }
  data-plan-id={id}
>
  {isFullyBooked
    ? "CURRENTLY UNAVAILABLE"
    : "APPLY FOR THIS PLAN"}
</button>
    </article>
  );
}

function Benefit({ text }) {
  return (
    <div style={benefit}>
      <span style={check}>✓</span>
      <span>{text}</span>
    </div>
  );
}

const card = {
  position: "relative",
  minHeight: "560px",
  padding: "34px",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  borderRadius: "28px",
  border: "1px solid rgba(100, 72, 38, 0.18)",
  background:
    "linear-gradient(160deg, rgba(255,255,255,0.96), rgba(243,235,222,0.92))",
  boxShadow: "0 24px 70px rgba(67, 44, 20, 0.10)",
  color: "#2b1d10",
};

const featuredCard = {
  border: "1px solid rgba(166,124,49,0.72)",
  boxShadow:
    "0 28px 90px rgba(120, 82, 31, 0.20), inset 0 0 0 1px rgba(215,181,109,0.18)",
  transform: "translateY(-8px)",
};

const featuredBadge = {
  position: "absolute",
  top: "18px",
  right: "18px",
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#2b1d10",
  color: "#f1cf87",
  fontSize: "9px",
  fontWeight: 900,
  letterSpacing: "0.14em",
};

const roomLabel = {
  marginTop: "12px",
  marginBottom: "20px",
  color: "#a67c31",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
};

const title = {
  margin: 0,
  maxWidth: "90%",
  color: "#27190d",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "clamp(27px, 3vw, 36px)",
  lineHeight: 1.1,
  fontWeight: 500,
};

const duration = {
  marginTop: "18px",
  color: "#8b6832",
  fontSize: "13px",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const descriptionStyle = {
  minHeight: "100px",
  margin: "22px 0 0",
  color: "#675744",
  fontSize: "15px",
  lineHeight: 1.72,
};

const divider = {
  height: "1px",
  margin: "26px 0",
  background:
    "linear-gradient(90deg, rgba(166,124,49,0.5), rgba(166,124,49,0.06))",
};

const benefits = {
  display: "grid",
  gap: "13px",
};

const benefit = {
  display: "flex",
  alignItems: "center",
  gap: "11px",
  color: "#514333",
  fontSize: "14px",
  lineHeight: 1.45,
};

const check = {
  width: "23px",
  height: "23px",
  flexShrink: 0,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "999px",
  background: "rgba(166,124,49,0.14)",
  color: "#9a7028",
  fontSize: "13px",
  fontWeight: 900,
};

const availabilityBadge = {
  alignSelf: "flex-start",
  marginTop: "14px",
  padding: "8px 11px",
  borderRadius: "999px",
  border: "1px solid rgba(45, 125, 82, 0.25)",
  background: "rgba(45, 125, 82, 0.10)",
  color: "#276f4c",
  fontSize: "10px",
  fontWeight: 900,
  letterSpacing: "0.09em",
};

const availabilityBadgeFull = {
  border: "1px solid rgba(161, 47, 47, 0.24)",
  background: "rgba(161, 47, 47, 0.09)",
  color: "#a12f2f",
};

const priceArea = {
  marginTop: "auto",
  paddingTop: "30px",
  display: "flex",
  flexDirection: "column",
};

const priceLabel = {
  marginBottom: "7px",
  color: "#7b6a55",
  fontSize: "11px",
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const price = {
  color: "#291a0e",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "40px",
  lineHeight: 1,
  fontWeight: 500,
};

const priceNote = {
  marginTop: "7px",
  color: "#806f59",
  fontSize: "12px",
};

const applyButton = {
  width: "100%",
  minHeight: "52px",
  marginTop: "25px",
  padding: "14px 18px",
  borderRadius: "999px",
  border: "1px solid rgba(89, 60, 28, 0.34)",
  background: "#2b1d10",
  color: "#f2dfbd",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.1em",
  cursor: "pointer",
};

const featuredButton = {
  border: "none",
  background: "#d7b56d",
  color: "#1b1209",
};
