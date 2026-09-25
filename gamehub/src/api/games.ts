import { apiRequest } from '@/api/client';
import type { Game, GameInput, GameUpdate } from '@/types/Game';

// One function per endpoint in backend/api/games.php.
export const gamesApi = {
  list: () => apiRequest<Game[]>('games.php'),

  create: (input: GameInput) => apiRequest<Game>('games.php', { method: 'POST', body: input }),

  update: (id: string, updates: GameUpdate) =>
    apiRequest<Game>(`games.php?id=${encodeURIComponent(id)}`, { method: 'PATCH', body: updates }),

  remove: (id: string) =>
    apiRequest<{ id: string }>(`games.php?id=${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
