import React, { useState, useEffect } from 'react';
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
import { themes } from '@/constants/Colors';

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { theme, setTheme, themeName } = useTheme();
  const Colors = theme;
  const styles = createStyles(Colors);

  const currentUser = useAppSelector(selectCurrentUser);

  const [username, setUsername] = useState(currentUser?.username || '');
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [updateAvatar, { isLoading: isUpdatingAvatar }] = useUpdateAvatarMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const isAvatarLoading = isUpdatingAvatar || isUploading;

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
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Необходимо разрешение на доступ к галерее.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets || result.assets.length === 0) return;
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
  
  const handleThemeChange = async (newThemeName: keyof typeof themes) => {
    try {
      setTheme(newThemeName);
      await updateProfile({ settings: { theme: newThemeName } }).unwrap();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить тему.');
      setTheme(themeName); 
    }
  };

  const avatar = currentUser?.avatarUrl || `https://i.pravatar.cc/150?u=${currentUser?.id}`;

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
        <Text style={styles.sectionTitle}>Оформление</Text>
        <PrimaryButton 
          title="Тема DialX" 
          onPress={() => handleThemeChange('dialx')} 
          style={{ 
            marginBottom: 10,
            backgroundColor: themeName === 'dialx' ? Colors.primary : Colors.surface 
          }} 
        />
        <PrimaryButton 
          title="Тема Dark" 
          onPress={() => handleThemeChange('dark')} 
          style={{ 
            backgroundColor: themeName === 'dark' ? Colors.primary : Colors.surface 
          }} 
        />
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
    marginBottom: 15 
  },
  label: { 
    color: Colors.textSecondary, 
    fontSize: 16, 
    marginBottom: 8 
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
});