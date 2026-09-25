import { Ionicons } from '@expo/vector-icons';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getErrorMessage } from '@/api/client';
import { useGames } from '@/context/GameContext';
import { useTheme, useThemedStyles } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import type { GamesStackParamList } from '@/navigation/GamesStack';
import type { ThemeColors } from '@/theme/colors';
import { getGameImageSource } from '@/utils/gameImages';

type GameDetailsRouteProp = RouteProp<GamesStackParamList, 'GameDetails'>;
type GameDetailsNavigationProp = NativeStackNavigationProp<GamesStackParamList, 'GameDetails'>;

type IoniconName = keyof typeof Ionicons.glyphMap;

export function GameDetailsScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { params } = useRoute<GameDetailsRouteProp>();
  const navigation = useNavigation<GameDetailsNavigationProp>();
  const { games, toggleFavorite, deleteGame } = useGames();
  const { showToast } = useToast();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const game = games.find((item) => item.id === params.gameId);

  useLayoutEffect(() => {
    navigation.setOptions({ title: game?.title ?? 'Game Details' });
  }, [navigation, game?.title]);

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

  const releaseDate = new Date(game.releaseDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteGame(game.id);
    } catch (error) {
      setIsDeleting(false);
      setDeleteModalVisible(false);
      showToast(getErrorMessage(error), 'error');
      return;
    }
    setDeleteModalVisible(false);
    showToast('Game deleted successfully.', 'success');
    navigation.navigate('GamesList');
  };

  const infoItems: { icon: IoniconName; label: string; value: string }[] = [
    { icon: 'pricetag-outline', label: 'Genre', value: game.genre },
    { icon: 'business-outline', label: 'Developer', value: game.developer },
    { icon: 'hardware-chip-outline', label: 'Platform', value: game.platform },
    { icon: 'calendar-outline', label: 'Release Date', value: releaseDate },
    { icon: 'people-outline', label: 'Multiplayer', value: game.multiplayerType },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <View style={styles.banner}>
        <Image source={getGameImageSource(game.image)} style={styles.bannerImage} />
        <LinearGradient
          colors={['transparent', `${colors.background}F2`]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.bannerContent}>
          <Text style={styles.title}>{game.title}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color={colors.highlight} />
            <Text style={styles.ratingText}>{game.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  game.status === 'Active' ? `${colors.highlight}33` : `${colors.textSecondary}33`,
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: game.status === 'Active' ? colors.highlight : colors.textSecondary },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: game.status === 'Active' ? colors.highlight : colors.textSecondary },
              ]}
            >
              {game.status}
            </Text>
          </View>

          <Pressable style={styles.favoriteButton} onPress={() => toggleFavorite(game.id)}>
            <Ionicons
              name={game.isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={game.isFavorite ? colors.highlight : colors.textSecondary}
            />
          </Pressable>
        </View>

        <View style={styles.infoGrid}>
          {infoItems.map((item) => (
            <View key={item.label} style={styles.infoItem}>
              <View style={styles.infoIconCircle}>
                <Ionicons name={item.icon} size={16} color={colors.primary} />
              </View>
              <View style={styles.infoTextGroup}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {item.value}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{game.description}</Text>
        </View>

        <Pressable
          style={styles.editButton}
          onPress={() => navigation.navigate('EditGame', { gameId: game.id })}
        >
          <Ionicons name="pencil" size={16} color={colors.onPrimary} />
          <Text style={styles.editButtonText}>Edit Game</Text>
        </Pressable>

        <Pressable style={styles.deleteButton} onPress={() => setDeleteModalVisible(true)}>
          <Ionicons name="trash-outline" size={16} color={colors.textPrimary} />
          <Text style={styles.deleteButtonText}>Delete Game</Text>
        </Pressable>
      </View>

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeleting && setDeleteModalVisible(false)}
      >
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCard}>
            <Ionicons name="warning-outline" size={32} color={colors.accent} />
            <Text style={styles.confirmTitle}>Delete Game</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete this game?
            </Text>
            <View style={styles.confirmButtonRow}>
              <Pressable
                style={styles.confirmCancelButton}
                onPress={() => setDeleteModalVisible(false)}
                disabled={isDeleting}
              >
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmDeleteButton, isDeleting && styles.buttonDisabled]}
                onPress={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={colors.onPrimary} />
                ) : (
                  <Text style={styles.confirmDeleteText}>Delete</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 48,
    },
    banner: {
      height: 320,
      justifyContent: 'flex-end',
      overflow: 'hidden',
    },
    bannerImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
      backgroundColor: colors.surface,
    },
    bannerContent: {
      padding: 20,
      gap: 8,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 28,
      fontWeight: '700',
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    ratingText: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
    content: {
      padding: 20,
      gap: 28,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    favoriteButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    infoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      width: '47%',
    },
    infoIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.primary}26`,
    },
    infoTextGroup: {
      flex: 1,
      gap: 2,
    },
    infoLabel: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    infoValue: {
      color: colors.textPrimary,
      fontSize: 13,
      fontWeight: '600',
    },
    section: {
      gap: 10,
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontSize: 17,
      fontWeight: '700',
    },
    description: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 22,
    },
    editButton: {
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
    editButtonText: {
      color: colors.onPrimary,
      fontSize: 15,
      fontWeight: '700',
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 14,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: colors.textSecondary,
    },
    deleteButtonText: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '700',
    },
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
      color: colors.onPrimary,
      fontWeight: '700',
    },
    confirmBackdrop: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: 24,
    },
    confirmCard: {
      width: '100%',
      maxWidth: 340,
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 24,
    },
    confirmTitle: {
      color: colors.textPrimary,
      fontSize: 18,
      fontWeight: '700',
    },
    confirmMessage: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
    confirmButtonRow: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
      marginTop: 8,
    },
    confirmCancelButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.textSecondary,
    },
    confirmCancelText: {
      color: colors.textPrimary,
      fontWeight: '600',
    },
    confirmDeleteButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.accent,
    },
    confirmDeleteText: {
      color: colors.onPrimary,
      fontWeight: '700',
    },
    buttonDisabled: {
      opacity: 0.7,
    },
  });
