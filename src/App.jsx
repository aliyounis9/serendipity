import { useState } from "react";

const CITIES = [
  { name: "San Francisco", country: "USA" },
  { name: "Berlin", country: "Germany" },
  { name: "Buenos Aires", country: "Argentina" },
  { name: "Beirut", country: "Lebanon" },
  { name: "Seoul", country: "South Korea" },
  { name: "Cairo", country: "Egypt" },
];

const CITY_QUESTIONS = {
  "San Francisco": [
    { id: "city_neighborhoods", question: "Neighborhoods?", options: ["The Mission", "North Beach", "Golden Gate Park"] },
    { id: "city_vibes", question: "What vibe?", options: ["food", "counterculture", "nature"] },
  ],
};

const PERSONALITY_QUESTIONS = [
  { id: "energy", question: "Energy", options: ["high", "low", "structured", "social"] },
  { id: "food", question: "Food", options: ["street", "fine", "spontaneous", "immersive"] },
  { id: "culture", question: "Culture", options: ["history", "offbeat", "nature", "creative"] },
  { id: "social", question: "Social", options: ["deep", "solo", "group", "learning"] },
  { id: "surprise", question: "Surprise", options: ["love", "moderate", "cautious", "full"] },
];

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const MODEL = import.meta.env.VITE_GEMINI_PRIMARY_MODEL || "gemini-2.5-flash-lite";

function OptionQuiz({ title, questions, onComplete }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const current = questions[index];

  function pick(value) {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    if (index < questions.length - 1) setIndex(index + 1);
    else onComplete(next);
  }

  return (
    <div>
      <h2>{title}</h2>
      <h3>{current.question}</h3>
      {current.options.map((opt) => (
        <button key={opt} onClick={() => pick(opt)}>{opt}</button>
      ))}
    </div>
  );
}

function PlanScreen({ plan, onRestart }) {
  return (
    <div>
      <h2>Your first prototype plan</h2>
      <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(plan, null, 2)}</pre>
      <button onClick={onRestart}>Restart</button>
    </div>
  );
}

export default function SerendipityApp() {
  const [screen, setScreen] = useState("city");
  const [city, setCity] = useState(null);
  const [days, setDays] = useState(null);
  const [cityAnswers, setCityAnswers] = useState(null);
  const [personalityAnswers, setPersonalityAnswers] = useState(null);
  const [plan, setPlan] = useState(null);

  async function generatePlan(selectedCity, selectedDays, selectedCityAnswers, selectedPersonalityAnswers) {
    setScreen("loading");

    const country = CITIES.find((c) => c.name === selectedCity)?.country || "";
    const prompt = `Create a ${selectedDays}-day JSON itinerary for ${selectedCity}, ${country}.` +
      ` Personality: ${JSON.stringify(selectedPersonalityAnswers)}.` +
      ` City preferences: ${JSON.stringify(selectedCityAnswers)}.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      setPlan(JSON.parse(text));
      setScreen("plan");
    } catch {
      setPlan([{ error: "Failed to generate plan" }]);
      setScreen("plan");
    }
  }

  if (screen === "city") {
    return (
      <div>
        <h2>Choose city</h2>
        {CITIES.map((c) => (
          <button key={c.name} onClick={() => { setCity(c.name); setScreen("days"); }}>{c.name}</button>
        ))}
      </div>
    );
  }

  if (screen === "days") {
    return (
      <div>
        <h2>How many days?</h2>
        {[2, 3, 5].map((d) => (
          <button key={d} onClick={() => { setDays(d); setScreen("cityquiz"); }}>{d}</button>
        ))}
      </div>
    );
  }

  if (screen === "cityquiz") {
    const qs = CITY_QUESTIONS[city] || [
      { id: "city_neighborhoods", question: "Neighborhoods", options: ["Center", "Old Town", "Arts District"] },
      { id: "city_vibes", question: "Vibe", options: ["history", "food", "art"] },
    ];

    return <OptionQuiz title={`About ${city}`} questions={qs} onComplete={(a) => { setCityAnswers(a); setScreen("personality"); }} />;
  }

  if (screen === "personality") {
    return (
      <OptionQuiz
        title="Your travel style"
        questions={PERSONALITY_QUESTIONS}
        onComplete={(a) => {
          setPersonalityAnswers(a);
          generatePlan(city, days, cityAnswers, a);
        }}
      />
    );
  }

  if (screen === "loading") return <div>Generating plan...</div>;

  return (
    <PlanScreen
      plan={plan}
      onRestart={() => {
        setScreen("city");
        setCity(null);
        setDays(null);
        setCityAnswers(null);
        setPersonalityAnswers(null);
        setPlan(null);
      }}
    />
  );
}
