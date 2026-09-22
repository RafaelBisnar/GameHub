import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingView } from '@/components/LoadingView';
import { SettingsRow } from '@/components/SettingsRow';
import { StatCard } from '@/components/StatCard';
import { useGames } from '@/context/GameContext';
import { colors } from '@/theme/colors';

const SAMPLE_USER = {
  name: 'Alex Rivera',
  email: 'alex.rivera@gamehub.dev',
};

export function ProfileScreen() {
  const { games, isLoading } = useGames();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const totalGames = games.length;
  const favoriteGames = games.filter((game) => game.isFavorite).length;

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.screenTitle}>Profile</Text>

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color={colors.textPrimary} />
          </View>
          <Text style={styles.name}>{SAMPLE_USER.name}</Text>
          <Text style={styles.email}>{SAMPLE_USER.email}</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard icon="albums" label="Library" value={totalGames} accentColor={colors.primary} />
          <StatCard
            icon="heart"
            label="Favorites"
            value={favoriteGames}
            accentColor={colors.highlight}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.card}>
            <SettingsRow
              icon="notifications-outline"
              label="Notifications"
              right={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: colors.background, true: colors.primary }}
                  thumbColor={colors.textPrimary}
                />
              }
            />
            <SettingsRow
              icon="moon-outline"
              label="Dark Mode"
              subtitle="GameHub is dark themed only"
              right={
                <Switch
                  value
                  disabled
                  trackColor={{ false: colors.background, true: colors.primary }}
                  thumbColor={colors.textPrimary}
                />
              }
            />
            <SettingsRow
              icon="person-circle-outline"
              label="Account Settings"
              right={<Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />}
              onPress={() =>
                Alert.alert(
                  'Account Settings',
                  "Account settings aren't available in this prototype."
                )
              }
            />
            <SettingsRow
              icon="information-circle-outline"
              label="About GameHub"
              right={<Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />}
              showDivider={false}
              onPress={() =>
                Alert.alert(
                  'About GameHub',
                  'GameHub v1.0.0\nA mobile CRUD prototype for browsing and managing an online games library.'
                )
              }
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
    gap: 24,
  },
  screenTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  profileHeader: {
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginBottom: 8,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  email: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
