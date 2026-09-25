@AGENTS.md
# CLAUDE.md

## Project Overview
GameHub — a mobile CRUD prototype for browsing and managing an online games
library. Built for a school presentation demonstrating full Create, Read,
Update, Delete functionality. Data is stored in MySQL behind a small PHP
REST API (../backend/, hosted on Freehostia); the app talks to it through
src/api/ and keeps the latest copy in React Context (see Data Layer below).

## Tech Stack
- Expo (managed workflow) + React Native
- TypeScript
- React Navigation (bottom tabs + native stack)
- React Context + useReducer for state (no Redux/Zustand)
- @expo/vector-icons (Ionicons) for icons
- Backend: plain PHP 7+ with PDO + MySQL 5 (../backend/), no frameworks —
  it must run on free shared hosting (no Composer, no SSH, no Node.js)

## Folder Structure
- src/screens/    — one file per screen
- src/components/ — shared/reusable UI pieces
- src/navigation/ — tab + stack navigators
- src/api/        — fetch wrapper (client.ts) and one function per endpoint
- src/context/    — GameContext (state, CRUD actions that call the API)
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
- GameContext calls the API only via src/api/ (never raw fetch in screens).
  addGame/updateGame/deleteGame are async and throw ApiError on failure —
  screens await them and show an error toast. toggleFavorite is optimistic.
- The API base URL comes from EXPO_PUBLIC_API_URL (.env, see .env.example).
- Any change to the Game fields must be made in three places: src/types/Game.ts,
  backend/api/games.php (validation + game_from_row) and backend/schema.sql.

## Theme
Dark gaming aesthetic by default, plus a light mode toggled from the Profile
screen (saved on the device with AsyncStorage). Palettes live in
src/theme/colors.ts (darkColors / lightColors):
- background: #0B0E17 (dark) / #F3F4F8 (light)
- surface/card: #151A2B / #FFFFFF
- primary: #8B5CF6 / #7C3AED (purple)
- accent: #3B82F6 / #2563EB (blue)
- highlight: #39FF88 / #15803D (green)
- onPrimary: text/icons on primary or accent buttons (always light)
Components never import a palette directly. Read colors with
`const { colors } = useTheme()` and build styles with
`const styles = useThemedStyles(createStyles)`, where
`createStyles = (colors: ThemeColors) => StyleSheet.create({...})` is defined
outside the component. Don't hardcode hex values in screens.

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
- Don't add auth or another persistence layer (AsyncStorage, Firebase) unless asked.
- Every destructive action (delete) must show a confirmation dialog first.
- Every list/detail view needs a sensible empty state — don't skip it.
- Match the existing dark theme; don't introduce new colors ad hoc.