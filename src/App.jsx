import { useState } from "react";

const CITIES = [
  { name: "San Francisco", country: "USA" },
  { name: "Berlin", country: "Germany" },
  { name: "Buenos Aires", country: "Argentina" },
  { name: "Beirut", country: "Lebanon" },
  { name: "Seoul", country: "South Korea" },
  { name: "Cairo", country: "Egypt" },
];

function WelcomeScreen({ onStart }) {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0d1117", color: "#e6edf3" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ marginBottom: 8 }}>Serendipity</h1>
        <p style={{ opacity: 0.8, marginBottom: 20 }}>Discover cities through your own lens.</p>
        <button onClick={onStart}>Start</button>
      </div>
    </div>
  );
}

function CityPicker({ onSelect }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", padding: 24 }}>
      <h2 style={{ textAlign: "center" }}>Pick a city</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12, maxWidth: 900, margin: "20px auto" }}>
        {CITIES.map((city) => (
          <button key={city.name} onClick={() => onSelect(city.name)} style={{ textAlign: "left", padding: 16 }}>
            <strong>{city.name}</strong>
            <div style={{ opacity: 0.7 }}>{city.country}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SerendipityApp() {
  const [screen, setScreen] = useState("welcome");
  const [city, setCity] = useState(null);

  if (screen === "welcome") {
    return <WelcomeScreen onStart={() => setScreen("city")} />;
  }

  if (screen === "city") {
    return (
      <CityPicker
        onSelect={(selectedCity) => {
          setCity(selectedCity);
          setScreen("done");
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0d1117", color: "#e6edf3", display: "grid", placeItems: "center" }}>
      <div>You selected {city}.</div>
    </div>
  );
}
