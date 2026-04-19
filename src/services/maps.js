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

function getCityMeta(cities, city) {
  return (cities || []).find((c) => c.name === city) || null;
}

export function buildStaticMapUrl(activities, city, cities, mapsApiKey) {
  const baseUrl = "https://maps.googleapis.com/maps/api/staticmap";
  const cityMeta = getCityMeta(cities, city);
  const country = cityMeta?.country || "";
  const region = COUNTRY_REGION_CODES[country] || "";
  const points = getMapPoints(activities, city, country);

  const params = new URLSearchParams({
    size: "640x320",
    scale: "2",
    maptype: "roadmap",
    style: "feature:all|element:geometry|color:0x1a1a2e",
    key: mapsApiKey || "",
  });

  if (region) {
    params.set("region", region);
  }

  const styles = [
    "feature:all|element:labels.text.fill|color:0xffffff",
    "feature:all|element:labels.text.stroke|color:0x000000|weight:2",
    "feature:water|element:geometry|color:0x0e1626",
    "feature:road|element:geometry|color:0x2a2a4a",
    "feature:poi|element:geometry|color:0x1f1f3a",
  ];
  styles.forEach((s) => params.append("style", s));

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

export function buildExternalMapsUrl(activities, city, cities) {
  const cityMeta = getCityMeta(cities, city);
  const country = cityMeta?.country || "";
  const points = getMapPoints(activities, city, country);

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
