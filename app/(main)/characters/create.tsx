import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, ScrollView, Image, Pressable, ActivityIndicator, ImageBackground } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useCreateAiCharacterMutation } from '@/store/services/aiCharactersApi';
import { useUploadFileMutation } from '@/store/services/filesApi';
import StyledInput from '@/components/auth/StyledInput';
import PrimaryButton from '@/components/auth/PrimaryButton';
import { useTheme } from '@/hooks/useTheme';

type FormData = {
  name: string;
  persona: string;
};

const characterSchema = z.object({
  name: z.string().min(3, 'Имя должно быть не менее 3 символов'),
  persona: z.string().min(10, 'Описание должно быть не менее 10 символов'),
});

export default function CreateCharacterScreen() {
  const { theme } = useTheme();
  const Colors = theme;
  const styles = createStyles(Colors);

  const router = useRouter();
  const [createAiCharacter, { isLoading: isCreating }] = useCreateAiCharacterMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const isLoading = isCreating || isUploading;

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(characterSchema),
    mode: 'onBlur',
    defaultValues: { name: '', persona: '' },
  });
  
  const handleSelectAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Ошибка', 'Необходимо разрешение на доступ к галерее.');
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (isLoading) return;
    try {
      let avatarUrl: string | undefined = undefined;
      if (avatarUri) {
        const formData = new FormData();
        formData.append('file', {
          uri: avatarUri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        } as any);
        const uploadResult = await uploadFile(formData).unwrap();
        avatarUrl = uploadResult.url;
      }
      
      await createAiCharacter({ ...data, avatarUrl }).unwrap();
      
      Alert.alert('Успех!', 'Новый персонаж успешно создан.',
        [{ text: 'OK', onPress: () => { reset(); router.back(); } }]
      );
    } catch (error: any) {
      const errorMessage = error.data?.message || 'Не удалось создать персонажа.';
      Alert.alert('Ошибка', errorMessage);
    }
  };

  return (
    <ImageBackground
      source={theme.wallpaperUrl ? { uri: theme.wallpaperUrl } : undefined}
      style={styles.backgroundImage}
      imageStyle={{ opacity: 0.1 }}
      resizeMode="cover"
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 50 }}>
        <Stack.Screen options={{ 
          title: 'Новый персонаж',
          headerStyle: { backgroundColor: Colors.surface },
          headerTintColor: Colors.text,
          headerTransparent: true,
        }} />
        
        <Pressable style={styles.avatarContainer} onPress={handleSelectAvatar}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="camera-outline" size={40} color={Colors.textSecondary} />
            </View>
          )}
          <Text style={styles.avatarText}>Выбрать аватар</Text>
          {isUploading && <View style={styles.avatarOverlay}><ActivityIndicator color={Colors.text} /></View>}
        </Pressable>

        <Text style={styles.label}>Имя Персонажа</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <StyledInput
              label="Например, Шерлок Холмс"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.name?.message}
            />
          )}
        />

        <Text style={styles.label}>Персона (Описание характера)</Text>
        <Controller
          control={control}
          name="persona"
          render={({ field: { onChange, onBlur, value } }) => (
            <StyledInput
              label="Опишите его личность, знания, стиль речи..."
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={errors.persona?.message}
              multiline
              style={styles.textArea}
              containerStyle={{ height: 150, marginBottom: 40 }}
            />
          )}
        />

        <PrimaryButton
          title={isLoading ? 'Создание...' : 'Создать Персонажа'}
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          disabled={isLoading}
        />
      </ScrollView>
    </ImageBackground>
  );
}

const createStyles = (Colors: any) => StyleSheet.create({
  backgroundImage: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  container: { 
    flex: 1, 
    backgroundColor: 'transparent', 
    paddingTop: 120, // Отступ для заголовка
    paddingHorizontal: 16 
  },
  avatarContainer: { 
    alignItems: 'center', 
    marginBottom: 30 
  },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: Colors.surface, 
    marginBottom: 10 
  },
  avatarPlaceholder: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: { 
    color: Colors.primary, 
    fontSize: 16 
  },
  avatarOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: Colors.overlay, 
    borderRadius: 50 
  },
  label: { 
    color: Colors.textSecondary, 
    fontSize: 16, 
    marginBottom: 8, 
    marginLeft: 4 
  },
  textArea: { 
    height: 120, 
    textAlignVertical: 'top', 
    paddingTop: 14 
  },
});