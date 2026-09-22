import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import type { Game } from '@/types/Game';
import { getGameImageSource } from '@/utils/gameImages';

interface GameListItemProps {
  game: Game;
  onPress: () => void;
  onToggleFavorite: () => void;
}

export function GameListItem({ game, onPress, onToggleFavorite }: GameListItemProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={getGameImageSource(game.image)} style={styles.thumbnail} />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {game.title}
          </Text>
          <Pressable hitSlop={8} onPress={onToggleFavorite}>
            <Ionicons
              name={game.isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={game.isFavorite ? colors.highlight : colors.textSecondary}
            />
          </Pressable>
        </View>

        <Text style={styles.meta} numberOfLines={1}>
          {game.genre} • {game.platform}
        </Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color={colors.highlight} />
          <Text style={styles.rating}>{game.rating.toFixed(1)}</Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {game.description}
        </Text>

        <Pressable style={styles.detailsButton} onPress={onPress}>
          <Text style={styles.detailsButtonText}>View Details</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.textPrimary} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
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
    width: 88,
    height: 118,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
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
  description: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  detailsButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  detailsButtonText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
});
