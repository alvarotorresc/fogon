# Fogon

> Your kitchen, organized. Collaborative cooking app for couples and families.

[![CI](https://github.com/alvarotorresc/fogon-app/actions/workflows/ci.yml/badge.svg)](https://github.com/alvarotorresc/fogon-app/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

<!-- TODO: Add screenshots when app is ready for production -->

## What is this

Fogon is a mobile app for couples and families who share the load of cooking and grocery shopping. It keeps your shopping list, pantry, recipes, and weekly meal plan in one place — synced in real-time so both of you always know what's needed, what's in stock, and what's for dinner.

The core idea: mark something as "out of stock" in your pantry and it shows up in the shopping list automatically. Add recipe ingredients to the list with one tap. See what your partner just bought while you're still at the store.

## Features

- **Shopping list** — Real-time sync via WebSocket. Categories, progress bar, swipe to delete. See who added what
- **Pantry** — Track what you have at home with stock levels (full, low, empty). Empty items auto-add to shopping list
- **Recipes** — Create your own with photos, ingredients, and steps. Add all ingredients to your shopping list in one tap
- **Meal planner** — 7-day grid to organize what you're cooking each day
- **Households** — Create a household and invite your partner with a code. Everything is shared
- **Push notifications** — Get notified when items are added or the meal plan changes
- **Offline support** — Cache persistence with network status indicator
- **Dark mode** — OLED-friendly dark theme by default, with light mode and system preference
- **i18n** — English and Spanish

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile** | Expo SDK 55, React Native 0.83, React 19, expo-router, NativeWind v4, Zustand 5, React Query v5, Socket.io client, expo-notifications |
| **API** | NestJS 11, Fastify, Socket.io (WebSocket gateway), expo-server-sdk, @nestjs/throttler |
| **Auth / DB / Storage** | Supabase (email/password auth, PostgreSQL, image storage) |
| **Landing** | Astro 5 |
| **Monorepo** | pnpm workspaces |
| **CI** | GitHub Actions (lint + typecheck + tests) |
| **Testing** | Jest, @testing-library/react-native |

## Project Structure

```
fogon-app/
├── apps/
│   ├── mobile/          # Expo React Native app
│   │   ├── app/         # expo-router screens (auth, tabs, recipes, meal-plan)
│   │   └── src/
│   │       ├── components/  # Shared UI components
│   │       ├── features/    # Feature modules (shopping, pantry, recipes, etc.)
│   │       ├── lib/         # API client, Supabase, i18n setup
│   │       ├── locales/     # EN + ES translations
│   │       └── store/       # Zustand stores
│   ├── api/             # NestJS API
│   │   └── src/
│   │       ├── auth/        # JWT guard
│   │       ├── household/   # Household CRUD + invites
│   │       ├── shopping/    # Shopping list + WebSocket gateway
│   │       ├── pantry/      # Pantry management
│   │       ├── recipe/      # Recipes + image upload
│   │       ├── meal-plan/   # Weekly meal planner
│   │       ├── notifications/ # Push notifications (Expo Server SDK)
│   │       └── supabase/    # Supabase service client
│   └── landing/         # Astro 5 landing page
├── packages/
│   └── types/           # Shared TypeScript interfaces
├── docs/
│   ├── visual-brief.md  # Design system and visual decisions
│   └── plans/           # Implementation plans
└── prototype/           # Approved visual prototype (React + Vite)
```

## Getting Started

### Prerequisites

- Node.js >= 22
- pnpm >= 10
- A Supabase project (free tier works)
- Expo Go app on your phone (for mobile development)

### Installation

```bash
git clone https://github.com/alvarotorresc/fogon-app.git
cd fogon-app
pnpm install
```

### Environment Variables

**API** (`apps/api/.env`):

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (not the anon key) |
| `PORT` | API port (default: 3000) |

**Mobile** (`apps/mobile/.env`):

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `EXPO_PUBLIC_API_URL` | NestJS API URL |
| `EXPO_PUBLIC_WS_URL` | WebSocket URL (same as API) |

### Run the API

```bash
pnpm dev:api
```

### Run the Mobile App

```bash
pnpm dev:mobile
```

Scan the QR code with Expo Go on your phone.

## Development

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev:mobile` | Start Expo dev server |
| `pnpm dev:api` | Start NestJS in watch mode |
| `pnpm dev:landing` | Start Astro dev server |
| `pnpm lint` | ESLint across all packages |
| `pnpm typecheck` | TypeScript check across all packages |
| `pnpm test` | Run all tests (363 tests: 200 API + 163 mobile) |

### Testing

Tests run with Jest. The API has unit tests for all controllers, services, guards, and the WebSocket gateway. The mobile app tests cover hooks, stores, and component behavior.

```bash
# Run API tests only
pnpm --filter @fogon/api test

# Run mobile tests only
pnpm --filter @fogon/mobile test
```

### Linting

Pre-commit hooks via Lefthook run ESLint and Prettier on staged files.

## Architecture

```
┌─────────────┐     HTTPS      ┌──────────────┐     SQL       ┌───────────┐
│   Mobile    │ ──────────────> │  NestJS API  │ ────────────> │ Supabase  │
│  (Expo RN)  │                 │  (Fastify)   │               │ (Postgres │
│             │ <─── WebSocket  │              │               │  + Auth   │
│             │   (Socket.io)   │              │               │  + Storage│
└─────────────┘                 └──────────────┘               └───────────┘
      │                               │
      │  Auth (JWT)                    │  Push notifications
      └───────────> Supabase Auth      └───────> Expo Push Service
```

- **Mobile** handles auth via Supabase SDK, then uses JWT tokens for all API calls
- **API** validates JWTs and enforces authorization via guards (household membership)
- **WebSocket** provides real-time sync for the shopping list
- **Push notifications** are sent through Expo's push service when relevant events happen

## License

MIT — see [LICENSE](./LICENSE)

---

Made with 🔥 by [Alvaro Torres](https://alvarotc.com)
