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
