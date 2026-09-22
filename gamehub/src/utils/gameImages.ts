import type { ImageSourcePropType } from 'react-native';

const LOCAL_GAME_IMAGES: Record<string, ImageSourcePropType> = {
  valorant: require('../../assets/images/games/valorant.jpg'),
  'league-of-legends': require('../../assets/images/games/league-of-legends.jpg'),
  minecraft: require('../../assets/images/games/minecraft.png'),
  fortnite: require('../../assets/images/games/fortnite.jpg'),
  'apex-legends': require('../../assets/images/games/apex-legends.jpg'),
  'genshin-impact': require('../../assets/images/games/genshin-impact.jpg'),
  'dota-2': require('../../assets/images/games/dota-2.jpg'),
  roblox: require('../../assets/images/games/roblox.jpg'),
  'overwatch-2': require('../../assets/images/games/overwatch-2.jpg'),
  'counter-strike-2': require('../../assets/images/games/counter-strike-2.jpg'),
};

const LOCAL_IMAGE_PREFIX = 'local:';

export function getGameImageSource(image: string): ImageSourcePropType {
  if (image.startsWith(LOCAL_IMAGE_PREFIX)) {
    const key = image.slice(LOCAL_IMAGE_PREFIX.length);
    return LOCAL_GAME_IMAGES[key] ?? { uri: `https://picsum.photos/seed/${key}/400/600` };
  }
  return { uri: image };
}
