import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import type { Game } from '@/types/Game';

const SEED_TIMESTAMP = '2025-01-01T00:00:00.000Z';

const initialGames: Game[] = [
  {
    id: '1',
    title: 'Valorant',
    image: 'local:valorant',
    genre: 'Tactical Shooter',
    platform: 'PC',
    developer: 'Riot Games',
    releaseDate: '2020-06-02',
    description:
      'A precision-based 5v5 shooter where unique agent abilities meet tight gunplay. Every round comes down to sharp aim and sharper strategy.',
    rating: 4.5,
    multiplayerType: '5v5 Online PvP',
    status: 'Active',
    isFavorite: true,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: '2',
    title: 'League of Legends',
    image: 'local:league-of-legends',
    genre: 'MOBA',
    platform: 'PC',
    developer: 'Riot Games',
    releaseDate: '2009-10-27',
    description:
      'Two teams of five champions battle across three lanes to destroy the enemy Nexus. Over a decade in, its roster and meta are still evolving.',
    rating: 4.3,
    multiplayerType: '5v5 Online PvP',
    status: 'Active',
    isFavorite: false,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: '3',
    title: 'Minecraft',
    image: 'local:minecraft',
    genre: 'Sandbox',
    platform: 'PC, Xbox, PlayStation, Switch, Mobile',
    developer: 'Mojang Studios',
    releaseDate: '2011-11-18',
    description:
      'A blocky open world where anything can be built, mined, or survived. Play solo or bring friends into shared worlds for co-op building and adventure.',
    rating: 4.8,
    multiplayerType: 'Co-op & Online Multiplayer',
    status: 'Active',
    isFavorite: true,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: '4',
    title: 'Fortnite',
    image: 'local:fortnite',
    genre: 'Battle Royale',
    platform: 'PC, Xbox, PlayStation, Switch, Mobile',
    developer: 'Epic Games',
    releaseDate: '2017-07-25',
    description:
      'A hundred players drop onto a shrinking island, scavenging weapons and building structures to be the last one standing.',
    rating: 4.2,
    multiplayerType: 'Up to 100-player Battle Royale',
    status: 'Active',
    isFavorite: false,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: '5',
    title: 'Apex Legends',
    image: 'local:apex-legends',
    genre: 'Battle Royale',
    platform: 'PC, Xbox, PlayStation, Switch',
    developer: 'Respawn Entertainment',
    releaseDate: '2019-02-04',
    description:
      'Squads of three Legends, each with distinct abilities, fight across a shrinking arena in fast, momentum-driven combat.',
    rating: 4.4,
    multiplayerType: 'Squad-based Battle Royale (3 players)',
    status: 'Active',
    isFavorite: false,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: '6',
    title: 'Genshin Impact',
    image: 'local:genshin-impact',
    genre: 'Action RPG',
    platform: 'PC, PlayStation, Mobile',
    developer: 'HoYoverse',
    releaseDate: '2020-09-28',
    description:
      'An open-world adventure across the elemental land of Teyvat, blending elemental combat, exploration, and a gacha-driven roster of characters.',
    rating: 4.6,
    multiplayerType: 'Co-op Online (up to 4 players)',
    status: 'Active',
    isFavorite: true,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: '7',
    title: 'Dota 2',
    image: 'local:dota-2',
    genre: 'MOBA',
    platform: 'PC',
    developer: 'Valve',
    releaseDate: '2013-07-09',
    description:
      'A deep, unforgiving 5v5 strategy game where over a hundred heroes create nearly limitless team compositions and mind games.',
    rating: 4.5,
    multiplayerType: '5v5 Online PvP',
    status: 'Active',
    isFavorite: false,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: '8',
    title: 'Roblox',
    image: 'local:roblox',
    genre: 'Sandbox / Platform Creation',
    platform: 'PC, Xbox, Mobile',
    developer: 'Roblox Corporation',
    releaseDate: '2006-09-01',
    description:
      'A massive platform of user-created games ranging from obbies to tycoons, all built with the in-house Studio toolset.',
    rating: 4.0,
    multiplayerType: 'Massively Multiplayer Online',
    status: 'Inactive',
    isFavorite: false,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: '9',
    title: 'Overwatch 2',
    image: 'local:overwatch-2',
    genre: 'Hero Shooter',
    platform: 'PC, Xbox, PlayStation, Switch',
    developer: 'Blizzard Entertainment',
    releaseDate: '2022-10-04',
    description:
      'A team-based shooter of tanks, damage dealers, and supports, each with a distinct kit, fighting over objective-based maps.',
    rating: 3.8,
    multiplayerType: '5v5 Online PvP',
    status: 'Inactive',
    isFavorite: false,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
  {
    id: '10',
    title: 'Counter-Strike 2',
    image: 'local:counter-strike-2',
    genre: 'Tactical Shooter',
    platform: 'PC',
    developer: 'Valve',
    releaseDate: '2023-09-27',
    description:
      'The long-running bomb-defusal shooter rebuilt on Source 2, prized for its punishing economy and razor-sharp gunplay.',
    rating: 4.7,
    multiplayerType: '5v5 Online PvP',
    status: 'Active',
    isFavorite: true,
    createdAt: SEED_TIMESTAMP,
    updatedAt: SEED_TIMESTAMP,
  },
];

type GameInput = Omit<Game, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'> & {
  isFavorite?: boolean;
};

type GameUpdate = Partial<Omit<Game, 'id' | 'createdAt' | 'updatedAt'>>;

type GameAction =
  | { type: 'ADD_GAME'; payload: Game }
  | { type: 'UPDATE_GAME'; payload: { id: string; updates: GameUpdate } }
  | { type: 'DELETE_GAME'; payload: { id: string } }
  | { type: 'TOGGLE_FAVORITE'; payload: { id: string } };

function generateId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function gameReducer(state: Game[], action: GameAction): Game[] {
  switch (action.type) {
    case 'ADD_GAME':
      return [...state, action.payload];
    case 'UPDATE_GAME':
      return state.map((game) =>
        game.id === action.payload.id
          ? { ...game, ...action.payload.updates, updatedAt: new Date().toISOString() }
          : game
      );
    case 'DELETE_GAME':
      return state.filter((game) => game.id !== action.payload.id);
    case 'TOGGLE_FAVORITE':
      return state.map((game) =>
        game.id === action.payload.id
          ? { ...game, isFavorite: !game.isFavorite, updatedAt: new Date().toISOString() }
          : game
      );
    default:
      return state;
  }
}

interface GameContextValue {
  games: Game[];
  isLoading: boolean;
  addGame: (input: GameInput) => void;
  updateGame: (id: string, updates: GameUpdate) => void;
  deleteGame: (id: string) => void;
  toggleFavorite: (id: string) => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

const INITIAL_LOAD_DELAY = 500;

export function GameProvider({ children }: { children: ReactNode }) {
  const [games, dispatch] = useReducer(gameReducer, initialGames);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), INITIAL_LOAD_DELAY);
    return () => clearTimeout(timeout);
  }, []);

  const addGame = useCallback((input: GameInput) => {
    const now = new Date().toISOString();
    dispatch({
      type: 'ADD_GAME',
      payload: {
        ...input,
        id: generateId(),
        isFavorite: input.isFavorite ?? false,
        createdAt: now,
        updatedAt: now,
      },
    });
  }, []);

  const updateGame = useCallback((id: string, updates: GameUpdate) => {
    dispatch({ type: 'UPDATE_GAME', payload: { id, updates } });
  }, []);

  const deleteGame = useCallback((id: string) => {
    dispatch({ type: 'DELETE_GAME', payload: { id } });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: { id } });
  }, []);

  const value = useMemo(
    () => ({ games, isLoading, addGame, updateGame, deleteGame, toggleFavorite }),
    [games, isLoading, addGame, updateGame, deleteGame, toggleFavorite]
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
