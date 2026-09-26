import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/client';
import type { GameFormValues } from '@/components/GameForm';
import { GameForm } from '@/components/GameForm';
import { useGames } from '@/context/GameContext';
import { useTheme, useThemedStyles } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import type { AddGameStackParamList } from '@/navigation/AddGameStack';
import type { RootTabParamList } from '@/navigation/RootTabs';
import type { ThemeColors } from '@/theme/colors';

export function AddGameScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<NativeStackNavigationProp<AddGameStackParamList, 'AddGame'>>();
  const { params } = useRoute<RouteProp<AddGameStackParamList, 'AddGame'>>();
  const { addGame } = useGames();
  const { showToast } = useToast();
  const [formKey, setFormKey] = useState(0);

  const prefill = params?.prefill;

  const clearImport = () => navigation.setParams({ prefill: undefined, importId: undefined });

  const handleSubmit = async (values: GameFormValues) => {
    try {
      await addGame(values);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
      return;
    }
    showToast(`${values.title} has been added to your library.`, 'success');
    clearImport();
    setFormKey((key) => key + 1);
    navigation
      .getParent<BottomTabNavigationProp<RootTabParamList>>()
      ?.navigate('Games', { screen: 'GamesList' });
  };

  return (
    <View style={styles.screen}>
      {prefill && (
        <View style={styles.importBanner}>
          <Ionicons name="cloud-download-outline" size={18} color={colors.primary} />
          <Text style={styles.importText}>
            Imported from FreeToGame. Add a rating, then save it to your library.
          </Text>
          <Pressable hitSlop={8} onPress={clearImport}>
            <Text style={styles.importClear}>Clear</Text>
          </Pressable>
        </View>
      )}
      {/* A new key remounts the form, so it picks up a new import or resets after saving. */}
      <GameForm
        key={`${formKey}-${params?.importId ?? 'blank'}`}
        initialValues={prefill}
        submitLabel="Add Game"
        onSubmit={handleSubmit}
      />
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    importBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginHorizontal: 20,
      marginTop: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: `${colors.primary}1F`,
    },
    importText: {
      flex: 1,
      color: colors.textPrimary,
      fontSize: 13,
      lineHeight: 18,
    },
    importClear: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '700',
    },
  });
