@AGENTS.md
# CLAUDE.md

## Project Overview
GameHub — a mobile CRUD prototype for browsing and managing an online games
library. Built for a school presentation demonstrating full Create, Read,
Update, Delete functionality. No real backend — all data lives in memory
via React Context (see Data Layer below).

## Tech Stack
- Expo (managed workflow) + React Native
- TypeScript
- React Navigation (bottom tabs + native stack)
- React Context + useReducer for state (no Redux/Zustand)
- @expo/vector-icons (Ionicons) for icons
- No backend, no database — mock/in-memory data only

## Folder Structure
- src/screens/    — one file per screen
- src/components/ — shared/reusable UI pieces
- src/navigation/ — tab + stack navigators
- src/context/    — GameContext (state, CRUD actions, mock data)
- src/types/      — TypeScript types (Game, etc.)
- src/theme/      — colors.ts and any shared style constants
- src/data/       — seed/mock data if separated from context

## Data Model
Game: id, title, image, genre, platform, developer, releaseDate,
description, rating, multiplayerType, status ('Active' | 'Inactive'),
isFavorite, createdAt, updatedAt

## Data Layer Rules
- All CRUD goes through GameContext (addGame, updateGame, deleteGame,
  toggleFavorite). Never mutate game data directly from a screen.
- No API calls, no AsyncStorage persistence unless I explicitly ask for it —
  this is an in-memory prototype by design.

## Theme
Dark gaming aesthetic only (no light mode).
- background: #0B0E17
- surface/card: #151A2B
- primary: #8B5CF6 (purple)
- accent: #3B82F6 (blue)
- highlight: #39FF88 (neon green)
Keep new components consistent with this palette — pull colors from
src/theme/colors.ts, don't hardcode hex values in screens.

## Navigation
Bottom tabs: Home, Games, Add Game, Favorites, Profile.
Games tab and Add Game tab are stack navigators (so Game Details / Edit
Game can be pushed on top).

## Coding Conventions
- Functional components + hooks only
- TypeScript strict — no `any` unless unavoidable, and explain why in a
  comment if you use it
- One component per file, PascalCase filenames for components
- Keep screens focused on layout/composition; put reusable pieces in
  src/components/

## Commands
- npx expo start        — run the dev server
- npx expo start --web  — quick browser preview
- npx tsc --noEmit      — type-check without building

## Important Rules
- Don't add a real backend, auth, or persistence layer unless asked.
- Every destructive action (delete) must show a confirmation dialog first.
- Every list/detail view needs a sensible empty state — don't skip it.
- Match the existing dark theme; don't introduce new colors ad hoc.