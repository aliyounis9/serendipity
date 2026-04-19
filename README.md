# Serendipity

Serendipity is a personality-first travel planning app built with React + Vite.
It asks onboarding and preference questions, generates a multi-day city itinerary with Gemini's API, adds one surprise reveal event, shows per-day static maps, and supports PDF export for sharing.

This is my mini-capstone project for the CP192 course.

## Setup

```bash
npm install
```

Create `.env.local` in the project root:

```bash
VITE_GEMINI_API_KEY=gemini_api_key
VITE_GEMINI_PRIMARY_MODEL=gemini-2.5-flash-lite
VITE_GEMINI_FALLBACK_MODEL=gemma-3-1b-it
VITE_MAPS_API_KEY=google_maps_static_api_key
```

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
```
