import { useState } from "react";

const CITIES = [
  { name: "San Francisco", country: "USA" },
  { name: "Berlin", country: "Germany" },
  { name: "Buenos Aires", country: "Argentina" },
  { name: "Beirut", country: "Lebanon" },
  { name: "Seoul", country: "South Korea" },
  { name: "Cairo", country: "Egypt" },
  { name: "Amman", country: "Jordan" },
  { name: "Marrakech", country: "Morocco" },
];

const CITY_QUESTIONS = {
  Amman: [
    {
      id: "city_neighborhoods",
      question: "Which Amman areas interest you?",
      options: ["Jabal Amman", "Downtown Amman", "Al-Weibdeh", "Abdali"],
    },
    {
      id: "city_vibes",
      question: "What draws you to Amman?",
      options: ["history", "food culture", "cafe culture", "art and design"],
    },
  ],
  Marrakech: [
    {
      id: "city_neighborhoods",
      question: "Which Marrakech areas excite you?",
      options: ["Medina", "Gueliz", "Hivernage", "Kasbah"],
    },
    {
      id: "city_vibes",
      question: "What do you want most from Marrakech?",
      options: ["markets and crafts", "relaxation and riads", "food culture", "architecture and gardens"],
    },
  ],
};

function CityQuizPreview({ city }) {
  const questions = CITY_QUESTIONS[city];
  if (!questions) return <div>No city-specific quiz yet for {city}.</div>;

  return (
    <div>
      <h3>{city} question set</h3>
      {questions.map((q) => (
        <div key={q.id} style={{ marginBottom: 12 }}>
          <strong>{q.question}</strong>
          <ul>
            {q.options.map((opt) => <li key={opt}>{opt}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default function SerendipityApp() {
  const [city, setCity] = useState("Amman");

  return (
    <div style={{ padding: 20 }}>
      <h2>City expansion snapshot (Amman + Marrakech)</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {CITIES.map((c) => (
          <button key={c.name} onClick={() => setCity(c.name)}>
            {c.name}
          </button>
        ))}
      </div>
      <CityQuizPreview city={city} />
    </div>
  );
}
