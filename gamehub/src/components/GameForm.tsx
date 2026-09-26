import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { DateField } from '@/components/DateField';
import { FormField } from '@/components/FormField';
import { SelectField } from '@/components/SelectField';
import { useTheme, useThemedStyles } from '@/context/ThemeContext';
import type { ThemeColors } from '@/theme/colors';
import type { GameStatus } from '@/types/Game';
import { parseDateString, toDateString } from '@/utils/date';

const GENRES = ['Action', 'Adventure', 'RPG', 'Strategy', 'Sports', 'Simulation'];
const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Mobile', 'Switch'];
const MULTIPLAYER_TYPES = ['Single Player', 'Co-op', 'PvP', 'PvE', 'Battle Royale'];

export interface GameFormValues {
  title: string;
  image: string;
  genre: string;
  platform: string;
  developer: string;
  releaseDate: string;
  rating: number;
  multiplayerType: string;
  description: string;
  status: GameStatus;
}

type FormErrors = Partial<
  Record<'title' | 'genre' | 'platform' | 'developer' | 'releaseDate' | 'rating', string>
>;

interface GameFormProps {
  // A saved Game when editing, or partial values (e.g. imported from Discover).
  initialValues?: Partial<GameFormValues>;
  submitLabel: string;
  // May return a promise; the submit button shows "Saving..." until it settles.
  onSubmit: (values: GameFormValues) => Promise<void> | void;
  onCancel?: () => void;
}

export function GameForm({ initialValues, submitLabel, onSubmit, onCancel }: GameFormProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [image, setImage] = useState(initialValues?.image ?? '');
  const [genre, setGenre] = useState<string | null>(initialValues?.genre ?? null);
  const [platform, setPlatform] = useState<string | null>(initialValues?.platform ?? null);
  const [developer, setDeveloper] = useState(initialValues?.developer ?? '');
  const [releaseDate, setReleaseDate] = useState(initialValues?.releaseDate ?? '');
  const [ratingText, setRatingText] = useState(initialValues?.rating?.toString() ?? '');
  const [multiplayerType, setMultiplayerType] = useState(
    initialValues?.multiplayerType ?? MULTIPLAYER_TYPES[0]
  );
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [isActive, setIsActive] = useState(initialValues?.status !== 'Inactive');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!title.trim()) nextErrors.title = 'Title is required';
    if (!genre) nextErrors.genre = 'Genre is required';
    if (!platform) nextErrors.platform = 'Platform is required';
    if (!developer.trim()) nextErrors.developer = 'Developer is required';

    // Only reachable on web, where the date is typed; the phone picker always gives a valid date.
    if (releaseDate.trim() && !parseDateString(releaseDate)) {
      nextErrors.releaseDate = 'Enter a valid date (YYYY-MM-DD)';
    }

    if (ratingText.trim()) {
      const value = Number(ratingText.trim());
      if (Number.isNaN(value) || value < 0 || value > 5) {
        nextErrors.rating = 'Rating must be between 0 and 5';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isSubmitting || !validate()) return;

    const slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '') || 'newgame';
    const finalImage = image.trim() || `https://picsum.photos/seed/${slug}/400/600`;
    const finalReleaseDate = releaseDate.trim() || toDateString(new Date());
    const finalRating = ratingText.trim() ? Number(ratingText.trim()) : 0;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        image: finalImage,
        genre: genre as string,
        platform: platform as string,
        developer: developer.trim(),
        releaseDate: finalReleaseDate,
        description: description.trim(),
        rating: finalRating,
        multiplayerType,
        status: isActive ? 'Active' : 'Inactive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FormField label="Game Title" required error={errors.title}>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="e.g. Valorant"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />
        </FormField>

        <FormField label="Cover Image URL">
          <TextInput
            style={styles.input}
            placeholder="https://..."
            placeholderTextColor={colors.textSecondary}
            value={image}
            onChangeText={setImage}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </FormField>

        <FormField label="Genre" required error={errors.genre}>
          <SelectField
            label="Genre"
            value={genre}
            options={GENRES}
            placeholder="Select a genre"
            hasError={Boolean(errors.genre)}
            onSelect={setGenre}
          />
        </FormField>

        <FormField label="Platform" required error={errors.platform}>
          <SelectField
            label="Platform"
            value={platform}
            options={PLATFORMS}
            placeholder="Select a platform"
            hasError={Boolean(errors.platform)}
            onSelect={setPlatform}
          />
        </FormField>

        <FormField label="Developer" required error={errors.developer}>
          <TextInput
            style={[styles.input, errors.developer && styles.inputError]}
            placeholder="e.g. Riot Games"
            placeholderTextColor={colors.textSecondary}
            value={developer}
            onChangeText={setDeveloper}
          />
        </FormField>

        <FormField label="Release Date" error={errors.releaseDate}>
          <DateField
            label="Release Date"
            value={releaseDate}
            placeholder="Select a release date"
            hasError={Boolean(errors.releaseDate)}
            onChange={setReleaseDate}
          />
        </FormField>

        <FormField label="Rating (0-5)" error={errors.rating}>
          <TextInput
            style={[styles.input, errors.rating && styles.inputError]}
            placeholder="e.g. 4.5"
            placeholderTextColor={colors.textSecondary}
            value={ratingText}
            onChangeText={setRatingText}
            keyboardType="decimal-pad"
          />
        </FormField>

        <FormField label="Multiplayer Type">
          <SelectField
            label="Multiplayer Type"
            value={multiplayerType}
            options={MULTIPLAYER_TYPES}
            onSelect={setMultiplayerType}
          />
        </FormField>

        <FormField label="Description">
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What's this game about?"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </FormField>

        <FormField label="Status">
          <View style={styles.statusRow}>
            <Text style={styles.statusText}>{isActive ? 'Active' : 'Inactive'}</Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: colors.switchTrack, true: colors.primary }}
              thumbColor={colors.onPrimary}
            />
          </View>
        </FormField>

        <View style={styles.buttonRow}>
          {onCancel && (
            <Pressable style={styles.cancelButton} onPress={onCancel} disabled={isSubmitting}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          )}
          <Pressable
            style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <Ionicons name="checkmark-circle" size={18} color={colors.onPrimary} />
            )}
            <Text style={styles.submitButtonText}>{isSubmitting ? 'Saving...' : submitLabel}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
      paddingBottom: 48,
      gap: 18,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      color: colors.textPrimary,
      fontSize: 14,
      borderWidth: 1,
      borderColor: colors.surface,
    },
    inputError: {
      borderColor: colors.accent,
    },
    textArea: {
      minHeight: 100,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    statusText: {
      color: colors.textPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    cancelButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: colors.textSecondary,
    },
    cancelButtonText: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    submitButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 6,
    },
    submitButtonText: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    buttonDisabled: {
      opacity: 0.7,
    },
  });
