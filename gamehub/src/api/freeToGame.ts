import { ApiError, fetchText } from '@/api/client';
import type { GameFormValues } from '@/components/GameForm';
import type { FreeGameDetails, FreeGameSummary } from '@/types/FreeGame';
import { parseDateString } from '@/utils/date';

// Third-party public API used by the Discover tab. Free, no API key needed.
// Docs: https://www.freetogame.com/api-doc
export const FREE_TO_GAME_API_URL = 'https://www.freetogame.com/api';
export const FREE_TO_GAME_SITE_URL = 'https://www.freetogame.com';

async function getJson<T>(path: string): Promise<T> {
  const { status, ok, text } = await fetchText(`${FREE_TO_GAME_API_URL}/${path}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ApiError(`FreeToGame sent an unexpected response (HTTP ${status}).`, status);
  }

  // Errors come back as { status: 0, status_message: "..." }, e.g. with HTTP 404.
  if (!ok) {
    const message =
      typeof parsed === 'object' && parsed !== null && 'status_message' in parsed
        ? String((parsed as { status_message: unknown }).status_message)
        : `FreeToGame request failed (HTTP ${status}).`;
    throw new ApiError(message, status);
  }

  return parsed as T;
}

export const freeToGameApi = {
  // GET /games?sort-by=popularity[&category=shooter]
  list: (category?: string) =>
    getJson<FreeGameSummary[]>(
      `games?sort-by=popularity${category ? `&category=${encodeURIComponent(category)}` : ''}`
    ),

  // GET /game?id=452
  details: (id: number) => getJson<FreeGameDetails>(`game?id=${id}`),
};

// 'PC (Windows), Web Browser' -> 'PC, Web Browser'
function toPlatform(platform: string): string {
  return platform
    .split(',')
    .map((part) => part.trim().replace('PC (Windows)', 'PC'))
    .filter(Boolean)
    .join(', ');
}

/**
 * Turns a FreeToGame game into Add Game form values. FreeToGame has no rating or
 * multiplayer info, so those are left for the user to fill in before saving.
 */
export function toGameFormPrefill(game: FreeGameSummary): Partial<GameFormValues> {
  return {
    title: game.title.trim(),
    image: game.thumbnail,
    genre: game.genre.trim(),
    platform: toPlatform(game.platform),
    developer: (game.developer || game.publisher || '').trim(),
    releaseDate: parseDateString(game.release_date) ? game.release_date : '',
    description: game.short_description.trim(),
    status: 'Active',
  };
}
