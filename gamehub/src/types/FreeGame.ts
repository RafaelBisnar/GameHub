// Shapes returned by the FreeToGame public API (https://www.freetogame.com/api-doc).
// Field names are the API's own (snake_case), kept as-is.

export interface FreeGameSummary {
  id: number;
  title: string;
  thumbnail: string;
  short_description: string;
  game_url: string;
  genre: string;
  // 'PC (Windows)', 'Web Browser', or 'PC (Windows), Web Browser'
  platform: string;
  publisher: string;
  developer: string;
  release_date: string;
  freetogame_profile_url: string;
}

export interface FreeGameDetails extends FreeGameSummary {
  status: string;
  description: string;
  minimum_system_requirements?: {
    os: string | null;
    processor: string | null;
    memory: string | null;
    graphics: string | null;
    storage: string | null;
  };
  screenshots: { id: number; image: string }[];
}
