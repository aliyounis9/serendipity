# Serendipity

A mobile app that suggests spontaneous local activities and brings small groups together.

Built with React Native, Expo, TypeScript, and Expo Router. Supports iOS, Android, and web.

## Getting started

Requires [Node.js](https://nodejs.org/).

```bash
npm install
npx expo start
```

Press `w` to open the app in a browser, or scan the QR code with [Expo Go](https://expo.dev/go) on your phone.

If your phone can't connect over the local network, you can use tunnel mode:

```bash
npx expo start --tunnel
```

This may require an [Expo account](https://expo.dev/signup). Sign in through the CLI (`npx expo login`) and Expo Go.

## Checks

```bash
npx tsc --noEmit   # TypeScript
npm run lint       # ESLint
npx expo-doctor    # Expo configuration and dependencies
```

## Project structure

Screens live in `src/app/`. Expo Router uses file-based routing, so `src/app/index.tsx` is the home screen.