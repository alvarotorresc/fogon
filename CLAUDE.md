# Fogon — CLAUDE.md

## Proyecto
App de cocina colaborativa para parejas y familias.
Stack: React Native (Expo) + NestJS + Supabase (auth/DB/storage)
Monorepo pnpm workspaces.

## Arquitectura (BACKEND-FIRST)
- Mobile → NestJS API para TODO el CRUD
- NestJS → PostgreSQL via Drizzle ORM (DATABASE_URL)
- Supabase: SOLO auth (JWT) + PostgreSQL hosting + Storage
- SIN RLS — NestJS guards manejan toda la autorización
- Realtime shopping list: NestJS WebSockets (Socket.io)
- Mobile usa @supabase/supabase-js SOLO para auth session
- Mobile usa axios para todas las llamadas a la API

## Commits
- Conventional Commits en inglés: feat(scope): message
- NUNCA Co-Authored-By, NUNCA referencias a IA
- NUNCA git push (lo hace el usuario)

## Apps
- apps/mobile — Expo React Native (@fogon/mobile)
- apps/api — NestJS (@fogon/api)
- apps/landing — Astro 5 (@fogon/landing)
- packages/types — TypeScript types compartidos (@fogon/types)

## Design
- Dark mode OLED: bg #0A0A0A
- Terracota: #EA580C (brand color)
- Brand blue: #3291FF (CTAs)
- Visual brief: docs/visual-brief.md
- Design doc: docs/plans/2026-02-25-fogon-design.md

## Reglas
- TypeScript strict: true en todos los packages
- Tests con cada feature (Jest + @testing-library/react-native en mobile)
- i18n: EN + ES, todos los strings en locales/
- NativeWind: usar children render prop en Pressable (bug conocido con jsxImportSource)
