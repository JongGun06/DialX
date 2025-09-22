// app/(main)/chats.tsx

import React from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, Pressable } from 'react-native';
import { useGetChatsQuery } from '@/store/services/chatsApi';
import ChatListItem from '@/components/chat/ChatListItem';
import { Colors } from '@/constants/Colors';
import { DrawerActions } from '@react-navigation/native'; // <-- ДОБАВЛЕНО
import { Stack, Link, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';


export default function ChatsScreen() {
  const { data: chats, isLoading, isError, error } = useGetChatsQuery();
    const navigation = useNavigation(); // <-- ДОБАВЛЕНО

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
      />
    </View>
  );
}

const styles = StyleSheet.create({
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