import type { Activity } from "@/types/activity";

export const ACTIVITIES: Activity[] = [
  {
    id: "saint-frank-coffee",
    title: "Coffee at Saint Frank",
    description: "Meet up for a specialty coffee at Saint Frank in Russian Hill.",
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
      "Explore San Francisco's cable car history together and watch the machinery that powers the system.",
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
      "Walk the waterfront together and take photos of the Golden Gate Bridge and San Francisco Bay.",
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
      "Challenge each other on vintage arcade games and explore antique mechanical machines at Pier 45.",
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
    description: "Try indoor bouldering together at Benchmark Climbing on Van Ness Avenue.",
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
  {
    id: "ferry-building-food-stroll",
    title: "Food stroll at the Ferry Building",
    description:
      "Wander through the Ferry Building Marketplace together and share snacks from a few of the food stalls.",
    activityType: "venue",
    interestTags: ["food"],
    relatedInterests: [],
    venue: {
      name: "Ferry Building Marketplace",
      address: "1 Ferry Building, San Francisco, CA 94111",
      latitude: 37.79555,
      longitude: -122.39347,
    },
    // Snack budget. The building is open 6am-10pm; merchant hours vary.
    costUsd: 15,
    sources: [
      "https://www.ferrybuildingmarketplace.com/visit/",
      "https://www.openstreetmap.org/?mlat=37.79555&mlon=-122.39347#map=19/37.79555/-122.39347",
    ],
  },
  {
    id: "dandelion-chocolate",
    title: "Hot chocolate at Dandelion",
    description:
      "Meet up at Dandelion Chocolate's café on Valencia Street and compare hot chocolates, coffees, and treats.",
    activityType: "venue",
    interestTags: ["food", "coffee"],
    relatedInterests: [],
    venue: {
      name: "Dandelion Chocolate",
      address: "740 Valencia Street, San Francisco, CA 94110",
      latitude: 37.76104,
      longitude: -122.4217,
    },
    // One drink or pastry.
    costUsd: 9,
    sources: [
      "https://www.dandelionchocolate.com/pages/valencia-street",
      "https://www.openstreetmap.org/?mlat=37.76104&mlon=-122.42170#map=19/37.76104/-122.42170",
    ],
  },
  {
    id: "amoeba-music",
    title: "Record digging at Amoeba Music",
    description:
      "Dig through records together at Amoeba Music on Haight Street and swap recommendations.",
    activityType: "venue",
    interestTags: ["music"],
    relatedInterests: [],
    venue: {
      name: "Amoeba Music",
      address: "1855 Haight Street, San Francisco, CA 94117",
      latitude: 37.76894,
      longitude: -122.45265,
    },
    costUsd: 0,
    sources: [
      "https://www.amoeba.com/our-stores",
      "https://www.openstreetmap.org/?mlat=37.76894&mlon=-122.45265#map=19/37.76894/-122.45265",
    ],
  },
  {
    id: "city-lights-books",
    title: "Book hunt at City Lights",
    description:
      "Explore the shelves at City Lights, the 1953 North Beach bookstore tied to the Beat poets, and share your best finds.",
    activityType: "venue",
    interestTags: ["books"],
    // history: a 1953 bookstore and publisher central to Beat Generation history.
    relatedInterests: ["history"],
    venue: {
      name: "City Lights Booksellers",
      address: "261 Columbus Avenue, San Francisco, CA 94133",
      latitude: 37.79765,
      longitude: -122.40662,
    },
    costUsd: 0,
    sources: [
      "https://citylights.com/our-story/a-short-history-of-city-lights/",
      "https://citylights.com/map-directions/",
      "https://www.openstreetmap.org/?mlat=37.79765&mlon=-122.40662#map=19/37.79765/-122.40662",
    ],
  },
  {
    id: "exploratorium",
    title: "Hands-on exhibits at the Exploratorium",
    description:
      "Try the Exploratorium's hands-on exhibits together, where science, art, and perception meet.",
    activityType: "venue",
    interestTags: ["science"],
    // art: the museum describes itself as a museum of science, art, and human perception.
    relatedInterests: ["art"],
    venue: {
      name: "Exploratorium",
      address: "Pier 15, The Embarcadero, San Francisco, CA 94111",
      latitude: 37.8009,
      longitude: -122.39853,
    },
    // General adult admission ($39.95). Students pay $29.95, but we don't
    // assume every participant qualifies.
    costUsd: 40,
    sources: [
      "https://www.exploratorium.edu/visit",
      "https://www.exploratorium.edu/hours",
      "https://www.exploratorium.edu/video/exploratorium-museum-science-art-and-human-perception",
      "https://www.openstreetmap.org/?mlat=37.80090&mlon=-122.39853#map=19/37.80090/-122.39853",
    ],
  },
  {
    id: "presidio-field-station",
    title: "Nature spotting from the Presidio Field Station",
    description:
      "Borrow binoculars and field guides at the Presidio Field Station and spot birds and plants around Tunnel Tops as a group.",
    activityType: "venue",
    interestTags: ["nature"],
    // science: observing wildlife with binoculars and field guides.
    relatedInterests: ["science"],
    venue: {
      name: "Presidio Field Station",
      address: "Presidio Tunnel Tops, San Francisco, CA 94129",
      latitude: 37.8029,
      longitude: -122.45591,
    },
    costUsd: 0,
    sources: [
      "https://presidio.gov/explore/attractions/field-station",
      "https://www.openstreetmap.org/?mlat=37.80290&mlon=-122.45591#map=18/37.80290/-122.45591",
    ],
  },
];
