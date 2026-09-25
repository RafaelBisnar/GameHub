export type GameStatus = 'Active' | 'Inactive';

export interface Game {
  id: string;
  title: string;
  image: string;
  genre: string;
  platform: string;
  developer: string;
  releaseDate: string;
  description: string;
  rating: number;
  multiplayerType: string;
  status: GameStatus;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

// What the app sends to create a game; the server fills in id and timestamps.
export type GameInput = Omit<Game, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'> & {
  isFavorite?: boolean;
};

export type GameUpdate = Partial<Omit<Game, 'id' | 'createdAt' | 'updatedAt'>>;
