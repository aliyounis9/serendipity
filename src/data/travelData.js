
export const CITIES = [
  { name: "San Francisco", country: "USA", flag: "🇺🇸", emoji: "🌉", desc: "Tech, fog & Pacific coastline" },
  { name: "Berlin", country: "Germany", flag: "🇩🇪", emoji: "🎶", desc: "History, art & underground culture" },
  { name: "Buenos Aires", country: "Argentina", flag: "🇦🇷", emoji: "💃", desc: "Tango, steak & street art" },
  { name: "Beirut", country: "Lebanon", flag: "🇱🇧", emoji: "🌇", desc: "Resilience, food & Mediterranean soul" },
  { name: "Seoul", country: "South Korea", flag: "🇰🇷", emoji: "🏯", desc: "K-culture, street food & neon nights" },
  { name: "Cairo", country: "Egypt", flag: "🇪🇬", emoji: "🔺", desc: "Ancient wonders & vibrant chaos" },
  { name: "Amman", country: "Jordan", flag: "🇯🇴", emoji: "🏺", desc: "Hills, heritage & warm hospitality" },
  { name: "Marrakech", country: "Morocco", flag: "🇲🇦", emoji: "🕌", desc: "Souks, riads & desert magic" },
];

export const CITY_QUESTIONS = {
  "San Francisco": [
    {
      id: "city_neighborhoods",
      question: "Which San Francisco areas interest you? (pick all that apply)",
      multi: true,
      options: [
        { label: "The Mission — murals, taquerias & local culture", value: "The Mission", icon: "🎨" },
        { label: "Haight-Ashbury — counterculture & vintage shops", value: "Haight-Ashbury", icon: "✌️" },
        { label: "North Beach — Italian cafés & Beat Generation history", value: "North Beach", icon: "📚" },
        { label: "Golden Gate Park — nature, museums & gardens", value: "Golden Gate Park", icon: "🌿" },
      ],
    },
    {
      id: "city_vibes",
      question: "What are you hoping to experience in SF? (pick all that apply)",
      multi: true,
      options: [
        { label: "Tech culture & startup energy", value: "tech culture", icon: "💻" },
        { label: "Ocean views & coastal hikes", value: "ocean and nature", icon: "🌊" },
        { label: "World-class food scene", value: "food scene", icon: "🍜" },
        { label: "Art, music & counterculture", value: "art and counterculture", icon: "🎸" },
      ],
    },
  ],
  "Berlin": [
    {
      id: "city_neighborhoods",
      question: "Which Berlin neighborhoods call to you? (pick all that apply)",
      multi: true,
      options: [
        { label: "Kreuzberg — multicultural, edgy & artistic", value: "Kreuzberg", icon: "🎨" },
        { label: "Mitte — museums, galleries & historic core", value: "Mitte", icon: "🏛️" },
        { label: "Friedrichshain — street art, nightlife & East Side Gallery", value: "Friedrichshain", icon: "🎶" },
        { label: "Prenzlauer Berg — cozy cafés & boutique streets", value: "Prenzlauer Berg", icon: "☕" },
      ],
    },
    {
      id: "city_vibes",
      question: "What draws you to Berlin? (pick all that apply)",
      multi: true,
      options: [
        { label: "Cold War history & the Wall", value: "history", icon: "🚧" },
        { label: "Underground club & music scene", value: "nightlife and music", icon: "🎧" },
        { label: "Street food & beer gardens", value: "food and beer", icon: "🍺" },
        { label: "Contemporary art & galleries", value: "art and galleries", icon: "🖼️" },
      ],
    },
  ],
  "Buenos Aires": [
    {
      id: "city_neighborhoods",
      question: "Which Buenos Aires neighborhoods interest you? (pick all that apply)",
      multi: true,
      options: [
        { label: "San Telmo — antique markets & cobblestone streets", value: "San Telmo", icon: "🗝️" },
        { label: "Palermo Soho — boutiques, street art & craft cocktails", value: "Palermo Soho", icon: "🍸" },
        { label: "La Boca — colorful houses & tango in the streets", value: "La Boca", icon: "🎨" },
        { label: "Recoleta — grand architecture & the famous cemetery", value: "Recoleta", icon: "🏛️" },
      ],
    },
    {
      id: "city_vibes",
      question: "What excites you about Buenos Aires? (pick all that apply)",
      multi: true,
      options: [
        { label: "Tango & live music", value: "tango and music", icon: "💃" },
        { label: "Steak, wine & food culture", value: "food and wine", icon: "🥩" },
        { label: "Street art & creative scene", value: "street art", icon: "🎨" },
        { label: "Football passion & local culture", value: "football and local culture", icon: "⚽" },
      ],
    },
  ],
  "Beirut": [
    {
      id: "city_neighborhoods",
      question: "Which Beirut areas would you want to explore? (pick all that apply)",
      multi: true,
      options: [
        { label: "Gemmayzeh — street art, bars & creative energy", value: "Gemmayzeh", icon: "🎨" },
        { label: "Hamra — bookshops, cafés & university vibes", value: "Hamra", icon: "📚" },
        { label: "Mar Mikhael — rooftop bars & galleries", value: "Mar Mikhael", icon: "🌃" },
        { label: "Downtown — Ottoman & French architecture, rebuilt heritage", value: "Downtown Beirut", icon: "🏛️" },
      ],
    },
    {
      id: "city_vibes",
      question: "What draws you to Beirut? (pick all that apply)",
      multi: true,
      options: [
        { label: "Legendary food — mezze, manoushe, street eats", value: "food culture", icon: "🧆" },
        { label: "Nightlife & rooftop bar scene", value: "nightlife", icon: "🌙" },
        { label: "Ancient history — Byblos, Baalbek day trips", value: "ancient history", icon: "🏛️" },
        { label: "Resilience, art & creative spirit", value: "art and resilience", icon: "✊" },
      ],
    },
  ],
  "Seoul": [
    {
      id: "city_neighborhoods",
      question: "Which Seoul neighborhoods excite you? (pick all that apply)",
      multi: true,
      options: [
        { label: "Hongdae — indie music, street performers & youth culture", value: "Hongdae", icon: "🎸" },
        { label: "Bukchon Hanok Village — traditional houses & tea rooms", value: "Bukchon", icon: "🏡" },
        { label: "Gangnam — sleek shopping, K-beauty & modern Seoul", value: "Gangnam", icon: "💎" },
        { label: "Ikseon-dong — tiny alleys, vintage cafés & hanok bars", value: "Ikseon-dong", icon: "☕" },
      ],
    },
    {
      id: "city_vibes",
      question: "What are you most excited about in Seoul? (pick all that apply)",
      multi: true,
      options: [
        { label: "K-food — BBQ, street food, pojangmacha tents", value: "korean food", icon: "🍖" },
        { label: "K-pop, K-drama & pop culture", value: "pop culture", icon: "🎤" },
        { label: "Temples, palaces & traditional culture", value: "traditional culture", icon: "🏯" },
        { label: "Skincare, shopping & modern lifestyle", value: "shopping and lifestyle", icon: "🛍️" },
      ],
    },
  ],
  "Cairo": [
    {
      id: "city_neighborhoods",
      question: "Which Cairo areas interest you? (pick all that apply)",
      multi: true,
      options: [
        { label: "Islamic Cairo — mosques, narrow alleys & history", value: "Islamic Cairo", icon: "🕌" },
        { label: "Zamalek — Nile island with art galleries & cafés", value: "Zamalek", icon: "🎨" },
        { label: "Downtown — faded grandeur, bookshops & street life", value: "Downtown Cairo", icon: "📖" },
        { label: "Giza — pyramids, Sphinx & ancient wonders", value: "Giza", icon: "🔺" },
      ],
    },
    {
      id: "city_vibes",
      question: "What excites you most about Cairo? (pick all that apply)",
      multi: true,
      options: [
        { label: "Ancient Egyptian history & archaeology", value: "ancient history", icon: "🏛️" },
        { label: "Street food — koshari, ful, ta'ameya", value: "street food", icon: "🧆" },
        { label: "Bazaars, souks & local markets", value: "markets and bazaars", icon: "🏪" },
        { label: "Nile cruises & city views", value: "nile and views", icon: "🌅" },
      ],
    },
  ],
  "Amman": [
    {
      id: "city_neighborhoods",
      question: "Which Amman areas interest you? (pick all that apply)",
      multi: true,
      options: [
        { label: "Jabal Amman & Rainbow Street — cafes, galleries, old villas", value: "Jabal Amman", icon: "☕" },
        { label: "Downtown (Al-Balad) — souks, Roman heritage, street food", value: "Downtown Amman", icon: "🛍️" },
        { label: "Jabal Al-Weibdeh — artsy streets and creative spaces", value: "Al-Weibdeh", icon: "🎨" },
        { label: "Abdali & Boulevard — modern city vibes and rooftop spots", value: "Abdali", icon: "🌆" },
      ],
    },
    {
      id: "city_vibes",
      question: "What draws you to Amman? (pick all that apply)",
      multi: true,
      options: [
        { label: "Historic sites — Citadel, Roman Theater, ancient layers", value: "history", icon: "🏛️" },
        { label: "Jordanian food — falafel, mansaf, local bakeries", value: "food culture", icon: "🥙" },
        { label: "Cafe culture and conversation-heavy evenings", value: "cafe culture", icon: "🫖" },
        { label: "Design, crafts, and independent art scene", value: "art and design", icon: "🧵" },
      ],
    },
  ],
  "Marrakech": [
    {
      id: "city_neighborhoods",
      question: "Which Marrakech areas excite you? (pick all that apply)",
      multi: true,
      options: [
        { label: "Medina — labyrinth alleys, souks, hidden courtyards", value: "Medina", icon: "🧭" },
        { label: "Gueliz — modern cafes, boutiques, and art galleries", value: "Gueliz", icon: "🖼️" },
        { label: "Hivernage — gardens, elegant hotels, nightlife", value: "Hivernage", icon: "🌴" },
        { label: "Kasbah — historic walls, palaces, and calm corners", value: "Kasbah", icon: "🏰" },
      ],
    },
    {
      id: "city_vibes",
      question: "What do you want most from Marrakech? (pick all that apply)",
      multi: true,
      options: [
        { label: "Souk adventure and handcrafted treasures", value: "markets and crafts", icon: "🧺" },
        { label: "Riads, hammams, and slow-luxury moments", value: "relaxation and riads", icon: "🛁" },
        { label: "Moroccan cuisine — tagines, tea, rooftop dining", value: "food culture", icon: "🍲" },
        { label: "Architecture, gardens, and photo-worthy design", value: "architecture and gardens", icon: "📸" },
      ],
    },
  ],
};

export const PERSONALITY_QUESTIONS = [
  {
    id: "energy",
    question: "It's your first morning in a new city. What do you do?",
    options: [
      { label: "Hit the streets at dawn — I want to see everything", value: "high", icon: "⚡" },
      { label: "Slow coffee, then wander with no agenda", value: "low", icon: "☕" },
      { label: "Research the top spots, then power through my list", value: "structured", icon: "📋" },
      { label: "Ask a local where they'd go — I trust vibes", value: "social", icon: "🗣️" },
    ],
  },
  {
    id: "food",
    question: "How do you find the best food when traveling?",
    options: [
      { label: "Street food and market stalls — the messier the better", value: "street", icon: "🍜" },
      { label: "I book reservations at the best restaurants weeks ahead", value: "fine", icon: "🍷" },
      { label: "I follow my nose and pick places that look busy", value: "spontaneous", icon: "👃" },
      { label: "Cooking classes or eating with locals", value: "immersive", icon: "🫕" },
    ],
  },
  {
    id: "culture",
    question: "You have a free afternoon. Where do you end up?",
    options: [
      { label: "A museum or historical landmark", value: "history", icon: "🏛️" },
      { label: "A neighborhood locals love that tourists skip", value: "offbeat", icon: "🗺️" },
      { label: "A park, garden, or natural spot to recharge", value: "nature", icon: "🌿" },
      { label: "A workshop, gallery, or creative space", value: "creative", icon: "🎨" },
    ],
  },
  {
    id: "social",
    question: "Your ideal travel memory involves...",
    options: [
      { label: "A deep conversation with someone I just met", value: "deep", icon: "💬" },
      { label: "Getting lost and discovering something magical alone", value: "solo", icon: "✨" },
      { label: "A group adventure — the more the merrier", value: "group", icon: "🎉" },
      { label: "Learning a skill from someone passionate about it", value: "learning", icon: "🎓" },
    ],
  },
  {
    id: "surprise",
    question: "How do you feel about surprises while traveling?",
    options: [
      { label: "Love them — detours are the best part", value: "love", icon: "🎲" },
      { label: "Small surprises yes, but I like a rough plan", value: "moderate", icon: "🗓️" },
      { label: "I'd try a surprise activity if someone vouched for it", value: "cautious", icon: "🤝" },
      { label: "Surprise me completely — I trust the universe", value: "full", icon: "🌌" },
    ],
  },
];
