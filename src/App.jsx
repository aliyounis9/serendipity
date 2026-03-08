import { useState } from "react";

const CITIES = ["San Francisco", "Berlin", "Buenos Aires", "Beirut", "Seoul", "Cairo"];

const CITY_QUESTIONS = {
  "San Francisco": [
    { id: "city_neighborhoods", question: "Pick SF neighborhoods", options: ["The Mission", "North Beach", "Golden Gate Park"] },
    { id: "city_vibes", question: "What do you want in SF?", options: ["food scene", "counterculture", "nature"] },
  ],
};

const PERSONALITY_QUESTIONS = [
  { id: "energy", question: "Energy style?", options: ["high", "low", "structured", "social"] },
  { id: "food", question: "Food style?", options: ["street", "fine", "spontaneous", "immersive"] },
  { id: "culture", question: "Culture style?", options: ["history", "offbeat", "nature", "creative"] },
  { id: "social", question: "Social style?", options: ["deep", "solo", "group", "learning"] },
  { id: "surprise", question: "Surprise tolerance?", options: ["love", "moderate", "cautious", "full"] },
];

function QuizScreen({ title, questions, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});

  const q = questions[idx];

  function select(value) {
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (idx < questions.length - 1) setIdx(idx + 1);
    else onComplete(next);
  }

  return (
    <div>
      <h2>{title}</h2>
      <h3>{q.question}</h3>
      {q.options.map((opt) => (
        <button key={opt} onClick={() => select(opt)}>{opt}</button>
      ))}
    </div>
  );
}

export default function SerendipityApp() {
  const [screen, setScreen] = useState("city");
  const [city, setCity] = useState(null);
  const [cityAnswers, setCityAnswers] = useState(null);
  const [personalityAnswers, setPersonalityAnswers] = useState(null);

  if (screen === "city") {
    return (
      <div>
        <h2>Pick a city</h2>
        {CITIES.map((name) => (
          <button key={name} onClick={() => { setCity(name); setScreen("cityquiz"); }}>{name}</button>
        ))}
      </div>
    );
  }

  if (screen === "cityquiz") {
    const q = CITY_QUESTIONS[city] || [
      { id: "city_neighborhoods", question: `Pick neighborhoods in ${city}`, options: ["Old Town", "Center", "Creative District"] },
      { id: "city_vibes", question: `What vibe in ${city}?`, options: ["history", "food", "art"] },
    ];

    return <QuizScreen title={`About ${city}`} questions={q} onComplete={(a) => { setCityAnswers(a); setScreen("personality"); }} />;
  }

  if (screen === "personality") {
    return <QuizScreen title="Your travel personality" questions={PERSONALITY_QUESTIONS} onComplete={(a) => { setPersonalityAnswers(a); setScreen("done"); }} />;
  }

  return (
    <pre style={{ whiteSpace: "pre-wrap" }}>
      {JSON.stringify({ city, cityAnswers, personalityAnswers }, null, 2)}
    </pre>
  );
}
