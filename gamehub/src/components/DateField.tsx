import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme, useThemedStyles } from '@/context/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import { formatDisplayDate, parseDateString, toDateString } from '@/utils/date';

interface DateFieldProps {
  label: string;
  // 'YYYY-MM-DD', or '' when nothing is picked yet
  value: string;
  placeholder?: string;
  hasError?: boolean;
  onChange: (value: string) => void;
}

// Opens the phone's native calendar: a dialog on Android, a bottom sheet on iOS.
export function DateField({
  label,
  value,
  placeholder = 'Select a date',
  hasError,
  onChange,
}: DateFieldProps) {
  const { colors, mode } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [iosSheetVisible, setIosSheetVisible] = useState(false);
  const [iosDraft, setIosDraft] = useState(new Date());

  const selectedDate = parseDateString(value);

  // The native picker doesn't exist in browsers, so web keeps a text box.
  if (Platform.OS === 'web') {
    return (
      <TextInput
        style={[styles.webInput, hasError && styles.triggerError]}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
      />
    );
  }

  const openPicker = () => {
    const initial = selectedDate ?? new Date();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initial,
        mode: 'date',
        onValueChange: (_event, date) => onChange(toDateString(date)),
      });
    } else {
      setIosDraft(initial);
      setIosSheetVisible(true);
    }
  };

  const confirmIosDate = () => {
    onChange(toDateString(iosDraft));
    setIosSheetVisible(false);
  };

  return (
    <>
      <Pressable style={[styles.trigger, hasError && styles.triggerError]} onPress={openPicker}>
        <Text style={[styles.triggerText, !selectedDate && styles.placeholderText]}>
          {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
      </Pressable>

      {Platform.OS === 'ios' && (
        <Modal
          visible={iosSheetVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIosSheetVisible(false)}
        >
          <Pressable style={styles.backdrop} onPress={() => setIosSheetVisible(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <Pressable hitSlop={8} onPress={confirmIosDate}>
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={iosDraft}
              mode="date"
              display="inline"
              themeVariant={mode}
              accentColor={colors.primary}
              onValueChange={(_event, date) => setIosDraft(date)}
            />
          </View>
        </Modal>
      )}
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
    webInput: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      color: colors.textPrimary,
      fontSize: 14,
      borderWidth: 1,
      borderColor: colors.surface,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: 36,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    sheetTitle: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    doneText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '700',
    },
  });
