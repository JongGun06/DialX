// app/(main)/search.tsx

import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, Image, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useSearchUsersQuery } from '@/store/services/profileApi';
import { useCreateOrFindPrivateChatMutation } from '@/store/services/chatsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { Colors } from '@/constants/Colors';
import { Profile } from '@/types/chat';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: users, isLoading: isSearching } = useSearchUsersQuery(debouncedQuery, {
    skip: debouncedQuery.length < 2,
  });

  const [createOrFindChat, { isLoading: isCreatingChat }] = useCreateOrFindPrivateChatMutation();

  const handleSelectUser = async (user: Profile) => {
    try {
      const chat = await createOrFindChat({ profileId: user.id }).unwrap();
      router.push({
        pathname: '/(main)/chat/[id]',
        params: { 
          id: chat.id, 
          name: user.username, 
          isGroup: 'false' 
        },
      });
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать или найти чат.');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Поиск пользователей' }} />
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          placeholder="Найти пользователя по имени..."
          placeholderTextColor={Colors.textSecondary}
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isSearching && <ActivityIndicator style={{ marginTop: 20 }} color={Colors.primary} />}

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable 
            style={styles.userItem} 
            onPress={() => handleSelectUser(item)}
            disabled={isCreatingChat}
          >
            <Image 
              source={{ uri: item.avatarUrl || `https://i.pravatar.cc/150?u=${item.id}` }} 
              style={styles.avatar} 
            />
            <Text style={styles.username}>{item.username}</Text>
          </Pressable>
        )}
        ListEmptyComponent={() =>
          !isSearching && debouncedQuery.length > 1 ? (
            <Text style={styles.emptyText}>Пользователи не найдены.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    margin: 16,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    color: Colors.text,
    fontSize: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  username: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
  },
  emptyText: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
});