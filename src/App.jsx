import { useState, useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

const CITIES = [
  { name: "San Francisco", country: "USA", flag: "🇺🇸", emoji: "🌉", desc: "Tech, fog & Pacific coastline" },
  { name: "Berlin", country: "Germany", flag: "🇩🇪", emoji: "🎶", desc: "History, art & underground culture" },
  { name: "Buenos Aires", country: "Argentina", flag: "🇦🇷", emoji: "💃", desc: "Tango, steak & street art" },
  { name: "Beirut", country: "Lebanon", flag: "🇱🇧", emoji: "🌇", desc: "Resilience, food & Mediterranean soul" },
  { name: "Seoul", country: "South Korea", flag: "🇰🇷", emoji: "🏯", desc: "K-culture, street food & neon nights" },
  { name: "Cairo", country: "Egypt", flag: "🇪🇬", emoji: "🔺", desc: "Ancient wonders & vibrant chaos" },
  { name: "Amman", country: "Jordan", flag: "🇯🇴", emoji: "🏺", desc: "Hills, heritage & warm hospitality" },
  { name: "Marrakech", country: "Morocco", flag: "🇲🇦", emoji: "🕌", desc: "Souks, riads & desert magic" },
];

const CITY_QUESTIONS = {
  "San Francisco": [
    {
      id: "city_neighborhoods",
      question: "Which San Francisco areas interest you? (pick all that apply)",
      multi: true,
      options: [
        { label: "The Mission — murals, taquerias & local culture", value: "The Mission", icon: "🎨" },
        { label: "Haight-Ashbury — counterculture & vintage shops", value: "Haight-Ashbury", icon: "✌️" },
        { label: "North Beach — Italian cafés & Beat Generation history", value: "North Beach", icon: "📚" },
        { label: "Golden Gate Park — nature, museums & gardens", value: "Golden Gate Park", icon: "🌿" },
      ],
    },
    {
      id: "city_vibes",
      question: "What are you hoping to experience in SF? (pick all that apply)",
      multi: true,
      options: [
        { label: "Tech culture & startup energy", value: "tech culture", icon: "💻" },
        { label: "Ocean views & coastal hikes", value: "ocean and nature", icon: "🌊" },
        { label: "World-class food scene", value: "food scene", icon: "🍜" },
        { label: "Art, music & counterculture", value: "art and counterculture", icon: "🎸" },
      ],
    },
  ],
  "Berlin": [
    {
      id: "city_neighborhoods",
      question: "Which Berlin neighborhoods call to you? (pick all that apply)",
      multi: true,
      options: [
        { label: "Kreuzberg — multicultural, edgy & artistic", value: "Kreuzberg", icon: "🎨" },
        { label: "Mitte — museums, galleries & historic core", value: "Mitte", icon: "🏛️" },
        { label: "Friedrichshain — street art, nightlife & East Side Gallery", value: "Friedrichshain", icon: "🎶" },
        { label: "Prenzlauer Berg — cozy cafés & boutique streets", value: "Prenzlauer Berg", icon: "☕" },
      ],
    },
    {
      id: "city_vibes",
      question: "What draws you to Berlin? (pick all that apply)",
      multi: true,
      options: [
        { label: "Cold War history & the Wall", value: "history", icon: "🚧" },
        { label: "Underground club & music scene", value: "nightlife and music", icon: "🎧" },
        { label: "Street food & beer gardens", value: "food and beer", icon: "🍺" },
        { label: "Contemporary art & galleries", value: "art and galleries", icon: "🖼️" },
      ],
    },
  ],
  "Buenos Aires": [
    {
      id: "city_neighborhoods",
      question: "Which Buenos Aires neighborhoods interest you? (pick all that apply)",
      multi: true,
      options: [
        { label: "San Telmo — antique markets & cobblestone streets", value: "San Telmo", icon: "🗝️" },
        { label: "Palermo Soho — boutiques, street art & craft cocktails", value: "Palermo Soho", icon: "🍸" },
        { label: "La Boca — colorful houses & tango in the streets", value: "La Boca", icon: "🎨" },
        { label: "Recoleta — grand architecture & the famous cemetery", value: "Recoleta", icon: "🏛️" },
      ],
    },
    {
      id: "city_vibes",
      question: "What excites you about Buenos Aires? (pick all that apply)",
      multi: true,
      options: [
        { label: "Tango & live music", value: "tango and music", icon: "💃" },
        { label: "Steak, wine & food culture", value: "food and wine", icon: "🥩" },
        { label: "Street art & creative scene", value: "street art", icon: "🎨" },
        { label: "Football passion & local culture", value: "football and local culture", icon: "⚽" },
      ],
    },
  ],
  "Beirut": [
    {
      id: "city_neighborhoods",
      question: "Which Beirut areas would you want to explore? (pick all that apply)",
      multi: true,
      options: [
        { label: "Gemmayzeh — street art, bars & creative energy", value: "Gemmayzeh", icon: "🎨" },
        { label: "Hamra — bookshops, cafés & university vibes", value: "Hamra", icon: "📚" },
        { label: "Mar Mikhael — rooftop bars & galleries", value: "Mar Mikhael", icon: "🌃" },
        { label: "Downtown — Ottoman & French architecture, rebuilt heritage", value: "Downtown Beirut", icon: "🏛️" },
      ],
    },
    {
      id: "city_vibes",
      question: "What draws you to Beirut? (pick all that apply)",
      multi: true,
      options: [
        { label: "Legendary food — mezze, manoushe, street eats", value: "food culture", icon: "🧆" },
        { label: "Nightlife & rooftop bar scene", value: "nightlife", icon: "🌙" },
        { label: "Ancient history — Byblos, Baalbek day trips", value: "ancient history", icon: "🏛️" },
        { label: "Resilience, art & creative spirit", value: "art and resilience", icon: "✊" },
      ],
    },
  ],
  "Seoul": [
    {
      id: "city_neighborhoods",
      question: "Which Seoul neighborhoods excite you? (pick all that apply)",
      multi: true,
      options: [
        { label: "Hongdae — indie music, street performers & youth culture", value: "Hongdae", icon: "🎸" },
        { label: "Bukchon Hanok Village — traditional houses & tea rooms", value: "Bukchon", icon: "🏡" },
        { label: "Gangnam — sleek shopping, K-beauty & modern Seoul", value: "Gangnam", icon: "💎" },
        { label: "Ikseon-dong — tiny alleys, vintage cafés & hanok bars", value: "Ikseon-dong", icon: "☕" },
      ],
    },
    {
      id: "city_vibes",
      question: "What are you most excited about in Seoul? (pick all that apply)",
      multi: true,
      options: [
        { label: "K-food — BBQ, street food, pojangmacha tents", value: "korean food", icon: "🍖" },
        { label: "K-pop, K-drama & pop culture", value: "pop culture", icon: "🎤" },
        { label: "Temples, palaces & traditional culture", value: "traditional culture", icon: "🏯" },
        { label: "Skincare, shopping & modern lifestyle", value: "shopping and lifestyle", icon: "🛍️" },
      ],
    },
  ],
  "Cairo": [
    {
      id: "city_neighborhoods",
      question: "Which Cairo areas interest you? (pick all that apply)",
      multi: true,
      options: [
        { label: "Islamic Cairo — mosques, narrow alleys & history", value: "Islamic Cairo", icon: "🕌" },
        { label: "Zamalek — Nile island with art galleries & cafés", value: "Zamalek", icon: "🎨" },
        { label: "Downtown — faded grandeur, bookshops & street life", value: "Downtown Cairo", icon: "📖" },
        { label: "Giza — pyramids, Sphinx & ancient wonders", value: "Giza", icon: "🔺" },
      ],
    },
    {
      id: "city_vibes",
      question: "What excites you most about Cairo? (pick all that apply)",
      multi: true,
      options: [
        { label: "Ancient Egyptian history & archaeology", value: "ancient history", icon: "🏛️" },
        { label: "Street food — koshari, ful, ta'ameya", value: "street food", icon: "🧆" },
        { label: "Bazaars, souks & local markets", value: "markets and bazaars", icon: "🏪" },
        { label: "Nile cruises & city views", value: "nile and views", icon: "🌅" },
      ],
    },
  ],
  "Amman": [
    {
      id: "city_neighborhoods",
      question: "Which Amman areas interest you? (pick all that apply)",
      multi: true,
      options: [
        { label: "Jabal Amman & Rainbow Street — cafes, galleries, old villas", value: "Jabal Amman", icon: "☕" },
        { label: "Downtown (Al-Balad) — souks, Roman heritage, street food", value: "Downtown Amman", icon: "🛍️" },
        { label: "Jabal Al-Weibdeh — artsy streets and creative spaces", value: "Al-Weibdeh", icon: "🎨" },
        { label: "Abdali & Boulevard — modern city vibes and rooftop spots", value: "Abdali", icon: "🌆" },
      ],
    },
    {
      id: "city_vibes",
      question: "What draws you to Amman? (pick all that apply)",
      multi: true,
      options: [
        { label: "Historic sites — Citadel, Roman Theater, ancient layers", value: "history", icon: "🏛️" },
        { label: "Jordanian food — falafel, mansaf, local bakeries", value: "food culture", icon: "🥙" },
        { label: "Cafe culture and conversation-heavy evenings", value: "cafe culture", icon: "🫖" },
        { label: "Design, crafts, and independent art scene", value: "art and design", icon: "🧵" },
      ],
    },
  ],
  "Marrakech": [
    {
      id: "city_neighborhoods",
      question: "Which Marrakech areas excite you? (pick all that apply)",
      multi: true,
      options: [
        { label: "Medina — labyrinth alleys, souks, hidden courtyards", value: "Medina", icon: "🧭" },
        { label: "Gueliz — modern cafes, boutiques, and art galleries", value: "Gueliz", icon: "🖼️" },
        { label: "Hivernage — gardens, elegant hotels, nightlife", value: "Hivernage", icon: "🌴" },
        { label: "Kasbah — historic walls, palaces, and calm corners", value: "Kasbah", icon: "🏰" },
      ],
    },
    {
      id: "city_vibes",
      question: "What do you want most from Marrakech? (pick all that apply)",
      multi: true,
      options: [
        { label: "Souk adventure and handcrafted treasures", value: "markets and crafts", icon: "🧺" },
        { label: "Riads, hammams, and slow-luxury moments", value: "relaxation and riads", icon: "🛁" },
        { label: "Moroccan cuisine — tagines, tea, rooftop dining", value: "food culture", icon: "🍲" },
        { label: "Architecture, gardens, and photo-worthy design", value: "architecture and gardens", icon: "📸" },
      ],
    },
  ],
};

const PERSONALITY_QUESTIONS = [
  {
    id: "energy",
    question: "It's your first morning in a new city. What do you do?",
    options: [
      { label: "Hit the streets at dawn — I want to see everything", value: "high", icon: "⚡" },
      { label: "Slow coffee, then wander with no agenda", value: "low", icon: "☕" },
      { label: "Research the top spots, then power through my list", value: "structured", icon: "📋" },
      { label: "Ask a local where they'd go — I trust vibes", value: "social", icon: "🗣️" },
    ],
  },
  {
    id: "food",
    question: "How do you find the best food when traveling?",
    options: [
      { label: "Street food and market stalls — the messier the better", value: "street", icon: "🍜" },
      { label: "I book reservations at the best restaurants weeks ahead", value: "fine", icon: "🍷" },
      { label: "I follow my nose and pick places that look busy", value: "spontaneous", icon: "👃" },
      { label: "Cooking classes or eating with locals", value: "immersive", icon: "🫕" },
    ],
  },
  {
    id: "culture",
    question: "You have a free afternoon. Where do you end up?",
    options: [
      { label: "A museum or historical landmark", value: "history", icon: "🏛️" },
      { label: "A neighborhood locals love that tourists skip", value: "offbeat", icon: "🗺️" },
      { label: "A park, garden, or natural spot to recharge", value: "nature", icon: "🌿" },
      { label: "A workshop, gallery, or creative space", value: "creative", icon: "🎨" },
    ],
  },
  {
    id: "social",
    question: "Your ideal travel memory involves...",
    options: [
      { label: "A deep conversation with someone I just met", value: "deep", icon: "💬" },
      { label: "Getting lost and discovering something magical alone", value: "solo", icon: "✨" },
      { label: "A group adventure — the more the merrier", value: "group", icon: "🎉" },
      { label: "Learning a skill from someone passionate about it", value: "learning", icon: "🎓" },
    ],
  },
  {
    id: "surprise",
    question: "How do you feel about surprises while traveling?",
    options: [
      { label: "Love them — detours are the best part", value: "love", icon: "🎲" },
      { label: "Small surprises yes, but I like a rough plan", value: "moderate", icon: "🗓️" },
      { label: "I'd try a surprise activity if someone vouched for it", value: "cautious", icon: "🤝" },
      { label: "Surprise me completely — I trust the universe", value: "full", icon: "🌌" },
    ],
  },
];

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

const COUNTRY_REGION_CODES = {
  USA: "us",
  Germany: "de",
  Argentina: "ar",
  Lebanon: "lb",
  "South Korea": "kr",
  Egypt: "eg",
  Jordan: "jo",
  Morocco: "ma",
};

function normalizeAddress(rawAddress, city, country) {
  if (!rawAddress || typeof rawAddress !== "string") return "";

  const trimmed = rawAddress.trim().replace(/\s+/g, " ");
  const lower = trimmed.toLowerCase();
  const cityLower = city.toLowerCase();
  const countryLower = country.toLowerCase();

  if (lower.includes(cityLower) && lower.includes(countryLower)) {
    return trimmed;
  }

  if (lower.includes(cityLower)) {
    return `${trimmed}, ${country}`;
  }

  return `${trimmed}, ${city}, ${country}`;
}

function getMapPoints(activities, city, country) {
  const points = [];

  (activities || []).forEach((act) => {
    const bestRaw = act?.address || act?.location || "";
    const normalized = normalizeAddress(bestRaw, city, country);
    if (normalized) points.push(normalized);
  });

  return Array.from(new Set(points)).slice(0, 8);
}

function buildStaticMapUrl(activities, city) {
  const baseUrl = "https://maps.googleapis.com/maps/api/staticmap";
  const cityMeta = CITIES.find((c) => c.name === city);
  const country = cityMeta?.country || "";
  const region = COUNTRY_REGION_CODES[country] || "";
  const points = getMapPoints(activities, city, country);

  const params = new URLSearchParams({
    size: "640x320",
    scale: "2",
    maptype: "roadmap",
    style: "feature:all|element:geometry|color:0x1a1a2e",
    key: MAPS_API_KEY,
  });

  if (region) {
    params.set("region", region);
  }
  
  // Add custom map styling for dark theme
  const styles = [
    "feature:all|element:labels.text.fill|color:0xffffff",
    "feature:all|element:labels.text.stroke|color:0x000000|weight:2",
    "feature:water|element:geometry|color:0x0e1626",
    "feature:road|element:geometry|color:0x2a2a4a",
    "feature:poi|element:geometry|color:0x1f1f3a",
  ];
  styles.forEach(s => params.append("style", s));

  // For multi-stop days, let Google fit all points. For single-stop/no-stop, use stable fallback framing.
  if (points.length > 1) {
    params.set("visible", points.join("|"));
  } else if (points.length === 1) {
    params.set("center", points[0]);
    params.set("zoom", "14");
  } else {
    params.set("center", country ? `${city}, ${country}` : city);
    params.set("zoom", "12");
  }

  points.forEach((point, i) => {
    const marker = `color:0xF97316|label:${Math.min(i + 1, 9)}|${point}`;
    params.append("markers", marker);
  });
  
  return `${baseUrl}?${params.toString()}`;
}

function buildExternalMapsUrl(activities, city) {
  const cityMeta = CITIES.find((c) => c.name === city);
  const country = cityMeta?.country || "";
  const points = getMapPoints(activities, city, country);

  // Use an interactive directions map when we have multiple stops.
  if (points.length >= 2) {
    const origin = points[0];
    const destination = points[points.length - 1];
    const waypoints = points.slice(1, -1).join("|");
    const params = new URLSearchParams({
      api: "1",
      origin,
      destination,
      travelmode: "walking",
    });
    if (waypoints) {
      params.set("waypoints", waypoints);
    }
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  const query = points[0] || (country ? `${city}, ${country}` : city);
  return `https://www.google.com/maps/search/?${new URLSearchParams({ api: "1", query }).toString()}`;
}

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
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
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
                  src={buildStaticMapUrl(day.activities, city)}
                  alt={`Map for Day ${di + 1}`}
                  style={{ width: "100%", height: printMode ? 180 : 220, objectFit: "cover", display: "block" }}
                  onError={() => setMapErrors(prev => ({ ...prev, [di]: true }))}
                />
              </div>
            )}
            {!printMode && (
              <div style={{ marginBottom: "0.75rem" }}>
                <a
                  href={buildExternalMapsUrl(day.activities, city)}
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
                        {act.travelToNext.duration} {act.travelToNext.mode === "walk" ? "walk" : `by ${act.travelToNext.mode}`}
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

  async function requestPlanFromModel(model, prompt) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      const apiMessage = data?.error?.message || `Request failed with status ${response.status}`;
      throw new Error(apiMessage);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      throw new Error("Model returned an unexpected format.");
    }

    return parsed;
  }

  async function generatePlan(city, days, cityAns, personalityAns) {
    setIsGeneratingPlan(true);
    navigate("/plan");
    setError(null);

    const cityData = CITIES.find(c => c.name === city);
    const country = cityData?.country || "";
    const preferredNeighborhoods = cityAns?.city_neighborhoods ? cityAns.city_neighborhoods.join(", ") : "central area";
    const preferredVibes = cityAns?.city_vibes ? cityAns.city_vibes.join(", ") : "general exploration";

    const prompt = `You are a travel experience designer for the app "Serendipity". Generate a personalized ${days}-day city plan for ${city}, ${country} based on this traveler's profile:

PERSONALITY:
- Energy style: ${personalityAns.energy}
- Food preference: ${personalityAns.food}
- Culture preference: ${personalityAns.culture}
- Social style: ${personalityAns.social}
- Surprise tolerance: ${personalityAns.surprise}

CITY PREFERENCES:
- Neighborhoods they want to explore: ${preferredNeighborhoods}
- What excites them about ${city}: ${preferredVibes}
- Trip duration: ${days} days

Return ONLY valid JSON (no markdown, no backticks) in this exact format:
[
  {
    "theme": "Day theme title",
    "neighborhood": "Main area/neighborhood for this day",
    "activities": [
      {
        "name": "Activity name",
        "time": "9:00 AM",
        "emoji": "🏛️",
        "location": "Specific neighborhood or street",
        "address": "Full Google Maps address ending with ', ${city}, ${country}'",
        "description": "1-2 natural sentences with concrete local detail and why it fits this person.",
        "isSurprise": false,
        "travelToNext": {
          "mode": "walk",
          "duration": "12 min",
          "note": "Pleasant stroll through the old town"
        }
      }
    ]
  }
]

For the address field:
- CRITICAL: Every address MUST end with ", ${city}, ${country}" — this is required for map accuracy
- Format: "Famous Place Name, ${city}, ${country}" — keep it simple, use the well-known name
- Use ONLY famous, well-known, Google-verified landmarks and venues that definitely exist
- Do NOT invent or guess addresses — only use places you are certain exist in ${city}
- Examples: "Eiffel Tower, Paris, France" or "Central Park, New York, USA" or "Café de Flore, Paris, France"
- For ${city}: use only real, famous spots like major landmarks, popular restaurants, known museums, famous streets

For travelToNext:
- mode can be: "walk", "metro", "taxi", "bus", or "tram"
- Include for all activities EXCEPT the last activity of each day
- IMPORTANT: If travel time exceeds 20 minutes, reconsider — activities should be CLOSE together
- Prefer "walk" mode (5-15 min walks between activities)
- Add a brief note about the route when interesting (optional)

STRICT GEOGRAPHIC RULES:
- ALL activities MUST be within the urban core of ${city} — no suburbs, outskirts, or day trips
- Each day: ALL activities must be walkable from each other (within ~2km radius)
- Plan each day around ONE specific neighborhood — do not jump across the city
- Maximum travel between any two consecutive activities: 20 minutes
- If you cannot keep activities close, choose different activities that ARE close

Rules:
- Generate exactly ${days} days
- Each day should have 4-5 activities
- Group activities by neighborhood — each day focuses on ONE area
- Include exactly ONE surprise activity across all days (isSurprise: true) — give it a mysterious but intriguing name and description that hints but doesn't reveal
- Activities should reflect their personality AND city preferences
- Feature the traveler's preferred neighborhoods: ${preferredNeighborhoods}
- Use ONLY real, verifiable, famous places in ${city} — no made-up venues
- Times should flow naturally through the day (morning to evening)
- Make it feel personal, not like a generic tourist guide

VOICE + WRITING STYLE (VERY IMPORTANT):
- Write like a thoughtful local friend, not a travel brochure and not an AI assistant.
- Avoid generic phrases like "vibrant", "immersive", "nestled", "iconic experience", "rich tapestry", "must-visit", "hidden gem".
- Avoid repetitive sentence structure across activities.
- Use specific details people can picture: one dish, one street, one view, one sensory cue.
- Keep tone warm and direct, with simple natural English.
- "location" should be short and real (street/area name), not a vague tagline.
- "description" should sound human: specific, grounded, and a bit conversational.

Good description example:
"Start at Hashem for a quick falafel breakfast, then walk five minutes to the Roman Theater before the crowds build. It fits your high-energy style and keeps the morning compact."

Bad description example:
"Experience a vibrant and immersive journey through the city's iconic cultural tapestry."`;

    try {
      if (!GEMINI_API_KEY) {
        throw new Error("Missing Gemini API key. Set VITE_GEMINI_API_KEY in your environment.");
      }

      let parsed;
      try {
        parsed = await requestPlanFromModel(PRIMARY_MODEL, prompt);
      } catch (primaryErr) {
        console.warn(`Primary model failed (${PRIMARY_MODEL}), trying fallback (${FALLBACK_MODEL})`, primaryErr);
        parsed = await requestPlanFromModel(FALLBACK_MODEL, prompt);
      }

      setPlan(ensureAtLeastOneSurprise(parsed));
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
