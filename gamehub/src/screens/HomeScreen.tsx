import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameCard } from '@/components/GameCard';
import { LoadingView } from '@/components/LoadingView';
import { StatCard } from '@/components/StatCard';
import { useGames } from '@/context/GameContext';
import type { RootTabParamList } from '@/navigation/RootTabs';
import { colors } from '@/theme/colors';
import { getGameImageSource } from '@/utils/gameImages';

const GENRES = ['Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Simulation'];

export function HomeScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList, 'Home'>>();
  const { games, isLoading } = useGames();
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const featuredGame = useMemo(
    () => [...games].sort((a, b) => b.rating - a.rating)[0],
    [games]
  );

  const popularGames = useMemo(
    () => [...games].sort((a, b) => b.rating - a.rating).slice(0, 8),
    [games]
  );

  const recentGames = useMemo(
    () =>
      [...games]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 8),
    [games]
  );

  const totalGames = games.length;
  const activeGames = games.filter((game) => game.status === 'Active').length;
  const favoriteGames = games.filter((game) => game.isFavorite).length;

  const handleGenrePress = (genre: string) => {
    setSelectedGenre((current) => (current === genre ? null : genre));
    console.log(`Genre selected: ${genre}`);
  };

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="game-controller" size={22} color={colors.textPrimary} />
          </View>
          <Text style={styles.appTitle}>GameHub</Text>
        </View>

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

        {featuredGame && (
          <Pressable onPress={() => navigation.navigate('Games', { screen: 'GamesList' })}>
            <ImageBackground
              source={getGameImageSource(featuredGame.image)}
              style={styles.featuredBanner}
              imageStyle={styles.featuredImage}
            >
              <LinearGradient
                colors={['transparent', 'rgba(11,14,23,0.95)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.featuredContent}>
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredBadgeText}>FEATURED</Text>
                </View>
                <Text style={styles.featuredTitle} numberOfLines={1}>
                  {featuredGame.title}
                </Text>
                <Text style={styles.featuredMeta} numberOfLines={1}>
                  {featuredGame.genre} • {featuredGame.platform}
                </Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color={colors.highlight} />
                  <Text style={styles.featuredRating}>{featuredGame.rating.toFixed(1)}</Text>
                </View>
              </View>
            </ImageBackground>
          </Pressable>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Games</Text>
          {popularGames.length === 0 ? (
            <Text style={styles.emptyHint}>No games yet.</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {popularGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently Added</Text>
          {recentGames.length === 0 ? (
            <Text style={styles.emptyHint}>No games yet.</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {recentGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Genre</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {GENRES.map((genre) => {
              const isSelected = selectedGenre === genre;
              return (
                <Pressable
                  key={genre}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => handleGenrePress(genre)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {genre}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.statsRow}>
          <StatCard icon="albums" label="Total Games" value={totalGames} accentColor={colors.primary} />
          <StatCard icon="pulse" label="Active Games" value={activeGames} accentColor={colors.accent} />
          <StatCard icon="heart" label="Favorites" value={favoriteGames} accentColor={colors.highlight} />
        </View>

        <Pressable
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('Games', { screen: 'GamesList' })}
        >
          <Text style={styles.viewAllText}>View All Games</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.textPrimary} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
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
  featuredBanner: {
    height: 180,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  featuredImage: {
    borderRadius: 18,
  },
  featuredContent: {
    padding: 16,
    gap: 4,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  featuredBadgeText: {
    color: colors.textPrimary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  featuredTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  featuredMeta: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  featuredRating: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  emptyHint: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  horizontalList: {
    gap: 12,
    paddingRight: 20,
  },
  chipRow: {
    gap: 10,
    paddingRight: 20,
  },
  chip: {
    paddingHorizontal: 16,
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
    color: colors.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  viewAllText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});
