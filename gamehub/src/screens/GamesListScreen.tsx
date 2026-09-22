import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { GameListItem } from '@/components/GameListItem';
import { LoadingView } from '@/components/LoadingView';
import { useGames } from '@/context/GameContext';
import type { GamesStackParamList } from '@/navigation/GamesStack';
import { colors } from '@/theme/colors';
import type { Game } from '@/types/Game';

type SortKey = 'rating' | 'newest' | 'alphabetical';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'rating', label: 'Highest Rated' },
  { key: 'newest', label: 'Newest' },
  { key: 'alphabetical', label: 'Alphabetical' },
];

const RATING_OPTIONS = [4.5, 4.0, 3.5];

export function GamesListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<GamesStackParamList, 'GamesList'>>();
  const { games, isLoading, toggleFavorite } = useGames();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const availableGenres = useMemo(
    () => Array.from(new Set(games.map((game) => game.genre))).sort(),
    [games]
  );

  const availablePlatforms = useMemo(() => {
    const set = new Set<string>();
    games.forEach((game) => game.platform.split(',').forEach((p) => set.add(p.trim())));
    return Array.from(set).sort();
  }, [games]);

  const activeFilterCount = [selectedGenre, selectedPlatform, minRating].filter(
    (value) => value !== null
  ).length;

  const filteredGames = useMemo(() => {
    let result: Game[] = games;

    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter((game) => game.title.toLowerCase().includes(query));
    }
    if (selectedGenre) {
      result = result.filter((game) => game.genre === selectedGenre);
    }
    if (selectedPlatform) {
      result = result.filter((game) => game.platform.includes(selectedPlatform));
    }
    if (minRating) {
      result = result.filter((game) => game.rating >= minRating);
    }

    const sorted = [...result];
    if (sortBy === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'alphabetical') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    }

    return sorted;
  }, [games, search, selectedGenre, selectedPlatform, minRating, sortBy]);

  const handleClearFilters = () => {
    setSelectedGenre(null);
    setSelectedPlatform(null);
    setMinRating(null);
    setSortBy(null);
  };

  const openDetails = (gameId: string) => {
    navigation.navigate('GameDetails', { gameId });
  };

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search games..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.toolbarRow}>
          <Pressable style={styles.toolbarButton} onPress={() => setFiltersVisible(true)}>
            <Ionicons name="options-outline" size={16} color={colors.textPrimary} />
            <Text style={styles.toolbarButtonText}>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </Text>
          </Pressable>

          <Text style={styles.resultCount}>
            {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}
          </Text>

          {(activeFilterCount > 0 || sortBy) && (
            <Pressable onPress={handleClearFilters}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={filteredGames}
        keyExtractor={(game) => game.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <GameListItem
            game={item}
            onPress={() => openDetails(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="game-controller-outline" size={40} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>
              {games.length === 0 ? 'Your library is empty' : 'No games found'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {games.length === 0
                ? 'Add your first game to get started.'
                : 'Try adjusting your search or filters.'}
            </Text>
          </View>
        }
      />

      <Modal
        visible={filtersVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFiltersVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setFiltersVisible(false)} />
        <View style={styles.modalSheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Sort By</Text>
            <View style={styles.chipRow}>
              {SORT_OPTIONS.map((option) => (
                <Pressable
                  key={option.key}
                  style={[styles.chip, sortBy === option.key && styles.chipSelected]}
                  onPress={() => setSortBy((current) => (current === option.key ? null : option.key))}
                >
                  <Text
                    style={[styles.chipText, sortBy === option.key && styles.chipTextSelected]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.modalTitle}>Genre</Text>
            <View style={styles.chipRow}>
              {availableGenres.map((genre) => (
                <Pressable
                  key={genre}
                  style={[styles.chip, selectedGenre === genre && styles.chipSelected]}
                  onPress={() => setSelectedGenre((current) => (current === genre ? null : genre))}
                >
                  <Text
                    style={[styles.chipText, selectedGenre === genre && styles.chipTextSelected]}
                  >
                    {genre}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.modalTitle}>Platform</Text>
            <View style={styles.chipRow}>
              {availablePlatforms.map((platform) => (
                <Pressable
                  key={platform}
                  style={[styles.chip, selectedPlatform === platform && styles.chipSelected]}
                  onPress={() =>
                    setSelectedPlatform((current) => (current === platform ? null : platform))
                  }
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedPlatform === platform && styles.chipTextSelected,
                    ]}
                  >
                    {platform}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.modalTitle}>Minimum Rating</Text>
            <View style={styles.chipRow}>
              {RATING_OPTIONS.map((value) => (
                <Pressable
                  key={value}
                  style={[styles.chip, minRating === value && styles.chipSelected]}
                  onPress={() => setMinRating((current) => (current === value ? null : value))}
                >
                  <Text style={[styles.chipText, minRating === value && styles.chipTextSelected]}>
                    {value.toFixed(1)}+
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Pressable style={styles.modalSecondaryButton} onPress={handleClearFilters}>
              <Text style={styles.modalSecondaryText}>Clear All</Text>
            </Pressable>
            <Pressable style={styles.modalPrimaryButton} onPress={() => setFiltersVisible(false)}>
              <Text style={styles.modalPrimaryText}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
    gap: 12,
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
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toolbarButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  resultCount: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
  },
  clearText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  separator: {
    height: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 80,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    maxHeight: '75%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 8,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
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
    color: colors.textPrimary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalSecondaryButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  modalSecondaryText: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  modalPrimaryButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  modalPrimaryText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
