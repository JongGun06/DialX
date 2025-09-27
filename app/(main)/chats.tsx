import React from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { Stack, Link, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useGetChatsQuery } from '@/store/services/chatsApi';
import ChatListItem from '@/components/chat/ChatListItem';
import { useTheme } from '@/hooks/useTheme';
import { useAppSelector } from '@/hooks/redux';
import { selectCurrentUser } from '@/store/slices/authSlice';

export default function ChatsScreen() {
  const { theme } = useTheme();
  const Colors = theme;
  const styles = createStyles(Colors);

  const { data: chats, isLoading, isError, error } = useGetChatsQuery();
  const currentUser = useAppSelector(selectCurrentUser);
  const navigation = useNavigation();

  if (isLoading || !currentUser) {
    return <ActivityIndicator size="large" color={Colors.primary} style={styles.centered} />;
  }

  if (isError) {
    console.error("Ошибка при загрузке чатов:", error);
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Ошибка при загрузке чатов.</Text>
      </View> 
    );
  }

  if (!Array.isArray(chats)) {
     return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Нет доступных чатов.</Text>
      </View> 
    );
  }

  return (
    <ImageBackground
      source={theme.wallpaperUrl ? { uri: theme.wallpaperUrl } : undefined}
      style={styles.backgroundImage}
      imageStyle={{ opacity: 0.1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Stack.Screen
          options={{
            headerStyle: { backgroundColor: Colors.surface },
            headerTintColor: Colors.text,
            headerTransparent: true,
            title: 'Чаты',
            headerLeft: () => (
              <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
                <Ionicons name="menu" size={28} color={Colors.text} style={{ marginLeft: 15 }} />
              </Pressable>
            ),
            headerRight: () => (
              <Link href="/(main)/chats/create" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <Ionicons name="add" size={28} color={Colors.primary} style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }} />
                  )}
                </Pressable>
              </Link>
            ),
          }}
        />
        <FlatList
          data={chats}
          renderItem={({ item }) => <ChatListItem chat={item} />}
          keyExtractor={(item) => item ? item.id : Math.random().toString()}
        />
      </View>
    </ImageBackground>
  );
}

const createStyles = (Colors: any) => StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: { 
    flex: 1, 
    backgroundColor: 'transparent',
    paddingTop: 100,  // Фон теперь прозрачный
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: Colors.background 
  },
  errorText: { 
    color: Colors.error, 
    fontSize: 16 
  },
});