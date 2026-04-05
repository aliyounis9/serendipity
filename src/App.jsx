import { useState } from "react";

const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY || "";

function buildStaticMapUrl(activities) {
  const baseUrl = "https://maps.googleapis.com/maps/api/staticmap";
  const params = new URLSearchParams({
    size: "640x180",
    scale: "2",
    maptype: "roadmap",
    key: MAPS_API_KEY,
  });

  activities.forEach((act, index) => {
    if (!act.address) return;
    params.append("markers", `color:0xF97316|label:${index + 1}|${encodeURIComponent(act.address)}`);
  });

  return `${baseUrl}?${params.toString()}`;
}

const PLAN = [
  {
    theme: "Old district walk",
    activities: [
      { name: "Market breakfast", address: "Jemaa el-Fnaa, Marrakech, Morocco", description: "Start with tea and msemen." },
      { name: "Garden stop", address: "Le Jardin Secret, Marrakech, Morocco", description: "Cool shade and geometric courtyards." },
      { name: "Rooftop sunset", address: "El Fenn Rooftop, Marrakech, Morocco", description: "Golden-hour city views." },
    ],
  },
];

export default function SerendipityApp() {
  const [mapErrors, setMapErrors] = useState({});

  return (
    <div style={{ padding: 20 }}>
      <h2>Prototype with map rendering</h2>
      {PLAN.map((day, index) => (
        <div key={index} style={{ marginBottom: 18 }}>
          <h3>{day.theme}</h3>
          {!mapErrors[index] && (
            <img
              src={buildStaticMapUrl(day.activities)}
              alt={`Map for day ${index + 1}`}
              style={{ width: "100%", maxWidth: 640, borderRadius: 10, border: "1px solid #ddd" }}
              onError={() => setMapErrors((prev) => ({ ...prev, [index]: true }))}
            />
          )}
          {mapErrors[index] && <div>Map unavailable for this day.</div>}
          {day.activities.map((act) => (
            <div key={act.name} style={{ marginTop: 10 }}>
              <strong>{act.name}</strong>
              <div>{act.description}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
