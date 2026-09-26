import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getErrorMessage } from '@/api/client';
import { FREE_TO_GAME_SITE_URL, freeToGameApi } from '@/api/freeToGame';
import { DiscoverListItem } from '@/components/DiscoverListItem';
import { ErrorView } from '@/components/ErrorView';
import { useGames } from '@/context/GameContext';
import { useTheme, useThemedStyles } from '@/context/ThemeContext';
import type { DiscoverStackParamList } from '@/navigation/DiscoverStack';
import type { ThemeColors } from '@/theme/colors';
import type { FreeGameSummary } from '@/types/FreeGame';

// value is FreeToGame's `category` query parameter ('' = all games).
const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Shooter', value: 'shooter' },
  { label: 'MMORPG', value: 'mmorpg' },
  { label: 'MOBA', value: 'moba' },
  { label: 'Battle Royale', value: 'battle-royale' },
  { label: 'Strategy', value: 'strategy' },
  { label: 'Card', value: 'card' },
  { label: 'Fighting', value: 'fighting' },
  { label: 'Racing', value: 'racing' },
  { label: 'Sports', value: 'sports' },
  { label: 'Survival', value: 'survival' },
  { label: 'Anime', value: 'anime' },
];

export function DiscoverScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation =
    useNavigation<NativeStackNavigationProp<DiscoverStackParamList, 'DiscoverList'>>();
  const { games: libraryGames } = useGames();

  const [category, setCategory] = useState('');
  const [reloadCount, setReloadCount] = useState(0);
  const [freeGames, setFreeGames] = useState<FreeGameSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Fetch from FreeToGame whenever the category changes (or Try Again is tapped).
  useEffect(() => {
    let cancelled = false;
    freeToGameApi
      .list(category || undefined)
      .then(
        (list) => {
          if (cancelled) return;
          setFreeGames(list);
          setError(null);
        },
        (loadError: unknown) => {
          if (!cancelled) setError(getErrorMessage(loadError));
        }
      )
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    // Ignore a slow response if the user already picked another category.
    return () => {
      cancelled = true;
    };
  }, [category, reloadCount]);

  const selectCategory = (value: string) => {
    if (value === category) return;
    setIsLoading(true);
    setError(null);
    setCategory(value);
  };

  const retry = () => {
    setIsLoading(true);
    setError(null);
    setReloadCount((count) => count + 1);
  };

  const libraryTitles = useMemo(
    () => new Set(libraryGames.map((game) => game.title.trim().toLowerCase())),
    [libraryGames]
  );

  const query = search.trim().toLowerCase();
  const visibleGames = useMemo(
    () =>
      query ? freeGames.filter((game) => game.title.toLowerCase().includes(query)) : freeGames,
    [freeGames, query]
  );

  const renderBody = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading games from FreeToGame...</Text>
        </View>
      );
    }
    if (error) {
      return <ErrorView message={error} onRetry={retry} />;
    }
    return (
      <FlatList
        data={visibleGames}
        keyExtractor={(game) => String(game.id)}
        contentContainerStyle={styles.listContent}
        initialNumToRender={6}
        renderItem={({ item }) => (
          <DiscoverListItem
            game={item}
            inLibrary={libraryTitles.has(item.title.trim().toLowerCase())}
            onPress={() => navigation.navigate('DiscoverDetails', { game: item })}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={36} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No games found</Text>
            <Text style={styles.emptyText}>Try another title or category.</Text>
          </View>
        }
        ListFooterComponent={
          <Pressable style={styles.credit} onPress={() => Linking.openURL(FREE_TO_GAME_SITE_URL)}>
            <Text style={styles.creditText}>
              Data provided by <Text style={styles.creditLink}>FreeToGame.com</Text>
            </Text>
          </Pressable>
        }
      />
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.subtitle}>
          Free-to-play games from the FreeToGame public API. Tap one to add it to your library.
        </Text>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search free games..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable hitSlop={8} onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {CATEGORIES.map((item) => {
            const isSelected = item.value === category;
            return (
              <Pressable
                key={item.label}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => selectCategory(item.value)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {!isLoading && !error && (
          <Text style={styles.resultCount}>
            {visibleGames.length} {visibleGames.length === 1 ? 'game' : 'games'}
          </Text>
        )}
      </View>

      {renderBody()}
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
      gap: 12,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    searchInput: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 14,
    },
    chipRow: {
      gap: 8,
      paddingRight: 20,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.surface,
    },
    chipSelected: {
      backgroundColor: colors.primary,
    },
    chipText: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: '500',
    },
    chipTextSelected: {
      color: colors.onPrimary,
      fontWeight: '700',
    },
    resultCount: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    loadingText: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 24,
    },
    separator: {
      height: 14,
    },
    emptyState: {
      alignItems: 'center',
      gap: 8,
      paddingVertical: 48,
    },
    emptyTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    emptyText: {
      color: colors.textSecondary,
      fontSize: 13,
    },
    credit: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    creditText: {
      color: colors.textSecondary,
      fontSize: 12,
    },
    creditLink: {
      color: colors.primary,
      fontWeight: '600',
    },
  });
