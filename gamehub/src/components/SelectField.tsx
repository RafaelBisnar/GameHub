import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme, useThemedStyles } from '@/context/ThemeContext';
import type { ThemeColors } from '@/theme/colors';

interface SelectFieldProps {
  label: string;
  value: string | null;
  options: string[];
  placeholder?: string;
  hasError?: boolean;
  onSelect: (value: string) => void;
}

export function SelectField({
  label,
  value,
  options,
  placeholder = 'Select…',
  hasError,
  onSelect,
}: SelectFieldProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        style={[styles.trigger, hasError && styles.triggerError]}
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.triggerText, !value && styles.placeholderText]}>
          {value ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{label}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {options.map((option) => {
              const selected = option === value;
              return (
                <Pressable
                  key={option}
                  style={styles.option}
                  onPress={() => {
                    onSelect(option);
                    setVisible(false);
                  }}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                    {option}
                  </Text>
                  {selected && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: colors.surface,
    },
    triggerError: {
      borderColor: colors.accent,
    },
    triggerText: {
      color: colors.textPrimary,
      fontSize: 14,
    },
    placeholderText: {
      color: colors.textSecondary,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
      maxHeight: '60%',
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
    },
    sheetTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 12,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.background,
    },
    optionText: {
      color: colors.textSecondary,
      fontSize: 15,
    },
    optionTextSelected: {
      color: colors.textPrimary,
      fontWeight: '600',
    },
  });
