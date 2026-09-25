import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';

import { getErrorMessage } from '@/api/client';
import type { GameFormValues } from '@/components/GameForm';
import { GameForm } from '@/components/GameForm';
import { useGames } from '@/context/GameContext';
import { useToast } from '@/context/ToastContext';
import type { AddGameStackParamList } from '@/navigation/AddGameStack';
import type { RootTabParamList } from '@/navigation/RootTabs';

export function AddGameScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AddGameStackParamList, 'AddGame'>>();
  const { addGame } = useGames();
  const { showToast } = useToast();
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (values: GameFormValues) => {
    try {
      await addGame(values);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
      return;
    }
    showToast(`${values.title} has been added to your library.`, 'success');
    setFormKey((key) => key + 1);
    navigation
      .getParent<BottomTabNavigationProp<RootTabParamList>>()
      ?.navigate('Games', { screen: 'GamesList' });
  };

  return <GameForm key={formKey} submitLabel="Add Game" onSubmit={handleSubmit} />;
}
