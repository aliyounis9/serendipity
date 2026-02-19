# Gemini Setup

Create a local env file at `.env.local` (already gitignored by `*.local`) and add:

```bash
VITE_GEMINI_API_KEY=your_api_key_here
VITE_GEMINI_PRIMARY_MODEL=gemini-2.5-flash-lite
VITE_GEMINI_FALLBACK_MODEL=gemma-3-1b-it
```

Notes:
- The app tries the primary model first, then automatically falls back if the primary request fails.
- Use free-tier friendly models for testing (`gemini-2.5-flash-lite` and `gemma-3-1b-it`).
