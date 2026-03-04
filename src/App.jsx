import { useState, useEffect } from "react";

const CITIES = [
  { name: "San Francisco", country: "USA" },
  { name: "Berlin", country: "Germany" },
  { name: "Buenos Aires", country: "Argentina" },
  { name: "Beirut", country: "Lebanon" },
  { name: "Seoul", country: "South Korea" },
  { name: "Cairo", country: "Egypt" },
];

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const MODEL = import.meta.env.VITE_GEMINI_PRIMARY_MODEL || "gemini-2.5-flash-lite";

function WelcomeScreen({ onStart }) {
  return <button onClick={onStart}>Start</button>;
}

function CityPicker({ onSelect }) {
  return (
    <div>
      {CITIES.map((city) => (
        <button key={city.name} onClick={() => onSelect(city.name)}>{city.name}</button>
      ))}
    </div>
  );
}

function LoadingScreen({ city }) {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 350);
    return () => clearInterval(id);
  }, []);
  return <div>Generating your {city} itinerary{dots}</div>;
}

function PlanScreen({ city, planText, onRestart }) {
  return (
    <div>
      <h2>Plan for {city}</h2>
      <pre style={{ whiteSpace: "pre-wrap" }}>{planText}</pre>
      <button onClick={onRestart}>Try another city</button>
    </div>
  );
}

export default function SerendipityApp() {
  const [screen, setScreen] = useState("welcome");
  const [city, setCity] = useState(null);
  const [planText, setPlanText] = useState("");

  async function generatePlan(selectedCity) {
    setScreen("loading");
    const prompt = `Build a short 1-day plan for ${selectedCity} with 4 activities.`;

    try {
      if (!GEMINI_API_KEY) throw new Error("Missing Gemini API key");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      );

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
      setPlanText(text);
      setScreen("plan");
    } catch (error) {
      setPlanText(`Error: ${error.message}`);
      setScreen("plan");
    }
  }

  if (screen === "welcome") return <WelcomeScreen onStart={() => setScreen("city")} />;
  if (screen === "city") return <CityPicker onSelect={(value) => { setCity(value); generatePlan(value); }} />;
  if (screen === "loading") return <LoadingScreen city={city} />;
  return <PlanScreen city={city} planText={planText} onRestart={() => { setCity(null); setPlanText(""); setScreen("city"); }} />;
}
