import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FavoriteListItem } from '@/components/FavoriteListItem';
import { LoadingView } from '@/components/LoadingView';
import { useGames } from '@/context/GameContext';
import type { RootTabParamList } from '@/navigation/RootTabs';
import { colors } from '@/theme/colors';

export function FavoritesScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList, 'Favorites'>>();
  const { games, isLoading, toggleFavorite } = useGames();

  const favoriteGames = games.filter((game) => game.isFavorite);

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>
          {favoriteGames.length} {favoriteGames.length === 1 ? 'game' : 'games'}
        </Text>
      </View>

      <FlatList
        data={favoriteGames}
        keyExtractor={(game) => game.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <FavoriteListItem game={item} onRemove={() => toggleFavorite(item.id)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={40} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No favorite games yet.</Text>
            <Pressable
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Games', { screen: 'GamesList' })}
            >
              <Text style={styles.exploreButtonText}>Explore Games</Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
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
    gap: 4,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
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
    gap: 12,
    paddingTop: 80,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  exploreButton: {
    marginTop: 4,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  exploreButtonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
});
