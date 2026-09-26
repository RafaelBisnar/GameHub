# GameHub

GameHub is a mobile app for browsing and managing a library of online games. It is built with **Expo (React Native)** and talks to a **PHP + MySQL REST API** hosted on Freehostia. A **Discover** tab also pulls free-to-play games from a third-party public API, and any of those can be added to your own library.

## Third-Party API

| | |
|---|---|
| **API** | FreeToGame API |
| **URL** | **https://www.freetogame.com/api** |
| **Documentation** | https://www.freetogame.com/api-doc |
| **Authentication** | None (free, no API key) |

Endpoints used by the app (all `GET`):

| Endpoint | Used for |
|---|---|
| `https://www.freetogame.com/api/games?sort-by=popularity` | Discover list, most popular first |
| `https://www.freetogame.com/api/games?sort-by=popularity&category=shooter` | Category filter chips (shooter, mmorpg, moba, battle-royale, …) |
| `https://www.freetogame.com/api/game?id=452` | Game details: full description, screenshots, system requirements |

The code is in [`gamehub/src/api/freeToGame.ts`](gamehub/src/api/freeToGame.ts). Data provided by [FreeToGame.com](https://www.freetogame.com).

## Backend API (own PHP + MySQL)

**Base URL:** `http://danielrafael.duckdns.org/api`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health.php` | Checks that PHP and the database are working |
| `GET` | `/games.php` | List all games |
| `GET` | `/games.php?id={id}` | Get one game |
| `POST` | `/games.php` | Create a game (JSON body) |
| `PATCH` | `/games.php?id={id}` | Update a game; only the fields sent are changed |
| `DELETE` | `/games.php?id={id}` | Delete a game |

Every response has the same shape:

```json
{ "success": true, "data": { ... }, "message": "..." }
```

Example: create a game.

```http
POST /api/games.php
Content-Type: application/json

{ "title": "My Game", "genre": "RPG", "platform": "PC", "developer": "Me", "rating": 4.5 }
```

A ready-to-import Postman collection with every request is in [`backend/GameHub.postman_collection.json`](backend/GameHub.postman_collection.json).

## Features

- **CRUD:** add, view, edit and delete games, stored in MySQL through the PHP API. Deleting asks for confirmation first.
- **Discover:** browse free-to-play games from FreeToGame, filter by category, search, open details, and import a game into your library with the Add Game form pre-filled.
- **Favorites:** mark games with a heart. It updates instantly and is saved to the database.
- **Search:** on the Home screen (title, genre or developer) and on the Games list, which also has filters and sorting.
- **Date picker** for the release date.
- **Light and dark mode**, switched from the Profile screen and remembered on the device.
- **Loading, error and empty states** on every screen that loads data, with a Try Again button.

## Tech Stack

| Part | Technology |
|---|---|
| Mobile app | Expo SDK 57, React Native, TypeScript, React Navigation |
| Backend | PHP 7+/8 (plain PHP, PDO with prepared statements; no framework) |
| Database | MySQL (one `games` table, see [`backend/schema.sql`](backend/schema.sql)) |
| Hosting | Freehostia (free Chocolate plan) with a DuckDNS domain |
| Third-party API | FreeToGame |

## Project Structure

```
GameHub/
├── README.md                  ← this file
├── DEPLOYMENT.md              ← step-by-step Freehostia + DuckDNS setup guide
├── backend/
│   ├── schema.sql             ← creates the games table + 10 sample games
│   ├── GameHub.postman_collection.json
│   └── api/                   ← upload this folder to the server
│       ├── bootstrap.php      ← shared setup: JSON/CORS headers, DB connection, helpers
│       ├── games.php          ← CRUD endpoint
│       ├── health.php         ← health check
│       ├── index.php          ← API landing message
│       └── config.example.php ← template for config.php (real config.php is not committed)
└── gamehub/                   ← Expo mobile app
    ├── App.tsx
    └── src/
        ├── api/               ← client.ts (fetch wrapper), games.ts (own API), freeToGame.ts (third-party API)
        ├── components/        ← reusable UI (forms, cards, date picker, …)
        ├── context/           ← GameContext (games + CRUD), ThemeContext, ToastContext
        ├── navigation/        ← bottom tabs + stacks
        ├── screens/           ← Home, Games, Discover, Add/Edit Game, Favorites, Profile
        ├── theme/             ← dark and light color palettes
        ├── types/             ← Game and FreeToGame types
        └── utils/
```

## Running the App

Requirements: Node.js and the **Expo Go** app on your phone.

```bash
cd gamehub
npm install
cp .env.example .env      # then set EXPO_PUBLIC_API_URL (see below)
npx expo start
```

Scan the QR code with Expo Go (Android: use the scanner inside Expo Go).

`.env`:

```
EXPO_PUBLIC_API_URL=http://danielrafael.duckdns.org/api
EXPO_PUBLIC_API_METHOD_OVERRIDE=false
```

Other useful commands (run inside `gamehub/`):

```bash
npx expo start --web   # quick preview in a browser
npx expo lint          # lint
npx tsc --noEmit       # type-check
```

## Running the Backend

1. Import `backend/schema.sql` into your MySQL database (phpMyAdmin → Import).
2. Copy `backend/api/config.example.php` to `config.php` and fill in your database details.
3. Upload the files in `backend/api/` to an `api/` folder on a PHP host.
4. Open `/api/health.php` in a browser. It should show `"database":"connected"`.

The full walkthrough, including DuckDNS and troubleshooting, is in [DEPLOYMENT.md](DEPLOYMENT.md).

## Notes

- **Credentials:** `backend/api/config.php` (database password) and `gamehub/.env` are listed in `.gitignore` and are not in this repository.
- **HTTP, not HTTPS:** the API is served over plain HTTP because Freehostia's free Let's Encrypt certificate could not be issued for a DuckDNS subdomain. The API stores only sample game data; no passwords or personal information.
- **No login:** anyone with the app can add, edit or delete games. This is a class demo with sample data, and the server caps the library at 500 games to protect the 10 MB database.

## Author

Rafael Daniel A. Bisnar
