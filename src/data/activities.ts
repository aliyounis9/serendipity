import type { Activity } from "@/types/activity";

export const ACTIVITIES: Activity[] = [
  {
    id: "saint-frank-coffee",
    title: "Coffee at Saint Frank",
    description: "Grab a specialty coffee at Saint Frank in Russian Hill.",
    activityType: "venue",
    interestTags: ["coffee"],
    relatedInterests: [],
    venue: {
      name: "Saint Frank Russian Hill",
      address: "2340 Polk Street, San Francisco, CA 94109",
      latitude: 37.79849,
      longitude: -122.42205,
    },
    // One specialty drink.
    costUsd: 9,
    sources: [
      "https://www.saintfrankcoffee.com/pages/our-locations",
      "https://www.openstreetmap.org/?mlat=37.79849&mlon=-122.42205#map=19/37.79849/-122.42205",
    ],
  },
  {
    id: "cable-car-museum",
    title: "Cable Car Museum",
    description:
      "Explore San Francisco's cable car history and see the machinery that powers the system.",
    activityType: "venue",
    interestTags: ["history", "science"],
    relatedInterests: [],
    venue: {
      name: "Cable Car Museum",
      address: "1201 Mason Street, San Francisco, CA 94108",
      latitude: 37.79476,
      longitude: -122.41185,
    },
    costUsd: 0,
    sources: [
      "https://www.cablecarmuseum.org/info.html",
      "https://www.cablecarmuseum.org/museum.html",
      "https://www.openstreetmap.org/?mlat=37.79476&mlon=-122.41185#map=19/37.79476/-122.41185",
    ],
  },
  {
    id: "crissy-field-photo-walk",
    title: "Waterfront photography walk at Crissy Field",
    description:
      "Walk along the waterfront and take photos of the Golden Gate Bridge and San Francisco Bay.",
    activityType: "informal",
    interestTags: ["nature", "art"],
    relatedInterests: [],
    venue: {
      name: "Crissy Field East Beach",
      address:
        "Crissy Field East Beach, by the parking lot off Mason Street, San Francisco, CA 94129",
      latitude: 37.80576,
      longitude: -122.4491,
    },
    costUsd: 0,
    sources: [
      "https://www.nps.gov/thingstodo/crissy-field-restored-wetlands.htm",
      "https://presidio.gov/explore/attractions/crissy-field-east-beach",
      "https://www.openstreetmap.org/?mlat=37.80576&mlon=-122.44910#map=18/37.80576/-122.44910",
    ],
  },
  {
    id: "musee-mecanique-arcade",
    title: "Vintage arcade games at Musée Mécanique",
    description:
      "Play vintage arcade games and explore antique mechanical machines at Pier 45.",
    activityType: "venue",
    interestTags: ["games"],
    // history: the venue is a collection of historic coin-operated machines.
    relatedInterests: ["history"],
    venue: {
      name: "Musée Mécanique",
      address: "Pier 45 at the end of Taylor Street, San Francisco, CA 94133",
      latitude: 37.80925,
      longitude: -122.41579,
    },
    // Free admission; budget for playing a variety of coin-operated games.
    costUsd: 15,
    sources: [
      "https://museemecanique.com/visit",
      "https://www.openstreetmap.org/?mlat=37.80925&mlon=-122.41579#map=19/37.80925/-122.41579",
    ],
  },
  {
    id: "benchmark-bouldering",
    title: "Beginner bouldering at Benchmark Climbing",
    description: "Try indoor bouldering at Benchmark Climbing on Van Ness Avenue.",
    activityType: "venue",
    interestTags: ["sports"],
    relatedInterests: [],
    venue: {
      name: "Benchmark Climbing",
      address: "1414 Van Ness Avenue, San Francisco, CA 94109",
      latitude: 37.78889,
      longitude: -122.42177,
    },
    // $30 day pass + $5 shoe and chalk rental.
    costUsd: 35,
    sources: [
      "https://www.benchmarkclimbing.com/new-memberships-1",
      "https://www.openstreetmap.org/?mlat=37.78889&mlon=-122.42177#map=19/37.78889/-122.42177",
    ],
  },
];
