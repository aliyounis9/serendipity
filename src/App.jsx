import { useState } from "react";

const SAMPLE_PLAN = [
  {
    theme: "Historic core",
    neighborhood: "City Center",
    activities: [
      { name: "Morning market walk", time: "9:00 AM", emoji: "🛍️", location: "Old Market", description: "Ease into the day with coffee and local stalls.", isSurprise: false },
      { name: "Unexpected courtyard session", time: "12:00 PM", emoji: "✦", location: "Secret courtyard", description: "A low-key local gathering with live storytelling.", isSurprise: true },
      { name: "Sunset viewpoint", time: "6:00 PM", emoji: "🌇", location: "Ridge point", description: "End with a panoramic city view.", isSurprise: false },
    ],
  },
];

function ensureAtLeastOneSurprise(planData) {
  const normalized = planData.map((day) => ({
    ...day,
    activities: day.activities.map((act) => ({ ...act, isSurprise: Boolean(act.isSurprise) })),
  }));

  const hasSurprise = normalized.some((day) => day.activities.some((act) => act.isSurprise));
  if (hasSurprise) return normalized;

  const firstDay = normalized.find((day) => day.activities.length > 0);
  if (!firstDay) return normalized;

  const idx = Math.floor(firstDay.activities.length / 2);
  firstDay.activities[idx] = { ...firstDay.activities[idx], isSurprise: true };
  return normalized;
}

function estimateUsersNearby(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 9973;
  return 3 + (hash % 26);
}

export default function SerendipityApp() {
  const [plan] = useState(ensureAtLeastOneSurprise(SAMPLE_PLAN));
  const [revealed, setRevealed] = useState({});

  return (
    <div style={{ padding: 20 }}>
      <h2>Prototype with surprise fix</h2>
      {plan.map((day, di) => (
        <div key={di} style={{ marginBottom: 20 }}>
          <h3>Day {di + 1}: {day.theme}</h3>
          {day.activities.map((act, ai) => {
            const id = `${di}-${ai}`;
            const isRevealed = Boolean(revealed[id]);
            const isHidden = act.isSurprise && !isRevealed;
            const users = estimateUsersNearby(`${day.theme}-${act.name}`);

            return (
              <div key={id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12, marginBottom: 10 }}>
                <div><strong>{isHidden ? "Unrevealed Serendipity Event" : act.name}</strong> - {act.time}</div>
                <div>{isHidden ? "Tap reveal to unlock this moment." : act.description}</div>
                {act.isSurprise && !isRevealed && (
                  <button onClick={() => setRevealed((prev) => ({ ...prev, [id]: true }))}>Reveal Surprise</button>
                )}
                {act.isSurprise && isRevealed && (
                  <div style={{ marginTop: 8 }}>Around {users} other Serendipity travelers are expected here.</div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
