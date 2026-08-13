import { useState } from "react";
import logoImage from "../../logo-cropped.png";
import useSponsorPlans from "../../hooks/useSponsorPlans";
import SponsorPlanCard from "./SponsorPlanCard";
import SponsorApplicationModal from "./SponsorApplicationModal";

const partnerTypes = [
  {
    icon: "🏛️",
    title: "Museums",
    text: "Cultural institutions committed to preserving and sharing human stories.",
  },
  {
    icon: "🎓",
    title: "Universities",
    text: "Academic communities supporting education, research and global dialogue.",
  },
  {
    icon: "🌍",
    title: "NGOs",
    text: "Organizations creating meaningful social and humanitarian impact.",
  },
  {
    icon: "🏢",
    title: "Companies",
    text: "Responsible brands that believe in culture, inclusion and human connection.",
  },
  {
    icon: "🎨",
    title: "Cultural Institutions",
    text: "Creative organizations helping art and collective memory reach new audiences.",
  },
  {
    icon: "❤️",
    title: "Foundations",
    text: "Foundations investing in communities, culture and positive change.",
  },
];

const benefits = [
  {
    number: "01",
    title: "A Meaningful Presence",
    text: "Your organization becomes part of a permanent global artwork built around real people, memories and stories.",
  },
  {
    number: "02",
    title: "Curated Visibility",
    text: "Partnership spaces are integrated carefully into the museum experience rather than displayed as conventional advertising.",
  },
  {
    number: "03",
    title: "Global Community",
    text: "Connect your name with an international community celebrating identity, love, creativity and shared humanity.",
  },
];

export default function AdvertisePage({
  onClose,
  onApply,
  onApplicationSuccess,
}) {
  const [selectedPlan, setSelectedPlan] = useState(null);
const [showApplicationModal, setShowApplicationModal] = useState(false);

  const {
  plans,
  loading,
  error,
} = useSponsorPlans();
  
  function scrollToOpportunities() {
    document
      .getElementById("partnership-opportunities")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div style={page}>
      <header style={header}>
        <button
          type="button"
          style={brandButton}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Return to the top"
        >
          <img
            src={logoImage}
            alt="The Human Mosaic"
            style={headerLogo}
          />

          <span style={brandText}>THE HUMAN MOSAIC</span>
        </button>

        <button
          type="button"
          style={closeButton}
          onClick={onClose}
          aria-label="Close partnership page"
        >
          ×
        </button>
      </header>

      <main>
        <section style={hero}>
          <div style={heroGlowOne} />
          <div style={heroGlowTwo} />

          <div style={heroContent}>
            <div style={eyebrow}>CURATED PARTNERSHIPS</div>

            <h1 style={heroTitle}>
              Become Part of a
              <br />
              <span style={goldText}>Global Human Story</span>
            </h1>

            <p style={heroText}>
              Support a permanent immersive artwork that brings together real
              people, real memories and real stories from around the world.
            </p>

            <div style={heroActions}>
              <button
                type="button"
                style={primaryButton}
                onClick={scrollToOpportunities}
              >
                EXPLORE OPPORTUNITIES
              </button>

              <button
                type="button"
                style={secondaryButton}
                onClick={onClose}
              >
                RETURN TO THE MUSEUM
              </button>
            </div>

            <div style={principle}>
              <span style={principleLine} />
              <span>
                Selected partners. Meaningful visibility. No intrusive advertising.
              </span>
              <span style={principleLine} />
            </div>
          </div>
        </section>

        <section style={lightSection}>
          <div style={sectionInner}>
            <div style={sectionEyebrow}>WHY PARTNER WITH US</div>

            <h2 style={darkTitle}>
              Visibility with cultural meaning
            </h2>

            <p style={darkIntro}>
              The Human Mosaic does not offer ordinary advertising space. We
              create carefully selected partnerships that become part of the
              museum’s visual and cultural identity.
            </p>

            <div style={benefitGrid}>
              {benefits.map((benefit) => (
                <article key={benefit.number} style={benefitCard}>
                  <div style={benefitNumber}>{benefit.number}</div>
                  <h3 style={benefitTitle}>{benefit.title}</h3>
                  <p style={benefitText}>{benefit.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section style={darkSection}>
          <div style={sectionInner}>
            <div style={sectionEyebrow}>WHO WE PARTNER WITH</div>

            <h2 style={lightTitle}>
              Organizations that share our values
            </h2>

            <p style={lightIntro}>
              We welcome institutions and responsible organizations that
              believe in culture, inclusion, creativity and human connection.
            </p>

            <div style={partnerGrid}>
              {partnerTypes.map((partner) => (
                <article key={partner.title} style={partnerCard}>
                  <div style={partnerIcon}>{partner.icon}</div>
                  <h3 style={partnerTitle}>{partner.title}</h3>
                  <p style={partnerText}>{partner.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section style={trustSection}>
  <div style={sectionInner}>
    <div style={sectionEyebrow}>
      WHY ORGANIZATIONS CHOOSE THE HUMAN MOSAIC
    </div>

    <h2 style={lightTitle}>
      More than visibility
    </h2>

    <p style={lightIntro}>
      Every partnership is designed to create cultural value, strengthen
      human connection and support a project built to last.
    </p>

    <div style={trustGrid}>
      <article style={trustCard}>
        <div style={trustIcon}>🌍</div>

        <h3 style={trustTitle}>
          International Vision
        </h3>

        <p style={trustText}>
          A permanent global artwork connecting cultures through real human
          stories and memories.
        </p>
      </article>

      <article style={trustCard}>
        <div style={trustIcon}>🎨</div>

        <h3 style={trustTitle}>
          Meaningful Visibility
        </h3>

        <p style={trustText}>
          Your organization becomes part of an authentic cultural experience,
          not a conventional advertising campaign.
        </p>
      </article>

      <article style={trustCard}>
        <div style={trustIcon}>❤️</div>

        <h3 style={trustTitle}>
          Positive Impact
        </h3>

        <p style={trustText}>
          Help preserve human memories while supporting the future social and
          humanitarian mission of the project.
        </p>
      </article>

      <article style={trustCard}>
        <div style={trustIcon}>🤝</div>

        <h3 style={trustTitle}>
          Long-Term Partnership
        </h3>

        <p style={trustText}>
          We build trusted relationships with organizations that share our
          cultural and human values.
        </p>
      </article>
    </div>
  </div>
</section>

        <section
          id="partnership-opportunities"
          style={opportunitiesSection}
        >
          <div style={sectionInner}>
            <div style={sectionEyebrow}>PARTNERSHIP OPPORTUNITIES</div>

            <h2 style={darkTitle}>
              Find your place inside the museum
            </h2>

            <p style={darkIntro}>
              Partnership opportunities will be available across selected
              areas of the Lobby and the Identity, Love and Creativity rooms.
              Every placement is reviewed before approval.
            </p>

            <div style={partnerDashboardBox}>
  <div style={partnerDashboardLabel}>
    INCLUDED WITH EVERY APPROVED PARTNERSHIP
  </div>

  <h3 style={partnerDashboardTitle}>
    Private Performance Dashboard
  </h3>

  <p style={partnerDashboardText}>
    Every approved partner receives exclusive access to a secure
    private dashboard where campaign performance can be monitored
    throughout the partnership period.
  </p>

  <div style={partnerDashboardGrid}>
    <div>📊 Real-time campaign statistics</div>
    <div>👁 Museum panel views</div>
    <div>🔗 Website click tracking</div>
    <div>📈 Click-through rate (CTR)</div>
    <div>📅 Campaign duration and remaining days</div>
    <div>🔒 Secure private access link</div>
  </div>

  <div style={partnerDashboardNote}>
    Your private dashboard becomes available after the partnership
    has been approved and payment has been completed.
  </div>
</div>

            {loading ? (
  <div style={loadingBox}>
    Loading partnership opportunities...
  </div>
) : error ? (
  <div style={loadingBox}>
    Unable to load partnership opportunities.
  </div>
) : (
  <div style={plansGrid}>
    {plans.map((plan) => (
      <SponsorPlanCard
  key={plan.id}
  plan={plan}
  onApply={(plan) => {
    setSelectedPlan(plan);
    setShowApplicationModal(true);
  }}
/>
    ))}
  </div>
)}
          </div>
        </section>

        <section style={finalSection}>
          <div style={finalContent}>
            <img
              src={logoImage}
              alt=""
              aria-hidden="true"
              style={finalLogo}
            />

            <div style={sectionEyebrow}>A PERMANENT GLOBAL ARTWORK</div>

            <h2 style={finalTitle}>
              Let your organization support something human
            </h2>

            <p style={finalText}>
              Join a project created to preserve memories, connect cultures and
              transform individual stories into one shared mosaic.
            </p>

            <button
              type="button"
              style={finalButton}
              onClick={onApply}
            >
              START YOUR APPLICATION
            </button>
          </div>
        </section>
      </main>

      <footer style={footer}>
        <span>© The Human Mosaic</span>

        <a
          href="mailto:info@thehumanmosaic.art"
          style={footerLink}
        >
          info@thehumanmosaic.art
        </a>
      </footer>
      
      {showApplicationModal && (
  <SponsorApplicationModal
    plan={selectedPlan}
    onClose={() => {
      setShowApplicationModal(false);
      setSelectedPlan(null);
    }}
    onSuccess={() => {
      setShowApplicationModal(false);
      setSelectedPlan(null);
      onApplicationSuccess?.();
    }}
  />
)}
    </div>
  );
}

const page = {
  position: "fixed",
  inset: 0,
  zIndex: 3000000,
  overflowY: "auto",
  overflowX: "hidden",
  background: "#090705",
  color: "#ffffff",
  fontFamily: "Arial, sans-serif",
};

const header = {
  position: "sticky",
  top: 0,
  zIndex: 20,
  minHeight: "72px",
  padding: "12px clamp(18px, 4vw, 54px)",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "rgba(9, 7, 5, 0.88)",
  borderBottom: "1px solid rgba(215, 181, 109, 0.22)",
  backdropFilter: "blur(16px)",
};

const brandButton = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: 0,
  border: "none",
  background: "transparent",
  color: "#f5ead8",
  cursor: "pointer",
};

const headerLogo = {
  width: "48px",
  height: "48px",
  objectFit: "contain",
};

const brandText = {
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "0.18em",
};

const closeButton = {
  width: "42px",
  height: "42px",
  borderRadius: "999px",
  border: "1px solid rgba(215, 181, 109, 0.55)",
  background: "rgba(255,255,255,0.04)",
  color: "#f2c879",
  fontSize: "28px",
  lineHeight: 1,
  cursor: "pointer",
};

const hero = {
  position: "relative",
  minHeight: "calc(100vh - 72px)",
  padding: "90px 22px",
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  background:
    "linear-gradient(145deg, #080604 0%, #1b1007 50%, #070605 100%)",
};

const heroGlowOne = {
  position: "absolute",
  width: "560px",
  height: "560px",
  top: "-220px",
  right: "-170px",
  borderRadius: "50%",
  background: "rgba(215,181,109,0.14)",
  filter: "blur(40px)",
};

const heroGlowTwo = {
  position: "absolute",
  width: "460px",
  height: "460px",
  bottom: "-220px",
  left: "-160px",
  borderRadius: "50%",
  background: "rgba(135,77,24,0.16)",
  filter: "blur(46px)",
};

const heroContent = {
  position: "relative",
  zIndex: 2,
  width: "min(100%, 1040px)",
  textAlign: "center",
};

const eyebrow = {
  marginBottom: "24px",
  color: "#d7b56d",
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "0.3em",
};

const heroTitle = {
  margin: 0,
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "clamp(48px, 8vw, 96px)",
  lineHeight: 0.98,
  fontWeight: 500,
  letterSpacing: "-0.035em",
};

const goldText = {
  color: "#e3c078",
};

const heroText = {
  maxWidth: "720px",
  margin: "30px auto 0",
  color: "#ded2c1",
  fontSize: "clamp(17px, 2vw, 21px)",
  lineHeight: 1.7,
};

const heroActions = {
  marginTop: "38px",
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "14px",
};

const primaryButton = {
  minHeight: "50px",
  padding: "14px 24px",
  border: "none",
  borderRadius: "999px",
  background: "#d7b56d",
  color: "#130d07",
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "0.09em",
  cursor: "pointer",
};

const secondaryButton = {
  ...primaryButton,
  border: "1px solid rgba(215,181,109,0.58)",
  background: "transparent",
  color: "#f2dfbd",
};

const principle = {
  maxWidth: "780px",
  margin: "54px auto 0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "18px",
  color: "#a99b87",
  fontSize: "12px",
  lineHeight: 1.5,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const principleLine = {
  width: "60px",
  height: "1px",
  flexShrink: 0,
  background: "rgba(215,181,109,0.45)",
};

const lightSection = {
  padding: "100px 22px",
  background: "#f1eadf",
};

const darkSection = {
  padding: "100px 22px",
  background: "#0c0906",
};

const opportunitiesSection = {
  padding: "100px 22px",
  scrollMarginTop: "90px",
  background: "#f7f2e9",
};

const sectionInner = {
  width: "min(100%, 1180px)",
  margin: "0 auto",
};

const sectionEyebrow = {
  marginBottom: "16px",
  color: "#a67c31",
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "0.24em",
  textAlign: "center",
};

const darkTitle = {
  maxWidth: "820px",
  margin: "0 auto",
  color: "#24180d",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "clamp(36px, 5vw, 62px)",
  lineHeight: 1.06,
  fontWeight: 500,
  textAlign: "center",
};

const lightTitle = {
  ...darkTitle,
  color: "#f3e9db",
};

const darkIntro = {
  maxWidth: "760px",
  margin: "24px auto 50px",
  color: "#655746",
  fontSize: "17px",
  lineHeight: 1.75,
  textAlign: "center",
};

const lightIntro = {
  ...darkIntro,
  color: "#bdb09e",
};

const benefitGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px",
};

const benefitCard = {
  minHeight: "250px",
  padding: "30px",
  boxSizing: "border-box",
  border: "1px solid rgba(96, 67, 33, 0.18)",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.54)",
};

const benefitNumber = {
  marginBottom: "44px",
  color: "#a67c31",
  fontSize: "12px",
  fontWeight: 900,
  letterSpacing: "0.16em",
};

const benefitTitle = {
  margin: "0 0 14px",
  color: "#2c1d10",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "26px",
  fontWeight: 500,
};

const benefitText = {
  margin: 0,
  color: "#6a5a47",
  fontSize: "15px",
  lineHeight: 1.7,
};

const partnerGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
  gap: "16px",
};

const partnerCard = {
  minHeight: "230px",
  padding: "28px",
  boxSizing: "border-box",
  border: "1px solid rgba(215,181,109,0.22)",
  borderRadius: "22px",
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
};

const partnerIcon = {
  marginBottom: "22px",
  fontSize: "30px",
};

const partnerTitle = {
  margin: "0 0 12px",
  color: "#f1d9ab",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "23px",
  fontWeight: 500,
};

const partnerText = {
  margin: 0,
  color: "#b9aa96",
  fontSize: "14px",
  lineHeight: 1.65,
};

const opportunityPlaceholder = {
  maxWidth: "820px",
  margin: "0 auto",
  padding: "clamp(28px, 5vw, 56px)",
  boxSizing: "border-box",
  border: "1px solid rgba(166,124,49,0.32)",
  borderRadius: "30px",
  background:
    "linear-gradient(145deg, rgba(215,181,109,0.10), rgba(255,255,255,0.80))",
  textAlign: "center",
};

const placeholderLabel = {
  marginBottom: "16px",
  color: "#9a7028",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.22em",
};

const placeholderTitle = {
  margin: 0,
  color: "#2e2013",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "clamp(28px, 4vw, 42px)",
  fontWeight: 500,
};

const placeholderText = {
  maxWidth: "610px",
  margin: "20px auto 28px",
  color: "#695a48",
  fontSize: "16px",
  lineHeight: 1.7,
};

const finalSection = {
  padding: "110px 22px",
  background:
    "radial-gradient(circle at top, rgba(215,181,109,0.16), rgba(8,6,4,1) 58%)",
};

const finalContent = {
  width: "min(100%, 850px)",
  margin: "0 auto",
  textAlign: "center",
};

const finalLogo = {
  width: "120px",
  maxWidth: "45%",
  marginBottom: "26px",
};

const finalTitle = {
  margin: "0 auto",
  color: "#f4eadb",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "clamp(38px, 6vw, 66px)",
  lineHeight: 1.05,
  fontWeight: 500,
};

const finalText = {
  maxWidth: "690px",
  margin: "24px auto 32px",
  color: "#bfb2a0",
  fontSize: "17px",
  lineHeight: 1.75,
};

const finalButton = {
  ...primaryButton,
  minWidth: "230px",
};

const footer = {
  padding: "26px clamp(20px, 5vw, 60px)",
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: "16px",
  borderTop: "1px solid rgba(215,181,109,0.18)",
  background: "#060504",
  color: "#857866",
  fontSize: "12px",
};

const footerLink = {
  color: "#c9a962",
  textDecoration: "none",
};

const trustSection = {
  padding: "100px 22px",
  background:
    "linear-gradient(180deg, #15100b 0%, #0b0806 100%)",
  borderTop: "1px solid rgba(215,181,109,0.12)",
  borderBottom: "1px solid rgba(215,181,109,0.12)",
};

const trustGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
  gap: "18px",
};

const trustCard = {
  minHeight: "255px",
  padding: "30px",
  boxSizing: "border-box",
  borderRadius: "24px",
  border: "1px solid rgba(215,181,109,0.22)",
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.055), rgba(255,255,255,0.018))",
};

const trustIcon = {
  marginBottom: "24px",
  fontSize: "31px",
};

const trustTitle = {
  margin: "0 0 14px",
  color: "#f1d9ab",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "24px",
  lineHeight: 1.2,
  fontWeight: 500,
};

const trustText = {
  margin: 0,
  color: "#b9aa96",
  fontSize: "14px",
  lineHeight: 1.7,
};

const plansGrid = {
  marginTop: "50px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "28px",
  alignItems: "stretch",
};

const partnerDashboardBox = {
  margin: "36px auto 0",
  padding: "30px",
  borderRadius: "24px",
  border: "1px solid rgba(166,124,49,0.28)",
  background:
    "linear-gradient(145deg, rgba(215,181,109,0.10), rgba(255,255,255,0.82))",
  boxShadow: "0 18px 50px rgba(66, 45, 22, 0.08)",
};

const partnerDashboardLabel = {
  marginBottom: "12px",
  color: "#a67c31",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.18em",
  textAlign: "center",
};

const partnerDashboardTitle = {
  margin: "0 0 14px",
  color: "#2c1d10",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "clamp(28px, 4vw, 40px)",
  fontWeight: 500,
  textAlign: "center",
};

const partnerDashboardText = {
  maxWidth: "760px",
  margin: "0 auto",
  color: "#655746",
  fontSize: "16px",
  lineHeight: 1.7,
  textAlign: "center",
};

const partnerDashboardGrid = {
  marginTop: "26px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "14px",
  color: "#4b3a29",
  fontSize: "14px",
  lineHeight: 1.6,
};

const partnerDashboardNote = {
  marginTop: "24px",
  paddingTop: "18px",
  borderTop: "1px solid rgba(166,124,49,0.18)",
  color: "#7a674f",
  fontSize: "13px",
  lineHeight: 1.6,
  textAlign: "center",
};

const loadingBox = {
  marginTop: "50px",
  padding: "50px",
  borderRadius: "24px",
  textAlign: "center",
  color: "#c7b49b",
  border: "1px solid rgba(215,181,109,0.15)",
  background: "rgba(255,255,255,0.03)",
  fontSize: "18px",
};
