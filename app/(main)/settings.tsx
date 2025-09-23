import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput, Pressable, Image, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { selectCurrentUser, logout } from '@/store/slices/authSlice';
import { useUpdateProfileMutation, useUpdateAvatarMutation } from '@/store/services/profileApi';
import { useUploadFileMutation } from '@/store/services/filesApi';
import PrimaryButton from '@/components/auth/PrimaryButton';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '@/hooks/useTheme';
import { colorPalettes, themes } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

// --- v ОПРЕДЕЛЯЕМ ТИПЫ ЗДЕСЬ v ---
type Theme = typeof themes.dialx;
type ThemeColorKey = keyof Theme;

interface ColorCircleProps {
  color: string;
  isSelected: boolean;
  onPress: () => void;
  styles: any;
}

interface ColorSelectorRowProps {
  title: string;
  colorKey: ThemeColorKey;
  palette: string[];
}
// --- ^ ОПРЕДЕЛЯЕМ ТИПЫ ЗДЕСЬ ^ ---

const ColorCircle = ({ color, isSelected, onPress, styles }: ColorCircleProps) => (
  <Pressable onPress={onPress} style={[styles.circle, { backgroundColor: color, borderWidth: isSelected ? 2 : 0 }]} />
);

const ColorSelectorRow = ({ title, colorKey, palette }: ColorSelectorRowProps) => {
  const { theme, updateColor } = useTheme();
  const styles = createStyles(theme);
  
  return (
    <View style={styles.colorRow}>
      <Text style={styles.label}>{title}</Text>
      <View style={styles.palette}>
        {palette.map((color: string) => (
          <ColorCircle 
            key={color}
            color={color}
            isSelected={theme[colorKey] === color}
            onPress={() => updateColor(colorKey, color)}
            styles={styles}
          />
        ))}
      </View>
    </View>
  );
};

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { theme } = useTheme();
  const Colors = theme;
  const styles = createStyles(Colors);

  const currentUser = useAppSelector(selectCurrentUser);

  const [username, setUsername] = useState(currentUser?.username || '');
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [updateAvatar] = useUpdateAvatarMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const isAvatarLoading = isUploading;

  useEffect(() => {
    setUsername(currentUser?.username || '');
  }, [currentUser]);

  const handleSaveUsername = async () => {
    if (username.trim().length < 3) {
      Alert.alert('Ошибка', 'Имя пользователя должно быть не менее 3 символов');
      return;
    }
    try {
      await updateProfile({ username: username.trim() }).unwrap();
      Alert.alert('Успех!', 'Ваши данные обновлены.');
    } catch (error: any) {
      Alert.alert('Ошибка', error.data?.message || 'Не удалось обновить данные.');
    }
  };

  const handleAvatarChange = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets) return;

    const file = result.assets[0];
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.fileName || 'avatar.jpg',
      type: file.mimeType || 'image/jpeg',
    } as any);

    try {
      const uploadResult = await uploadFile(formData).unwrap();
      await updateAvatar({ avatarUrl: uploadResult.url }).unwrap();
      Alert.alert('Успех!', 'Аватар обновлен.');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить аватар.');
    }
  };

  const handleLogout = async () => {
    dispatch(logout());
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    router.replace('/(auth)/login');
  };
  
  const avatar = currentUser?.avatarUrl || `https://i.pinimg.com/736x/ca/8c/7d/ca8c7de3ae607348b5d3f124eba8a3ee.jpg`;

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Настройки' }} />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Аккаунт</Text>
        <Pressable onPress={handleAvatarChange} style={styles.avatarContainer}>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          {isAvatarLoading && (
            <View style={styles.avatarOverlay}><ActivityIndicator color={Colors.text} /></View>
          )}
          <Text style={styles.avatarText}>Изменить фото</Text>
        </Pressable>

        <Text style={styles.label}>Имя пользователя</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} placeholderTextColor={Colors.textSecondary} />
        <PrimaryButton title="Сохранить имя" onPress={handleSaveUsername} isLoading={isUpdatingProfile} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: Colors.text }]}>Оформление</Text>
        <ColorSelectorRow title="Основной цвет" colorKey="primary" palette={colorPalettes.primary} />
        <ColorSelectorRow title="Цвет фона" colorKey="background" palette={colorPalettes.background} />
        <ColorSelectorRow title="Цвет поверхностей" colorKey="surface" palette={colorPalettes.surface} />
        <ColorSelectorRow title="Цвет текста" colorKey="text" palette={colorPalettes.text} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Подписка</Text>
        <Pressable style={styles.menuButton} onPress={() => router.push('/(main)/premium')}>
            <Ionicons name="star-outline" size={22} color={Colors.primary} />
            <Text style={styles.menuButtonText}>Управлять подпиской</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
         <PrimaryButton title="Выйти из аккаунта" onPress={handleLogout} style={{ backgroundColor: Colors.error }} />
      </View>
    </ScrollView>
  );
}

const createStyles = (Colors: any) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background, 
    padding: 16 
  },
  section: { 
    marginBottom: 30 
  },
  sectionTitle: { 
    color: Colors.text, 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginBottom: 20 
  },
  label: { 
    color: Colors.textSecondary, 
    fontSize: 16, 
    marginBottom: 12 
  },
  input: { 
    backgroundColor: Colors.surface, 
    color: Colors.text, 
    padding: 15, 
    borderRadius: 8, 
    fontSize: 16, 
    marginBottom: 15 
  },
  avatarContainer: { 
    alignItems: 'center', 
    marginBottom: 20 
  },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    marginBottom: 10,
    backgroundColor: Colors.surface,
  },
  avatarOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: Colors.overlay, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderRadius: 50 
  },
  avatarText: { 
    color: Colors.primary, 
    fontSize: 16 
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  menuButtonText: {
    color: Colors.text,
    fontSize: 16,
    marginLeft: 15,
  },
  colorRow: { 
    marginBottom: 15 
  },
  palette: { 
    flexDirection: 'row', 
    flexWrap: 'wrap' 
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
    marginBottom: 10,
    borderColor: '#fff',
  },
});