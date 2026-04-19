export async function requestPlanFromModel({ apiKey, model, prompt }) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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

export function buildPlanPrompt({ city, country, days, personalityAns, preferredNeighborhoods, preferredVibes }) {
  return `You are a travel experience designer for the app "Serendipity". Generate a personalized ${days}-day city plan for ${city}, ${country} based on this traveler's profile:

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
- Use realistic, slightly conservative durations (avoid overly optimistic times)
- Keep durations as plain minutes like "12 min" (no ranges)
- Walking guidance: short hops usually 5-20 min in dense city areas
- Transit/taxi guidance: usually 10-25 min for same-neighborhood or nearby-neighborhood transfers

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
}
