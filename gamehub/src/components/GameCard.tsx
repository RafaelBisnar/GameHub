import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme, useThemedStyles } from '@/context/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import type { Game } from '@/types/Game';
import { getGameImageSource } from '@/utils/gameImages';

interface GameCardProps {
  game: Game;
  onPress?: () => void;
}

export function GameCard({ game, onPress }: GameCardProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={getGameImageSource(game.image)} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {game.title}
        </Text>
        <Text style={styles.genre} numberOfLines={1}>
          {game.genre}
        </Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={colors.highlight} />
          <Text style={styles.rating}>{game.rating.toFixed(1)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const CARD_WIDTH = 140;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      width: CARD_WIDTH,
      borderRadius: 14,
      backgroundColor: colors.surface,
      overflow: 'hidden',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 6,
    },
    image: {
      width: '100%',
      height: 100,
      backgroundColor: colors.background,
    },
    info: {
      padding: 10,
      gap: 4,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    genre: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    rating: {
      color: colors.textPrimary,
      fontSize: 12,
      fontWeight: '500',
    },
  });
