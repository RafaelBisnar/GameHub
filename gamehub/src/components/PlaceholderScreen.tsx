import { StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '@/context/ThemeContext';
import type { ThemeColors } from '@/theme/colors';

interface PlaceholderScreenProps {
  title: string;
}

export function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    title: {
      color: colors.textPrimary,
      fontSize: 20,
      fontWeight: '600',
    },
  });
