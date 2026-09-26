import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getErrorMessage } from '@/api/client';
import { FREE_TO_GAME_SITE_URL, freeToGameApi, toGameFormPrefill } from '@/api/freeToGame';
import { useGames } from '@/context/GameContext';
import { useTheme, useThemedStyles } from '@/context/ThemeContext';
import type { DiscoverStackParamList } from '@/navigation/DiscoverStack';
import type { RootTabParamList } from '@/navigation/RootTabs';
import type { ThemeColors } from '@/theme/colors';
import type { FreeGameDetails } from '@/types/FreeGame';
import { formatDisplayDate, parseDateString } from '@/utils/date';

type IoniconName = keyof typeof Ionicons.glyphMap;

const REQUIREMENT_LABELS: { key: keyof NonNullable<FreeGameDetails['minimum_system_requirements']>; label: string }[] = [
  { key: 'os', label: 'OS' },
  { key: 'processor', label: 'Processor' },
  { key: 'memory', label: 'Memory' },
  { key: 'graphics', label: 'Graphics' },
  { key: 'storage', label: 'Storage' },
];

export function DiscoverDetailsScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation =
    useNavigation<NativeStackNavigationProp<DiscoverStackParamList, 'DiscoverDetails'>>();
  const { params } = useRoute<RouteProp<DiscoverStackParamList, 'DiscoverDetails'>>();
  const { games: libraryGames } = useGames();
  const game = params.game;

  const [details, setDetails] = useState<FreeGameDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useLayoutEffect(() => {
    navigation.setOptions({ title: game.title });
  }, [navigation, game.title]);

  // Second FreeToGame request: GET /game?id=… for the full description,
  // screenshots and system requirements.
  useEffect(() => {
    let cancelled = false;
    freeToGameApi.details(game.id).then(
      (result) => {
        if (!cancelled) setDetails(result);
      },
      (loadError: unknown) => {
        if (!cancelled) setError(getErrorMessage(loadError));
      }
    );
    return () => {
      cancelled = true;
    };
  }, [game.id, reloadCount]);

  const retry = () => {
    setError(null);
    setReloadCount((count) => count + 1);
  };

  const inLibrary = libraryGames.some(
    (item) => item.title.trim().toLowerCase() === game.title.trim().toLowerCase()
  );

  const addToLibrary = () => {
    navigation.getParent<BottomTabNavigationProp<RootTabParamList>>()?.navigate('AddGame', {
      screen: 'AddGame',
      params: { prefill: toGameFormPrefill(game), importId: game.id },
    });
  };

  const releaseDate = parseDateString(game.release_date);
  const infoItems: { icon: IoniconName; label: string; value: string }[] = [
    { icon: 'pricetag-outline', label: 'Genre', value: game.genre.trim() },
    { icon: 'hardware-chip-outline', label: 'Platform', value: game.platform },
    { icon: 'business-outline', label: 'Developer', value: game.developer || '—' },
    { icon: 'megaphone-outline', label: 'Publisher', value: game.publisher || '—' },
    {
      icon: 'calendar-outline',
      label: 'Release Date',
      value: releaseDate ? formatDisplayDate(releaseDate) : '—',
    },
  ];

  const requirements = details?.minimum_system_requirements;
  const requirementRows = requirements
    ? REQUIREMENT_LABELS.filter(({ key }) => requirements[key]?.trim())
    : [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <View style={styles.banner}>
        <Image source={{ uri: game.thumbnail }} style={styles.bannerImage} />
        <LinearGradient
          colors={['transparent', `${colors.background}F2`]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.bannerContent}>
          <View style={styles.sourceBadge}>
            <Text style={styles.sourceBadgeText}>FREE TO PLAY</Text>
          </View>
          <Text style={styles.title}>{game.title}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {inLibrary ? (
          <View style={[styles.primaryButton, styles.buttonDisabled]}>
            <Ionicons name="checkmark-circle" size={18} color={colors.onPrimary} />
            <Text style={styles.primaryButtonText}>In Your Library</Text>
          </View>
        ) : (
          <Pressable style={styles.primaryButton} onPress={addToLibrary}>
            <Ionicons name="add-circle" size={18} color={colors.onPrimary} />
            <Text style={styles.primaryButtonText}>Add to My Library</Text>
          </Pressable>
        )}

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
          {details ? (
            <Text style={styles.bodyText}>{details.description.replace(/\r\n/g, '\n').trim()}</Text>
          ) : error ? (
            <View style={styles.inlineError}>
              <Text style={styles.bodyText}>{error}</Text>
              <Pressable onPress={retry}>
                <Text style={styles.linkText}>Try Again</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.inlineLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.bodyText}>{game.short_description}</Text>
            </View>
          )}
        </View>

        {details && details.screenshots.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Screenshots</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.screenshotRow}
            >
              {details.screenshots.map((shot) => (
                <Image key={shot.id} source={{ uri: shot.image }} style={styles.screenshot} />
              ))}
            </ScrollView>
          </View>
        )}

        {requirementRows.length > 0 && requirements && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Minimum System Requirements</Text>
            <View style={styles.card}>
              {requirementRows.map(({ key, label }, index) => (
                <View
                  key={key}
                  style={[styles.requirementRow, index > 0 && styles.requirementDivider]}
                >
                  <Text style={styles.requirementLabel}>{label}</Text>
                  <Text style={styles.requirementValue}>{requirements[key]?.trim()}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Pressable
          style={styles.secondaryButton}
          onPress={() => Linking.openURL(game.freetogame_profile_url || FREE_TO_GAME_SITE_URL)}
        >
          <Ionicons name="open-outline" size={16} color={colors.textPrimary} />
          <Text style={styles.secondaryButtonText}>Open on FreeToGame</Text>
        </Pressable>

        <Text style={styles.credit}>Data provided by FreeToGame.com</Text>
      </View>
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
      height: 240,
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
    sourceBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.accent,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    sourceBadgeText: {
      color: colors.onPrimary,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 26,
      fontWeight: '700',
    },
    content: {
      padding: 20,
      gap: 24,
    },
    primaryButton: {
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
    buttonDisabled: {
      opacity: 0.6,
    },
    primaryButtonText: {
      color: colors.onPrimary,
      fontSize: 15,
      fontWeight: '700',
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
    bodyText: {
      color: colors.textSecondary,
      fontSize: 14,
      lineHeight: 22,
    },
    inlineLoading: {
      gap: 10,
      alignItems: 'flex-start',
    },
    inlineError: {
      gap: 6,
    },
    linkText: {
      color: colors.primary,
      fontWeight: '700',
    },
    screenshotRow: {
      gap: 12,
      paddingRight: 20,
    },
    screenshot: {
      width: 260,
      height: 146,
      borderRadius: 12,
      backgroundColor: colors.surface,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingHorizontal: 14,
    },
    requirementRow: {
      paddingVertical: 12,
      gap: 2,
    },
    requirementDivider: {
      borderTopWidth: 1,
      borderTopColor: colors.background,
    },
    requirementLabel: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    requirementValue: {
      color: colors.textPrimary,
      fontSize: 13,
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 14,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: colors.textSecondary,
    },
    secondaryButtonText: {
      color: colors.textPrimary,
      fontSize: 15,
      fontWeight: '700',
    },
    credit: {
      color: colors.textSecondary,
      fontSize: 12,
      textAlign: 'center',
    },
  });
