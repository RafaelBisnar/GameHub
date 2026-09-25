import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme, useThemedStyles } from '@/context/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import type { Game } from '@/types/Game';
import { getGameImageSource } from '@/utils/gameImages';

interface FavoriteListItemProps {
  game: Game;
  onRemove: () => void;
}

export function FavoriteListItem({ game, onRemove }: FavoriteListItemProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.card}>
      <Image source={getGameImageSource(game.image)} style={styles.thumbnail} />
      <View style={styles.content}>
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
      <Pressable style={styles.removeButton} onPress={onRemove} hitSlop={8}>
        <Ionicons name="heart" size={22} color={colors.highlight} />
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 16,
      backgroundColor: colors.surface,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    thumbnail: {
      width: 64,
      height: 64,
      borderRadius: 12,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      gap: 4,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '700',
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
      fontWeight: '600',
    },
    removeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
  });
