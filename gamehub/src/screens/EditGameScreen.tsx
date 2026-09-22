import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { GameFormValues } from '@/components/GameForm';
import { GameForm } from '@/components/GameForm';
import { useGames } from '@/context/GameContext';
import { useToast } from '@/context/ToastContext';
import type { GamesStackParamList } from '@/navigation/GamesStack';
import { colors } from '@/theme/colors';

type EditGameRouteProp = RouteProp<GamesStackParamList, 'EditGame'>;
type EditGameNavigationProp = NativeStackNavigationProp<GamesStackParamList, 'EditGame'>;

export function EditGameScreen() {
  const { params } = useRoute<EditGameRouteProp>();
  const navigation = useNavigation<EditGameNavigationProp>();
  const { games, updateGame } = useGames();
  const { showToast } = useToast();

  const game = games.find((item) => item.id === params.gameId);

  if (!game) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.textSecondary} />
        <Text style={styles.notFoundText}>Game not found</Text>
        <Pressable style={styles.notFoundButton} onPress={() => navigation.goBack()}>
          <Text style={styles.notFoundButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleSubmit = (values: GameFormValues) => {
    updateGame(game.id, values);
    showToast(`${values.title} has been updated.`, 'success');
    navigation.goBack();
  };

  return (
    <GameForm
      initialValues={game}
      submitLabel="Save Changes"
      onSubmit={handleSubmit}
      onCancel={() => navigation.goBack()}
    />
  );
}

const styles = StyleSheet.create({
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.background,
    padding: 24,
  },
  notFoundText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  notFoundButton: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  notFoundButtonText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
