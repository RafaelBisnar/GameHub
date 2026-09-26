import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme, useThemedStyles } from '@/context/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import type { FreeGameSummary } from '@/types/FreeGame';

interface DiscoverListItemProps {
  game: FreeGameSummary;
  inLibrary: boolean;
  onPress: () => void;
}

export function DiscoverListItem({ game, inLibrary, onPress }: DiscoverListItemProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: game.thumbnail }} style={styles.thumbnail} />
      {inLibrary && (
        <View style={styles.libraryBadge}>
          <Ionicons name="checkmark-circle" size={12} color={colors.onPrimary} />
          <Text style={styles.libraryBadgeText}>In Library</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {game.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {game.genre.trim()} • {game.platform}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {game.short_description}
        </Text>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    // FreeToGame thumbnails are 365x206.
    thumbnail: {
      width: '100%',
      aspectRatio: 365 / 206,
      backgroundColor: colors.background,
    },
    libraryBadge: {
      position: 'absolute',
      top: 10,
      right: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: colors.primary,
    },
    libraryBadgeText: {
      color: colors.onPrimary,
      fontSize: 11,
      fontWeight: '700',
    },
    content: {
      padding: 14,
      gap: 4,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    meta: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    description: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
      marginTop: 2,
    },
  });
