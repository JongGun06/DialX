import React from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, Pressable } from 'react-native';
import { Stack, Link, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useGetChatsQuery } from '@/store/services/chatsApi';
import ChatListItem from '@/components/chat/ChatListItem';
import { useTheme } from '@/hooks/useTheme';
import { useAppSelector } from '@/hooks/redux'; // <-- ДОБАВЛЕНО
import { selectOnlineUserIds } from '@/store/slices/presenceSlice';

export default function ChatsScreen() {
  const { theme } = useTheme();
  const Colors = theme;
  const styles = createStyles(Colors);

  const { data: chats, isLoading, isError, error } = useGetChatsQuery();
  const onlineUserIds = useAppSelector(selectOnlineUserIds);
  const navigation = useNavigation();

  if (isLoading) {
    return <ActivityIndicator size="large" color={Colors.primary} style={styles.centered} />;
  }

  if (isError) {
    console.error(error);
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Ошибка при загрузке чатов.</Text>
      </View> 
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
              <Ionicons
                name="menu"
                size={28}
                color={Colors.text}
                style={{ marginLeft: 15 }}
              />
            </Pressable>
          ),
          headerRight: () => (
            <Link href="/(main)/chats/create" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Ionicons
                    name="add"
                    size={28}
                    color={Colors.primary}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <FlatList
        data={chats}
        renderItem={({ item }) => <ChatListItem chat={item} />}
        keyExtractor={(item) => item.id}
        extraData={onlineUserIds}
      />
    </View>
  );
}

const createStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
  },
});