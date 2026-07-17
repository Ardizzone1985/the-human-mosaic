export default function StepSecurePayment({
  room,
  wall,
  section,
  spot,
  reservedSlotCode,
  accentColor,
  isStartingPayment,
  paymentError,
  onStartPayment,
}) {
  return (
    <section style={sectionStyle}>
      <div style={sectionEyebrow}>
        POSITION SECURELY RESERVED
      </div>

      <h2 style={sectionTitle}>
        Secure Your Position
      </h2>

      <p style={sectionDescription}>
        Complete the one-time participation payment before
        uploading your memory. The final fee is calculated
        securely by The Human Mosaic server.
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
            Your Reserved Place
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

      <div style={paymentCard}>
        <div style={paymentIcon}>🔒</div>

        <div style={paymentContent}>
          <div style={paymentEyebrow}>
            SECURE CHECKOUT
          </div>

          <h3 style={paymentTitle}>
            Complete Your Participation
          </h3>

          <p style={paymentText}>
            Early Access pricing is applied automatically
            while the first 1,000 paid positions remain
            available.
          </p>

          <div style={priceGrid}>
            <PriceLine
              label="Identity"
              earlyPrice="€5"
              standardPrice="€15"
              active={room === "Identity"}
              accentColor={accentColor}
            />

            <PriceLine
              label="Love"
              earlyPrice="€5"
              standardPrice="€15"
              active={room === "Love"}
              accentColor={accentColor}
            />

            <PriceLine
              label="Creativity"
              earlyPrice="€10"
              standardPrice="€20"
              active={room === "Creativity"}
              accentColor={accentColor}
            />
          </div>

          <div style={paymentSecurityNote}>
            The exact current fee is verified by the server.
            Payment is processed securely through Stripe.
          </div>
        </div>
      </div>

      {paymentError && (
        <div style={paymentErrorBox}>
          <strong>Payment could not be started</strong>
          <span>{paymentError}</span>
        </div>
      )}

      <button
        type="button"
        onClick={onStartPayment}
        disabled={isStartingPayment}
        style={{
          ...paymentButton,
          background: accentColor,
          opacity: isStartingPayment ? 0.58 : 1,
          cursor: isStartingPayment
            ? "wait"
            : "pointer",
        }}
      >
        {isStartingPayment
          ? "Preparing Secure Checkout..."
          : "Proceed to Secure Payment"}
      </button>

      <p style={paymentFooter}>
        After a successful payment, you will return to The
        Human Mosaic and continue directly with the image
        upload.
      </p>
    </section>
  );
}

function PriceLine({
  label,
  earlyPrice,
  standardPrice,
  active,
  accentColor,
}) {
  return (
    <div
      style={{
        ...priceLine,
        borderColor: active
          ? accentColor
          : "rgba(255,255,255,0.08)",
        background: active
          ? "rgba(255,255,255,0.065)"
          : "rgba(255,255,255,0.025)",
      }}
    >
      <div>
        <div style={priceRoom}>{label}</div>

        {active && (
          <div
            style={{
              ...selectedRoomBadge,
              color: accentColor,
            }}
          >
            YOUR ROOM
          </div>
        )}
      </div>

      <div style={priceValues}>
        <span style={earlyPriceStyle}>
          {earlyPrice}
        </span>

        <span style={standardPriceStyle}>
          then {standardPrice}
        </span>
      </div>
    </div>
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

const paymentCard = {
  display: "flex",
  alignItems: "flex-start",
  gap: "20px",
  marginTop: "22px",
  padding: "24px",
  borderRadius: "22px",
  border: "1px solid rgba(215,181,109,0.24)",
  background:
    "linear-gradient(150deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
};

const paymentIcon = {
  width: "52px",
  height: "52px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.06)",
  fontSize: "25px",
};

const paymentContent = {
  minWidth: 0,
  flex: 1,
};

const paymentEyebrow = {
  color: "#d7b56d",
  fontSize: "10px",
  fontWeight: 900,
  letterSpacing: "0.15em",
};

const paymentTitle = {
  margin: "7px 0 8px",
  color: "#ffffff",
  fontSize: "21px",
};

const paymentText = {
  margin: 0,
  color: "#aaa092",
  fontSize: "13px",
  lineHeight: 1.6,
};

const priceGrid = {
  display: "grid",
  gap: "9px",
  marginTop: "18px",
};

const priceLine = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
  padding: "13px 14px",
  borderRadius: "15px",
  border: "1px solid",
};

const priceRoom = {
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: 900,
};

const selectedRoomBadge = {
  marginTop: "4px",
  fontSize: "8px",
  fontWeight: 900,
  letterSpacing: "0.12em",
};

const priceValues = {
  display: "flex",
  alignItems: "baseline",
  gap: "8px",
  textAlign: "right",
};

const earlyPriceStyle = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: 900,
};

const standardPriceStyle = {
  color: "#7f776d",
  fontSize: "10px",
};

const paymentSecurityNote = {
  marginTop: "16px",
  padding: "12px 14px",
  borderRadius: "14px",
  background: "rgba(0,0,0,0.3)",
  color: "#968c7f",
  fontSize: "11px",
  lineHeight: 1.55,
};

const paymentErrorBox = {
  display: "grid",
  gap: "6px",
  marginTop: "18px",
  padding: "14px 16px",
  borderRadius: "15px",
  border: "1px solid rgba(255,130,130,0.38)",
  background: "rgba(255,70,70,0.07)",
  color: "#ffb5b5",
  fontSize: "12px",
  lineHeight: 1.5,
};

const paymentButton = {
  width: "100%",
  marginTop: "20px",
  padding: "15px 20px",
  border: "none",
  borderRadius: "999px",
  color: "#111111",
  fontSize: "13px",
  fontWeight: 900,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const paymentFooter = {
  margin: "12px 0 0",
  color: "#8f8578",
  fontSize: "11px",
  lineHeight: 1.55,
  textAlign: "center",
};
