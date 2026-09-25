import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import { ApiError, getErrorMessage } from '@/api/client';
import { gamesApi } from '@/api/games';
import { useToast } from '@/context/ToastContext';
import type { Game, GameInput, GameUpdate } from '@/types/Game';

// Games are stored in the MySQL database behind the PHP API (backend/).
// This context keeps the latest copy in memory so every screen shares it.

type GameAction =
  | { type: 'SET_GAMES'; payload: Game[] }
  | { type: 'UPSERT_GAME'; payload: Game }
  | { type: 'DELETE_GAME'; payload: { id: string } }
  | { type: 'SET_FAVORITE'; payload: { id: string; isFavorite: boolean } };

function gameReducer(state: Game[], action: GameAction): Game[] {
  switch (action.type) {
    case 'SET_GAMES':
      return action.payload;
    case 'UPSERT_GAME': {
      const exists = state.some((game) => game.id === action.payload.id);
      return exists
        ? state.map((game) => (game.id === action.payload.id ? action.payload : game))
        : [...state, action.payload];
    }
    case 'DELETE_GAME':
      return state.filter((game) => game.id !== action.payload.id);
    case 'SET_FAVORITE':
      return state.map((game) =>
        game.id === action.payload.id ? { ...game, isFavorite: action.payload.isFavorite } : game
      );
    default:
      return state;
  }
}

interface GameContextValue {
  games: Game[];
  isLoading: boolean;
  loadError: string | null;
  reloadGames: () => void;
  // These wait for the server and throw an ApiError if it fails, so screens
  // can show an error instead of assuming the save worked.
  addGame: (input: GameInput) => Promise<Game>;
  updateGame: (id: string, updates: GameUpdate) => Promise<Game>;
  deleteGame: (id: string) => Promise<void>;
  // Updates the heart instantly and saves in the background; reverts with an
  // error toast if the save fails.
  toggleFavorite: (id: string) => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [games, dispatch] = useReducer(gameReducer, []);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { showToast } = useToast();

  // Latest favorite request per game, so a slow older response can't
  // overwrite the result of a newer tap.
  const favoriteRequests = useRef(new Map<string, number>());

  // State is only set inside the promise callbacks, i.e. after the server answers.
  const fetchGames = useCallback(
    () =>
      gamesApi
        .list()
        .then(
          (list) => {
            dispatch({ type: 'SET_GAMES', payload: list });
            setLoadError(null);
          },
          (error: unknown) => setLoadError(getErrorMessage(error))
        )
        .finally(() => setIsLoading(false)),
    []
  );

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const reloadGames = useCallback(() => {
    setIsLoading(true);
    setLoadError(null);
    fetchGames();
  }, [fetchGames]);

  const addGame = useCallback(async (input: GameInput) => {
    const created = await gamesApi.create(input);
    dispatch({ type: 'UPSERT_GAME', payload: created });
    return created;
  }, []);

  const updateGame = useCallback(async (id: string, updates: GameUpdate) => {
    const updated = await gamesApi.update(id, updates);
    dispatch({ type: 'UPSERT_GAME', payload: updated });
    return updated;
  }, []);

  const deleteGame = useCallback(async (id: string) => {
    try {
      await gamesApi.remove(id);
    } catch (error) {
      // 404 means it was already deleted (e.g. from another phone): that's
      // the outcome we wanted, so just remove it here too.
      if (!(error instanceof ApiError && error.status === 404)) throw error;
    }
    dispatch({ type: 'DELETE_GAME', payload: { id } });
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      const game = games.find((item) => item.id === id);
      if (!game) return;

      const isFavorite = !game.isFavorite;
      dispatch({ type: 'SET_FAVORITE', payload: { id, isFavorite } });

      const requestId = (favoriteRequests.current.get(id) ?? 0) + 1;
      favoriteRequests.current.set(id, requestId);
      const isLatest = () => favoriteRequests.current.get(id) === requestId;

      gamesApi
        .update(id, { isFavorite })
        .then((saved) => {
          if (isLatest()) dispatch({ type: 'UPSERT_GAME', payload: saved });
        })
        .catch((error: unknown) => {
          if (!isLatest()) return;
          dispatch({ type: 'SET_FAVORITE', payload: { id, isFavorite: !isFavorite } });
          showToast(getErrorMessage(error), 'error');
        });
    },
    [games, showToast]
  );

  const value = useMemo(
    () => ({
      games,
      isLoading,
      loadError,
      reloadGames,
      addGame,
      updateGame,
      deleteGame,
      toggleFavorite,
    }),
    [games, isLoading, loadError, reloadGames, addGame, updateGame, deleteGame, toggleFavorite]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGames(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGames must be used within a GameProvider');
  }
  return context;
}
