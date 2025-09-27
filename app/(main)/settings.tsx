import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { selectCurrentUser, logout } from "@/store/slices/authSlice";
import {
  useUpdateProfileMutation,
  useUpdateAvatarMutation,
} from "@/store/services/profileApi";
import { useUploadFileMutation } from "@/store/services/filesApi";
import PrimaryButton from "@/components/auth/PrimaryButton";
import * as SecureStore from "expo-secure-store";
import { useTheme } from "@/hooks/useTheme";
import { palettes, themes } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "@/context/ThemeContext";

type ThemeColorKey = keyof Omit<Theme, "wallpaperUrl">;

const ColorCircle = ({
  color,
  isSelected,
  onPress,
  styles,
}: {
  color: string;
  isSelected: boolean;
  onPress: () => void;
  styles: any;
}) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.circle,
      { backgroundColor: color, borderWidth: isSelected ? 2 : 0 },
    ]}
  />
);

const ColorSelectorRow = ({
  title,
  colorKey,
  palette,
}: {
  title: string;
  colorKey: ThemeColorKey;
  palette: string[];
}) => {
  const { theme, updateColor } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.colorRow}>
      <Text style={styles.label}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
      </ScrollView>
    </View>
  );
};

const WallpaperCircle = ({
  url,
  isSelected,
  onPress,
  styles,
}: {
  url: string;
  isSelected: boolean;
  onPress: () => void;
  styles: any;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.wallpaperCircle, { borderWidth: isSelected ? 3 : 0 }]}
  >
    <Image source={{ uri: url }} style={styles.wallpaperImage} />
  </Pressable>
);

const WallpaperSelectorRow = ({
  title,
  palette,
}: {
  title: string;
  palette: string[];
}) => {
  const { theme, updateWallpaper } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.colorRow}>
      <View style={styles.rowHeader}>
        <Text style={styles.label}>{title}</Text>
        <Pressable onPress={() => updateWallpaper(null)}>
          <Text style={{ color: theme.primary }}>Сбросить</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {palette.map((url) => (
          <WallpaperCircle
            key={url}
            url={url}
            isSelected={theme.wallpaperUrl === url}
            onPress={() => updateWallpaper(url)}
            styles={styles}
          />
        ))}
      </ScrollView>
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

  const [username, setUsername] = useState(currentUser?.username || "");
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateProfileMutation();
  const [updateAvatar] = useUpdateAvatarMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const isAvatarLoading = isUploading;

  useEffect(() => {
    setUsername(currentUser?.username || "");
  }, [currentUser]);

  const handleSaveUsername = async () => {
    if (username.trim().length < 3)
      return Alert.alert(
        "Ошибка",
        "Имя пользователя должно быть не менее 3 символов"
      );
    try {
      await updateProfile({ username: username.trim() }).unwrap();
      Alert.alert("Успех!", "Ваши данные обновлены.");
    } catch (error: any) {
      Alert.alert(
        "Ошибка",
        error.data?.message || "Не удалось обновить данные."
      );
    }
  };

  const handleAvatarChange = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets) return;
    const file = result.assets[0];
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.fileName || "avatar.jpg",
      type: file.mimeType || "image/jpeg",
    } as any);
    try {
      const uploadResult = await uploadFile(formData).unwrap();
      await updateAvatar({ avatarUrl: uploadResult.url }).unwrap();
      Alert.alert("Успех!", "Аватар обновлен.");
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось обновить аватар.");
    }
  };

  const handleLogout = async () => {
    dispatch(logout());
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    router.replace("/(auth)/login");
  };

  const avatar =
    currentUser?.avatarUrl ||
    `https://i.pinimg.com/736x/ca/8c/7d/ca8c7de3ae607348b5d3f124eba8a3ee.jpg`;

  return (
    <ImageBackground
      source={theme.wallpaperUrl ? { uri: theme.wallpaperUrl } : undefined}
      style={styles.backgroundImage}
      imageStyle={{ opacity: 0.1 }}
      resizeMode="cover"
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <Stack.Screen
          options={{
            title: "Настройки",
            headerStyle: { backgroundColor: Colors.surface },
            headerTintColor: Colors.text,
            headerTransparent: true,
          }}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Аккаунт</Text>
          <Pressable
            onPress={handleAvatarChange}
            style={styles.avatarContainer}
          >
            <Image source={{ uri: avatar }} style={styles.avatar} />
            {isAvatarLoading && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color={Colors.text} />
              </View>
            )}
            <Text style={styles.avatarText}>Изменить фото</Text>
          </Pressable>

          <Text style={styles.label}>Имя пользователя</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholderTextColor={Colors.textSecondary}
          />
          <PrimaryButton
            title="Сохранить имя"
            onPress={handleSaveUsername}
            isLoading={isUpdatingProfile}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Оформление</Text>
          <WallpaperSelectorRow
            title="Обои чата"
            palette={palettes.wallpapers}
          />
          <ColorSelectorRow
            title="Основной цвет"
            colorKey="primary"
            palette={palettes.colors.primary}
          />
          <ColorSelectorRow
            title="Цвет фона"
            colorKey="background"
            palette={palettes.colors.background}
          />
          <ColorSelectorRow
            title="Цвет поверхностей"
            colorKey="surface"
            palette={palettes.colors.surface}
          />
          <ColorSelectorRow
            title="Цвет текста"
            colorKey="text"
            palette={palettes.colors.text}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Подписка</Text>
          <Pressable
            style={styles.menuButton}
            onPress={() => router.push("/(main)/premium")}
          >
            <Ionicons name="star-outline" size={22} color={Colors.primary} />
            <Text style={styles.menuButtonText}>Управлять подпиской</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <PrimaryButton
            title="Выйти из аккаунта"
            onPress={handleLogout}
            style={{ backgroundColor: Colors.error }}
          />
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const createStyles = (Colors: any) =>
  StyleSheet.create({
    backgroundImage: { flex: 1, backgroundColor: Colors.background },
    container: {
      flex: 1,
      backgroundColor: "transparent",
      paddingTop: 100,
      paddingHorizontal: 16,
    },
    section: { marginBottom: 30 },
    sectionTitle: {
      color: Colors.text,
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 20,
    },
    label: { color: Colors.textSecondary, fontSize: 16, marginBottom: 12 },
    input: {
      backgroundColor: Colors.surface,
      color: Colors.text,
      padding: 15,
      borderRadius: 8,
      fontSize: 16,
      marginBottom: 15,
    },
    avatarContainer: { alignItems: "center", marginBottom: 20 },
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
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 50,
    },
    avatarText: { color: Colors.primary, fontSize: 16 },
    menuButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors.surface,
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    menuButtonText: { color: Colors.text, fontSize: 16, marginLeft: 15 },
    colorRow: { marginBottom: 20 },
    palette: { flexDirection: "row" },
    rowHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
      paddingRight: 10,
    },
    circle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 15,
      borderColor: Colors.primary,
      
    },
    wallpaperCircle: {
      width: 70,
      height: 100,
      borderRadius: 8,
      marginRight: 15,
      borderColor: Colors.primary,
      overflow: "hidden",
    },
    wallpaperImage: { width: "100%", height: "100%" },
  });
