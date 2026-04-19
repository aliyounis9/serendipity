import { useState, useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { CITIES, CITY_QUESTIONS, PERSONALITY_QUESTIONS } from "./data/travelData";
import { buildExternalMapsUrl, buildStaticMapUrl } from "./services/maps";
import { buildPlanPrompt, requestPlanFromModel } from "./services/planService";

// --- Aesthetic tokens ---
const palette = {
  bg: "#0D1117",
  card: "#161B22",
  cardHover: "#1C2333",
  accent: "#F97316",
  accentSoft: "rgba(249,115,22,0.12)",
  accentGlow: "rgba(249,115,22,0.25)",
  text: "#E6EDF3",
  textMuted: "#8B949E",
  textDim: "#484F58",
  border: "#30363D",
  success: "#3FB950",
  surface: "#0D1117",
  correct: "#3FB950",
  correctSoft: "rgba(63,185,80,0.12)",
  incorrect: "#F85149",
  incorrectSoft: "rgba(248,81,73,0.12)",
};

const font = `'Segoe UI', system-ui, -apple-system, sans-serif`;

// --- Screens ---

function WelcomeScreen({ onStart }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", fontFamily: font,
      background: `radial-gradient(ellipse at 50% 0%, ${palette.accentGlow} 0%, ${palette.bg} 60%)`,
      padding: "2rem", transition: "opacity 0.8s ease", opacity: visible ? 1 : 0,
    }}>
      <div style={{
        fontSize: "4.5rem", marginBottom: "0.5rem",
        filter: "drop-shadow(0 0 24px rgba(249,115,22,0.4))",
      }}>✦</div>
      <h1 style={{
        fontSize: "2.8rem", fontWeight: 700, color: palette.text,
        letterSpacing: "-0.03em", margin: "0 0 0.5rem 0",
      }}>Serendipity</h1>
      <p style={{
        color: palette.textMuted, fontSize: "1.15rem", margin: "0 0 2.5rem 0",
        maxWidth: 420, textAlign: "center", lineHeight: 1.6,
      }}>
        Discover cities the way they were meant to be experienced — through your unique lens.
      </p>
      <button onClick={onStart} style={{
        background: palette.accent, color: "#fff", border: "none",
        padding: "0.85rem 2.5rem", borderRadius: 12, fontSize: "1.05rem",
        fontWeight: 600, cursor: "pointer", letterSpacing: "0.02em",
        boxShadow: `0 0 20px ${palette.accentGlow}`,
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
        onMouseEnter={e => { e.target.style.transform = "scale(1.04)"; }}
        onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}
      >
        Begin Your Journey
      </button>
    </div>
  );
}

function CityPicker({ onSelect, onBack }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  return (
    <div style={{
      minHeight: "100vh", fontFamily: font, background: palette.bg,
      padding: "3rem 2rem", transition: "opacity 0.6s", opacity: visible ? 1 : 0,
    }}>
      <p style={{ color: palette.accent, fontSize: "0.85rem", fontWeight: 600,
        letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 0.5rem 0", textAlign: "center" }}>
        STEP 1 OF 4
      </p>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
        <button onClick={onBack} style={{
          background: "transparent", color: palette.textMuted, border: `1px solid ${palette.border}`,
          padding: "0.45rem 0.9rem", borderRadius: 10, fontSize: "0.85rem",
          cursor: "pointer", transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.target.style.borderColor = palette.accent; e.target.style.color = palette.text; }}
          onMouseLeave={e => { e.target.style.borderColor = palette.border; e.target.style.color = palette.textMuted; }}
        >
          ← Back
        </button>
      </div>
      <h2 style={{ color: palette.text, fontSize: "1.8rem", fontWeight: 700,
        textAlign: "center", margin: "0 0 0.3rem 0" }}>Where are you headed?</h2>
      <p style={{ color: palette.textMuted, textAlign: "center", margin: "0 0 2rem 0" }}>
        Pick a city and we'll craft your perfect experience.
      </p>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "1rem", maxWidth: 860, margin: "0 auto",
      }}>
        {CITIES.map((city, i) => (
          <button key={city.name} onClick={() => onSelect(city.name)} style={{
            background: palette.card, border: `1px solid ${palette.border}`,
            borderRadius: 14, padding: "1.4rem 1.2rem", cursor: "pointer",
            textAlign: "left", transition: "all 0.25s",
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background = palette.cardHover;
              e.currentTarget.style.borderColor = palette.accent;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = palette.card;
              e.currentTarget.style.borderColor = palette.border;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span style={{ fontSize: "2rem" }}>{city.emoji}</span>
            <div style={{ fontSize: "1.15rem", fontWeight: 600, color: palette.text, marginTop: 8, display: "flex", alignItems: "center", gap: "0.4rem" }}>
              {city.name} <span style={{ fontSize: "1rem" }}>{city.flag}</span>
            </div>
            <div style={{ fontSize: "0.88rem", color: palette.textMuted, marginTop: 4 }}>
              {city.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function TripDetailsScreen({ city, onComplete, onBack }) {
  const [days, setDays] = useState(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const cityData = CITIES.find(c => c.name === city);
  const flag = cityData?.flag || "";

  const dayOptions = [
    { value: 2, label: "2 days", desc: "Quick taste of the city" },
    { value: 3, label: "3 days", desc: "The sweet spot" },
    { value: 5, label: "5 days", desc: "Deep dive" },
    { value: 7, label: "7 days", desc: "Full immersion" },
  ];

  return (
    <div style={{
      minHeight: "100vh", fontFamily: font, background: palette.bg,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "3rem 2rem", transition: "opacity 0.6s", opacity: visible ? 1 : 0,
    }}>
      <p style={{ color: palette.accent, fontSize: "0.85rem", fontWeight: 600,
        letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 0.5rem 0" }}>
        STEP 2 OF 4
      </p>
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={onBack} style={{
          background: "transparent", color: palette.textMuted, border: `1px solid ${palette.border}`,
          padding: "0.45rem 0.9rem", borderRadius: 10, fontSize: "0.85rem",
          cursor: "pointer", transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.target.style.borderColor = palette.accent; e.target.style.color = palette.text; }}
          onMouseLeave={e => { e.target.style.borderColor = palette.border; e.target.style.color = palette.textMuted; }}
        >
          ← Back
        </button>
      </div>
      <h2 style={{ color: palette.text, fontSize: "1.8rem", fontWeight: 700,
        textAlign: "center", margin: "0 0 0.3rem 0" }}>
        How long will you be in {city}? {flag}
      </h2>
      <p style={{ color: palette.textMuted, textAlign: "center", margin: "0 0 2rem 0" }}>
        This helps us pace your experience perfectly.
      </p>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
        gap: "1rem", maxWidth: 460, width: "100%",
      }}>
        {dayOptions.map((opt) => {
          const isSelected = days === opt.value;
          return (
            <button key={opt.value} onClick={() => setDays(opt.value)} style={{
              background: isSelected ? palette.accentSoft : palette.card,
              border: `1px solid ${isSelected ? palette.accent : palette.border}`,
              borderRadius: 14, padding: "1.4rem 1.2rem", cursor: "pointer",
              textAlign: "center", transition: "all 0.2s",
            }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = palette.accent;
                  e.currentTarget.style.background = palette.cardHover;
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = palette.border;
                  e.currentTarget.style.background = palette.card;
                }
              }}
            >
              <div style={{
                fontSize: "1.8rem", fontWeight: 700,
                color: isSelected ? palette.accent : palette.text,
              }}>{opt.label}</div>
              <div style={{
                fontSize: "0.85rem", color: palette.textMuted, marginTop: 4,
              }}>{opt.desc}</div>
            </button>
          );
        })}
      </div>

      {days && (
        <button onClick={() => onComplete(days)} style={{
          marginTop: "2rem", background: palette.accent, color: "#fff", border: "none",
          padding: "0.8rem 2.2rem", borderRadius: 12, fontSize: "1rem",
          fontWeight: 600, cursor: "pointer",
          boxShadow: `0 0 16px ${palette.accentGlow}`,
          transition: "transform 0.2s",
        }}
          onMouseEnter={e => { e.target.style.transform = "scale(1.04)"; }}
          onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}
        >
          Continue →
        </button>
      )}
    </div>
  );
}

function CityQuizScreen({ city, questions, onComplete, onBack, initialProgress, onProgressChange }) {
  const [currentQ, setCurrentQ] = useState(initialProgress?.currentQ ?? 0);
  const [answers, setAnswers] = useState(initialProgress?.answers ?? {});
  const [selected, setSelected] = useState(initialProgress?.selected ?? []);
  const [fading, setFading] = useState(false);

  const q = questions[currentQ];

  function toggleOption(value) {
    setSelected(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  }

  function handleNext() {
    if (selected.length === 0) return;
    const newAnswers = { ...answers, [q.id]: selected };
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setFading(true);
      setTimeout(() => {
        setCurrentQ(currentQ + 1);
        setSelected([]);
        setFading(false);
      }, 300);
    } else {
      onComplete(newAnswers);
    }
  }

  function handleBack() {
    if (currentQ > 0) {
      const prevIndex = currentQ - 1;
      const prevQuestion = questions[prevIndex];
      setCurrentQ(prevIndex);
      setSelected(Array.isArray(answers[prevQuestion.id]) ? answers[prevQuestion.id] : []);
      return;
    }

    onBack();
  }

  useEffect(() => {
    onProgressChange?.({ currentQ, answers, selected });
  }, [currentQ, answers, selected, onProgressChange]);

  return (
    <div style={{
      minHeight: "100vh", fontFamily: font, background: palette.bg,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "2rem",
    }}>
      <div style={{
        width: "100%", maxWidth: 500, height: 4, background: palette.border,
        borderRadius: 2, marginBottom: "3rem", marginTop: "1rem", overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${(currentQ / questions.length) * 100}%`,
          background: palette.accent, borderRadius: 2, transition: "width 0.4s ease",
        }} />
      </div>

      <p style={{ color: palette.accent, fontSize: "0.8rem", fontWeight: 600,
        letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 0.2rem 0" }}>
        STEP 3 OF 4 — ABOUT {city.toUpperCase()}
      </p>
      <div style={{ width: "100%", maxWidth: 540, marginBottom: "0.6rem" }}>
        <button onClick={handleBack} style={{
          background: "transparent", color: palette.textMuted, border: `1px solid ${palette.border}`,
          padding: "0.4rem 0.85rem", borderRadius: 10, fontSize: "0.82rem",
          cursor: "pointer", transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.target.style.borderColor = palette.accent; e.target.style.color = palette.text; }}
          onMouseLeave={e => { e.target.style.borderColor = palette.border; e.target.style.color = palette.textMuted; }}
        >
          ← Back
        </button>
      </div>
      <p style={{ color: palette.textMuted, fontSize: "0.8rem", margin: "0 0 0.5rem 0" }}>
        Select all that apply
      </p>

      <div style={{
        opacity: fading ? 0 : 1, transform: fading ? "translateY(10px)" : "translateY(0)",
        transition: "all 0.3s ease", width: "100%", maxWidth: 540,
      }}>
        <h2 style={{
          color: palette.text, fontSize: "1.5rem", fontWeight: 700,
          textAlign: "center", margin: "0 0 2rem 0", lineHeight: 1.4,
        }}>{q.question}</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {q.options.map((opt) => {
            const isSelected = selected.includes(opt.value);
            return (
              <button key={opt.value} onClick={() => toggleOption(opt.value)} style={{
                background: isSelected ? palette.accentSoft : palette.card,
                border: `1px solid ${isSelected ? palette.accent : palette.border}`,
                borderRadius: 12, padding: "1rem 1.2rem",
                cursor: "pointer",
                textAlign: "left", display: "flex", alignItems: "center", gap: "0.8rem",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = palette.accent;
                    e.currentTarget.style.background = palette.cardHover;
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = palette.border;
                    e.currentTarget.style.background = palette.card;
                  }
                }}
              >
                <span style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  border: `2px solid ${isSelected ? palette.accent : palette.textDim}`,
                  background: isSelected ? palette.accent : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", color: "#fff", fontWeight: 700,
                  transition: "all 0.2s",
                }}>{isSelected ? "✓" : ""}</span>
                <span style={{
                  fontSize: "1.4rem", width: 40, height: 40,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isSelected ? palette.accentGlow : "rgba(255,255,255,0.04)",
                  borderRadius: 10, flexShrink: 0,
                }}>{opt.icon}</span>
                <span style={{
                  color: isSelected ? palette.accent : palette.text,
                  fontSize: "0.95rem", fontWeight: isSelected ? 600 : 400,
                }}>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {selected.length > 0 && (
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <button onClick={handleNext} style={{
              background: palette.accent, color: "#fff", border: "none",
              padding: "0.75rem 2rem", borderRadius: 12, fontSize: "0.95rem",
              fontWeight: 600, cursor: "pointer",
              boxShadow: `0 0 16px ${palette.accentGlow}`,
              transition: "transform 0.2s",
            }}
              onMouseEnter={e => { e.target.style.transform = "scale(1.04)"; }}
              onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function QuizScreen({ questions, onComplete, stepLabel, onBack, initialProgress, onProgressChange }) {
  const [currentQ, setCurrentQ] = useState(initialProgress?.currentQ ?? 0);
  const [answers, setAnswers] = useState(initialProgress?.answers ?? {});
  const [selected, setSelected] = useState(initialProgress?.selected ?? null);
  const [fading, setFading] = useState(false);

  const q = questions[currentQ];
  const progress = ((currentQ) / questions.length) * 100;

  function handleSelect(value) {
    setSelected(value);
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setFading(true);
        setTimeout(() => {
          setCurrentQ(currentQ + 1);
          setSelected(null);
          setFading(false);
        }, 300);
      } else {
        onComplete(newAnswers);
      }
    }, 400);
  }

  function handleBack() {
    if (currentQ > 0) {
      const prevIndex = currentQ - 1;
      const prevQuestion = questions[prevIndex];
      setCurrentQ(prevIndex);
      setSelected(answers[prevQuestion.id] ?? null);
      return;
    }

    onBack();
  }

  useEffect(() => {
    onProgressChange?.({ currentQ, answers, selected });
  }, [currentQ, answers, selected, onProgressChange]);

  return (
    <div style={{
      minHeight: "100vh", fontFamily: font, background: palette.bg,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "2rem",
    }}>
      <div style={{
        width: "100%", maxWidth: 500, height: 4, background: palette.border,
        borderRadius: 2, marginBottom: "3rem", marginTop: "1rem", overflow: "hidden",
      }}>
        <div style={{
          height: "100%", width: `${progress}%`, background: palette.accent,
          borderRadius: 2, transition: "width 0.4s ease",
        }} />
      </div>

      <p style={{ color: palette.accent, fontSize: "0.8rem", fontWeight: 600,
        letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 0.5rem 0" }}>
        {stepLabel} — QUESTION {currentQ + 1} OF {questions.length}
      </p>
      <div style={{ width: "100%", maxWidth: 540, marginBottom: "0.8rem" }}>
        <button onClick={handleBack} style={{
          background: "transparent", color: palette.textMuted, border: `1px solid ${palette.border}`,
          padding: "0.4rem 0.85rem", borderRadius: 10, fontSize: "0.82rem",
          cursor: "pointer", transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.target.style.borderColor = palette.accent; e.target.style.color = palette.text; }}
          onMouseLeave={e => { e.target.style.borderColor = palette.border; e.target.style.color = palette.textMuted; }}
        >
          ← Back
        </button>
      </div>

      <div style={{
        opacity: fading ? 0 : 1, transform: fading ? "translateY(10px)" : "translateY(0)",
        transition: "all 0.3s ease", width: "100%", maxWidth: 540,
      }}>
        <h2 style={{
          color: palette.text, fontSize: "1.5rem", fontWeight: 700,
          textAlign: "center", margin: "0 0 2rem 0", lineHeight: 1.4,
        }}>{q.question}</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {q.options.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <button key={opt.value} onClick={() => handleSelect(opt.value)} style={{
                background: isSelected ? palette.accentSoft : palette.card,
                border: `1px solid ${isSelected ? palette.accent : palette.border}`,
                borderRadius: 12, padding: "1rem 1.2rem", cursor: "pointer",
                textAlign: "left", display: "flex", alignItems: "center", gap: "0.8rem",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = palette.accent;
                    e.currentTarget.style.background = palette.cardHover;
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = palette.border;
                    e.currentTarget.style.background = palette.card;
                  }
                }}
              >
                <span style={{
                  fontSize: "1.4rem", width: 40, height: 40,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isSelected ? palette.accentGlow : "rgba(255,255,255,0.04)",
                  borderRadius: 10, flexShrink: 0,
                }}>{opt.icon}</span>
                <span style={{
                  color: isSelected ? palette.accent : palette.text,
                  fontSize: "0.95rem", fontWeight: isSelected ? 600 : 400,
                }}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LoadingScreen({ city }) {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? "" : d + ".");
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: "100vh", fontFamily: font,
      background: `radial-gradient(ellipse at 50% 40%, ${palette.accentGlow} 0%, ${palette.bg} 55%)`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        width: 48, height: 48, border: `3px solid ${palette.border}`,
        borderTopColor: palette.accent, borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{
        color: palette.text, fontSize: "1.2rem", fontWeight: 600, marginTop: "1.5rem",
      }}>Crafting your {city} experience{dots}</p>
      <p style={{ color: palette.textMuted, fontSize: "0.9rem", marginTop: "0.5rem" }}>
        Personalizing activities, timing, and hidden gems
      </p>
    </div>
  );
}

// Google Maps API key (separate from Gemini - from Google Cloud Console)
const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY || "";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const PRIMARY_MODEL = import.meta.env.VITE_GEMINI_PRIMARY_MODEL || "gemini-2.5-flash-lite";
const FALLBACK_MODEL = import.meta.env.VITE_GEMINI_FALLBACK_MODEL || "gemma-3-1b-it";

function buildWhyThisPlan(personalityAnswers, cityAnswers, city) {
  const energyMap = {
    high: "fast-paced days with lots of movement",
    low: "slower pacing with breathing room",
    structured: "well-structured days with clear flow",
    social: "social and local interaction moments",
  };

  const foodMap = {
    street: "street-food-driven stops",
    fine: "high-quality dining highlights",
    spontaneous: "spontaneous spots with local energy",
    immersive: "immersive food experiences",
  };

  const cultureMap = {
    history: "history-rich landmarks",
    offbeat: "less-touristy neighborhood gems",
    nature: "green or scenic recharge moments",
    creative: "creative and artistic spaces",
  };

  const socialMap = {
    deep: "meaningful local moments",
    solo: "independent exploration pockets",
    group: "shareable group-friendly activities",
    learning: "learn-by-doing experiences",
  };

  const surpriseMap = {
    love: "a bold surprise element",
    moderate: "a balanced, low-risk surprise",
    cautious: "a gentle surprise with clear context",
    full: "a fully serendipitous twist",
  };

  const neighborhoods = cityAnswers?.city_neighborhoods?.slice(0, 2).join(" and ");
  const picks = [
    energyMap[personalityAnswers?.energy],
    foodMap[personalityAnswers?.food],
    cultureMap[personalityAnswers?.culture],
    socialMap[personalityAnswers?.social],
    surpriseMap[personalityAnswers?.surprise],
  ].filter(Boolean);

  const compactPicks = picks.slice(0, 3).join(", ");
  const locationNote = neighborhoods ? ` around ${neighborhoods}` : " in central areas";

  return `This itinerary is tuned for ${compactPicks}${locationNote} in ${city}.`;
}

function ensureAtLeastOneSurprise(planData) {
  const normalized = (Array.isArray(planData) ? planData : []).map((day) => ({
    ...day,
    activities: (day.activities || []).map((act) => ({
      ...act,
      isSurprise: Boolean(act.isSurprise),
    })),
  }));

  const hasSurprise = normalized.some((day) => day.activities.some((act) => act.isSurprise));
  if (hasSurprise) return normalized;

  const firstDayWithActivities = normalized.find((day) => day.activities.length > 0);
  if (!firstDayWithActivities) return normalized;

  const surpriseIndex = Math.floor(firstDayWithActivities.activities.length / 2);
  const existing = firstDayWithActivities.activities[surpriseIndex];

  firstDayWithActivities.activities[surpriseIndex] = {
    ...existing,
    isSurprise: true,
    description:
      existing.description ||
      "A mystery local stop selected for your vibe. Tap reveal to see what unlocks here.",
  };

  return normalized;
}

function ensureTravelSegments(planData) {
  return (Array.isArray(planData) ? planData : []).map((day) => {
    const activities = day.activities || [];

    return {
      ...day,
      activities: activities.map((act, index) => {
        const isLast = index === activities.length - 1;
        if (isLast) return act;

        const existing = act.travelToNext || {};
        const mode = typeof existing.mode === "string" && existing.mode ? existing.mode : "walk";
        const duration = typeof existing.duration === "string" && existing.duration ? existing.duration : "10 min";

        return {
          ...act,
          travelToNext: {
            mode,
            duration,
            ...(existing.note ? { note: existing.note } : { note: "Estimated local transfer" }),
          },
        };
      }),
    };
  });
}

function PlanScreen({ city, days, plan, onRestart, whyThisPlan }) {
  const [visible, setVisible] = useState(false);
  const [mapErrors, setMapErrors] = useState({});
  const [revealedSurprises, setRevealedSurprises] = useState({});
  const [exporting, setExporting] = useState(false);
  const [printMode, setPrintMode] = useState(false);
  const planRef = useRef(null);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  function revealSurprise(surpriseId) {
    setRevealedSurprises((prev) => ({ ...prev, [surpriseId]: true }));
  }

  function estimateUsersNearby(seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) % 9973;
    }
    return 3 + (hash % 26);
  }

  const cityData = CITIES.find(c => c.name === city);
  const flag = cityData?.flag || "";

  // Light theme palette for PDF export
  const printPalette = {
    bg: "#ffffff",
    card: "#f8f9fa",
    text: "#1a1a1a",
    textMuted: "#555555",
    textDim: "#888888",
    border: "#e0e0e0",
    accent: "#e65100",
    accentSoft: "rgba(230, 81, 0, 0.1)",
  };

  const p = printMode ? printPalette : palette;

  const handleExportPDF = async () => {
    if (!planRef.current) return;
    setExporting(true);
    setPrintMode(true);
    
    // Wait for React to re-render with light theme
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${city.toLowerCase().replace(/\s+/g, "-")}-${days}-day-plan.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] },
    };
    
    try {
      await html2pdf().set(opt).from(planRef.current).save();
    } catch (err) {
      console.error("PDF export error:", err);
    }
    
    setPrintMode(false);
    setExporting(false);
  };

  return (
    <div style={{
      minHeight: "100vh", fontFamily: font, background: p.bg,
      padding: "2rem", transition: printMode ? "none" : "opacity 0.6s", opacity: visible ? 1 : 0,
    }}>
      <div ref={planRef} style={{ maxWidth: 700, margin: "0 auto", background: p.bg }}>
        <p style={{ color: p.accent, fontSize: "0.8rem", fontWeight: 600,
          letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 0.4rem 0",
          textAlign: "center" }}>YOUR PERSONALIZED PLAN</p>
        <h2 style={{
          color: p.text, fontSize: "2rem", fontWeight: 700,
          textAlign: "center", margin: "0 0 0.3rem 0",
        }}>{days} Days in {city} {flag}</h2>
        <p style={{
          color: p.textMuted, textAlign: "center",
          margin: "0 0 2rem 0", fontSize: "0.95rem",
        }}>Tailored to your travel personality</p>

        {whyThisPlan && (
          <div style={{
            marginBottom: "1rem",
            background: p.card,
            border: `1px solid ${p.border}`,
            borderLeft: `4px solid ${p.accent}`,
            borderRadius: 12,
            padding: "0.9rem 1rem",
          }}>
            <div style={{
              color: p.accent,
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: "0.3rem",
            }}>Why This Plan Fits You</div>
            <div style={{ color: p.textMuted, fontSize: "0.9rem", lineHeight: 1.5 }}>
              {whyThisPlan}
            </div>
          </div>
        )}

        {plan.map((day, di) => (
          <div key={di} style={{
            marginBottom: "1.5rem",
            animation: printMode ? "none" : `fadeSlideIn 0.5s ease ${di * 0.15}s both`,
          }}>
            <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
            <div style={{
              display: "flex", alignItems: "center", gap: "0.6rem",
              marginBottom: "0.75rem", flexWrap: "wrap",
            }}>
              <span style={{
                background: p.accent, color: "#fff", fontSize: "0.75rem",
                fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: 6,
              }}>DAY {di + 1}</span>
              <span style={{ color: p.text, fontWeight: 600, fontSize: "1.1rem" }}>
                {day.theme}
              </span>
              {day.neighborhood && (
                <span style={{
                  color: p.textMuted, fontSize: "0.8rem",
                  background: printMode ? "#f0f0f0" : "rgba(255,255,255,0.04)", padding: "0.15rem 0.5rem",
                  borderRadius: 4,
                }}>📍 {day.neighborhood}</span>
              )}
            </div>

            {/* Mini-map for the day */}
            {!mapErrors[di] && (
              <div style={{
                marginBottom: "0.75rem", borderRadius: 12, overflow: "hidden",
                border: `1px solid ${p.border}`,
              }}>
                <img
                  src={buildStaticMapUrl(day.activities, city, CITIES, MAPS_API_KEY)}
                  alt={`Map for Day ${di + 1}`}
                  style={{ width: "100%", height: printMode ? 180 : 220, objectFit: "cover", display: "block" }}
                  onError={() => setMapErrors(prev => ({ ...prev, [di]: true }))}
                />
              </div>
            )}
            {!printMode && (
              <div style={{ marginBottom: "0.75rem" }}>
                <a
                  href={buildExternalMapsUrl(day.activities, city, CITIES)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    textDecoration: "none",
                    color: p.accent,
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    border: `1px solid ${p.border}`,
                    borderRadius: 8,
                    padding: "0.35rem 0.65rem",
                    background: printMode ? "#f0f0f0" : "rgba(255,255,255,0.03)",
                  }}
                >
                  🗺️ Open in Google Maps
                </a>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {day.activities.map((act, ai) => (
                <div key={ai}>
                  {(() => {
                    const surpriseId = `${di}-${ai}`;
                    const isRevealed = Boolean(revealedSurprises[surpriseId]);
                    const usersNearby = estimateUsersNearby(`${city}-${di}-${ai}-${act.name || "surprise"}`);
                    const isHiddenSurprise = act.isSurprise && !isRevealed && !printMode;

                    return (
                  <div style={{
                    background: p.card, border: `1px solid ${p.border}`,
                    borderRadius: 12, padding: "1rem 1.2rem",
                    display: "flex", gap: "1rem", alignItems: "flex-start",
                  }}>
                    <div style={{
                      background: p.accentSoft, borderRadius: 10,
                      width: 42, height: 42, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "1.3rem", flexShrink: 0,
                    }}>{isHiddenSurprise ? "✦" : act.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: p.text, fontWeight: 600, fontSize: "0.95rem" }}>
                          {isHiddenSurprise ? "Unrevealed Serendipity Event" : act.name}
                        </span>
                        <span style={{ color: p.textDim, fontSize: "0.8rem" }}>{act.time}</span>
                      </div>
                      {!isHiddenSurprise && act.location && (
                        <span style={{ color: p.textDim, fontSize: "0.78rem" }}>📍 {act.location}</span>
                      )}
                      <p style={{
                        color: p.textMuted, fontSize: "0.88rem",
                        margin: "0.3rem 0 0 0", lineHeight: 1.5,
                      }}>
                        {isHiddenSurprise
                          ? "Tap Reveal Surprise to unlock this activity and see how many Serendipity travelers are expected there."
                          : act.description}
                      </p>
                      {act.isSurprise && (
                        <div style={{ marginTop: "0.45rem" }}>
                          <span style={{
                            display: "inline-block",
                            background: printMode ? "rgba(230,81,0,0.1)" : "rgba(249,115,22,0.08)",
                            color: p.accent,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            padding: "0.2rem 0.6rem",
                            borderRadius: 6,
                            border: `1px solid ${printMode ? "rgba(230,81,0,0.3)" : "rgba(249,115,22,0.2)"}`,
                          }}>✦ Surprise Activity</span>

                          {!isRevealed && !printMode && (
                            <div style={{ marginTop: "0.5rem" }}>
                              <button
                                onClick={() => revealSurprise(surpriseId)}
                                style={{
                                  background: p.accent,
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 8,
                                  padding: "0.35rem 0.7rem",
                                  fontSize: "0.78rem",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                Reveal Surprise
                              </button>
                            </div>
                          )}

                          {(isRevealed || printMode) && (
                            <div style={{
                              marginTop: "0.5rem",
                              color: p.textMuted,
                              fontSize: "0.8rem",
                              background: printMode ? "#f0f0f0" : "rgba(255,255,255,0.04)",
                              border: `1px solid ${p.border}`,
                              borderRadius: 8,
                              padding: "0.45rem 0.55rem",
                            }}>
                              Around {usersNearby} other Serendipity travelers are expected here.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                    );
                  })()}
                  {/* Travel connector to next activity */}
                  {act.travelToNext && ai < day.activities.length - 1 && (
                    <div style={{
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      padding: "0.6rem 0 0.6rem 1.2rem", marginLeft: "20px",
                      borderLeft: `2px dashed ${p.border}`,
                    }}>
                      <span style={{ fontSize: "1rem" }}>
                        {act.travelToNext.mode === "walk" && "🚶"}
                        {act.travelToNext.mode === "metro" && "🚇"}
                        {act.travelToNext.mode === "taxi" && "🚕"}
                        {act.travelToNext.mode === "bus" && "🚌"}
                        {act.travelToNext.mode === "tram" && "🚊"}
                      </span>
                      <span style={{
                        color: p.textMuted, fontSize: "0.82rem", fontWeight: 500,
                      }}>
                        {act.travelToNext.duration} {act.travelToNext.mode === "walk" ? "walk" : `by ${act.travelToNext.mode}`} (estimated)
                      </span>
                      {act.travelToNext.note && (
                        <span style={{
                          color: p.textDim, fontSize: "0.75rem", fontStyle: "italic",
                        }}>— {act.travelToNext.note}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {!printMode && (
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem", paddingBottom: "2rem" }}>
            <button onClick={handleExportPDF} disabled={exporting} style={{
              background: p.accent, color: "#fff", border: "none",
              padding: "0.7rem 1.8rem", borderRadius: 10, fontSize: "0.9rem",
              fontWeight: 600, cursor: exporting ? "wait" : "pointer", transition: "all 0.2s",
              opacity: exporting ? 0.7 : 1,
            }}
              onMouseEnter={e => { if (!exporting) e.target.style.transform = "scale(1.03)"; }}
              onMouseLeave={e => { e.target.style.transform = "scale(1)"; }}
            >
              {exporting ? "Exporting..." : "📄 Export PDF"}
            </button>
            <button onClick={onRestart} style={{
              background: "transparent", color: p.textMuted, border: `1px solid ${p.border}`,
              padding: "0.7rem 1.8rem", borderRadius: 10, fontSize: "0.9rem",
              cursor: "pointer", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.target.style.borderColor = p.accent; e.target.style.color = p.text; }}
              onMouseLeave={e => { e.target.style.borderColor = p.border; e.target.style.color = p.textMuted; }}
            >
              Try Another City →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main App ---
export default function SerendipityApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const screenByPath = {
    "/": "welcome",
    "/city": "city",
    "/tripdetails": "tripdetails",
    "/cityquiz": "cityquiz",
    "/personalityquiz": "personalityquiz",
    "/plan": "plan",
  };
  const screen = screenByPath[location.pathname] || "welcome";

  const [city, setCity] = useState(null);
  const [days, setDays] = useState(null);
  const [cityAnswers, setCityAnswers] = useState(null);
  const [personalityAnswers, setPersonalityAnswers] = useState(null);
  const [plan, setPlan] = useState(null);
  const [cityQuizProgress, setCityQuizProgress] = useState({ currentQ: 0, answers: {}, selected: [] });
  const [personalityQuizProgress, setPersonalityQuizProgress] = useState({ currentQ: 0, answers: {}, selected: null });
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [error, setError] = useState(null);

  async function generatePlan(city, days, cityAns, personalityAns) {
    setIsGeneratingPlan(true);
    navigate("/plan");
    setError(null);

    const cityData = CITIES.find(c => c.name === city);
    const country = cityData?.country || "";
    const preferredNeighborhoods = cityAns?.city_neighborhoods ? cityAns.city_neighborhoods.join(", ") : "central area";
    const preferredVibes = cityAns?.city_vibes ? cityAns.city_vibes.join(", ") : "general exploration";

    const prompt = buildPlanPrompt({
      city,
      country,
      days,
      personalityAns,
      preferredNeighborhoods,
      preferredVibes,
    });

    try {
      if (!GEMINI_API_KEY) {
        throw new Error("Missing Gemini API key. Set VITE_GEMINI_API_KEY in your environment.");
      }

      let parsed;
      try {
        parsed = await requestPlanFromModel({
          apiKey: GEMINI_API_KEY,
          model: PRIMARY_MODEL,
          prompt,
        });
      } catch (primaryErr) {
        console.warn(`Primary model failed (${PRIMARY_MODEL}), trying fallback (${FALLBACK_MODEL})`, primaryErr);
        parsed = await requestPlanFromModel({
          apiKey: GEMINI_API_KEY,
          model: FALLBACK_MODEL,
          prompt,
        });
      }

      setPlan(ensureTravelSegments(ensureAtLeastOneSurprise(parsed)));
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message || "Something went wrong generating your plan. Please try again.");
      navigate("/city");
    } finally {
      setIsGeneratingPlan(false);
    }
  }

  function handleRestart() {
    navigate("/city");
    setCity(null);
    setDays(null);
    setCityAnswers(null);
    setPersonalityAnswers(null);
    setPlan(null);
    setCityQuizProgress({ currentQ: 0, answers: {}, selected: [] });
    setPersonalityQuizProgress({ currentQ: 0, answers: {}, selected: null });
    setIsGeneratingPlan(false);
  }

  if (location.pathname === "/loading") return <Navigate to="/personalityquiz" replace />;

  if (screen === "welcome") return <WelcomeScreen onStart={() => navigate("/city")} />;

  if (screen === "city") return (
    <CityPicker
      onSelect={(c) => {
        setCity(c);
        setDays(null);
        setCityAnswers(null);
        setPersonalityAnswers(null);
        setPlan(null);
        setCityQuizProgress({ currentQ: 0, answers: {}, selected: [] });
        setPersonalityQuizProgress({ currentQ: 0, answers: {}, selected: null });
        setIsGeneratingPlan(false);
        navigate("/tripdetails");
      }}
      onBack={() => navigate("/")}
    />
  );

  if (screen === "tripdetails" && !city) return <Navigate to="/city" replace />;
  if (screen === "tripdetails") return (
    <TripDetailsScreen
      city={city}
      onComplete={(d) => { setDays(d); navigate("/cityquiz"); }}
      onBack={() => navigate("/city")}
    />
  );

  if (screen === "cityquiz" && (!city || !days)) return <Navigate to="/tripdetails" replace />;
  if (screen === "cityquiz") return (
    <CityQuizScreen
      city={city}
      questions={CITY_QUESTIONS[city] || []}
      onComplete={(a) => { setCityAnswers(a); navigate("/personalityquiz"); }}
      onBack={() => navigate("/tripdetails")}
      initialProgress={cityQuizProgress}
      onProgressChange={setCityQuizProgress}
    />
  );

  if (screen === "personalityquiz" && (!city || !days || !cityAnswers)) return <Navigate to="/cityquiz" replace />;
  if (screen === "personalityquiz") return (
    <QuizScreen
      questions={PERSONALITY_QUESTIONS}
      stepLabel="STEP 4 OF 4"
      onComplete={(a) => { setPersonalityAnswers(a); generatePlan(city, days, cityAnswers, a); }}
      onBack={() => navigate("/cityquiz")}
      initialProgress={personalityQuizProgress}
      onProgressChange={setPersonalityQuizProgress}
    />
  );

  if (screen === "plan" && isGeneratingPlan) return <LoadingScreen city={city} />;
  if (screen === "plan" && !plan) return <Navigate to="/city" replace />;
  if (screen === "plan" && plan) return (
    <PlanScreen
      city={city}
      days={days}
      plan={plan}
      onRestart={handleRestart}
      whyThisPlan={buildWhyThisPlan(personalityAnswers, cityAnswers, city)}
    />
  );

  return <Navigate to="/" replace />;
}
