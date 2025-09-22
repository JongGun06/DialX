// app/(main)/chats/create.tsx

import React, { useState, useMemo } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, Image, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useSearchUsersQuery } from '@/store/services/profileApi';
import { useGetChatDetailsQuery, useAddMembersToGroupMutation } from '@/store/services/chatsApi';
import { useDebounce } from '@/hooks/useDebounce';
import { Colors } from '@/constants/Colors';
import PrimaryButton from '@/components/auth/PrimaryButton';
import { Profile } from '@/types/chat';

function UserListItem({
  user,
  isSelected,
  onToggle,
}: {
  user: Profile;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const avatar = user.avatarUrl || `https://i.pravatar.cc/150?u=${user.id}`;
  return (
    <Pressable style={styles.userItem} onPress={onToggle}>
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <Text style={styles.username}>{user.username}</Text>
      <Ionicons
        name={isSelected ? 'checkbox' : 'square-outline'}
        size={24}
        color={isSelected ? Colors.primary : Colors.textSecondary}
      />
    </Pressable>
  );
}

export default function CreateChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ chatId?: string }>();
  const isAddingMode = !!params.chatId;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Получаем данные о текущем чате, если мы в режиме добавления
  const { data: currentChat } = useGetChatDetailsQuery(params.chatId!, {
    skip: !isAddingMode,
  });
  const existingMemberIds = useMemo(() => 
    new Set(currentChat?.participants.map(p => p.id)), 
  [currentChat]);

  const { data: users, isLoading: isSearching } = useSearchUsersQuery(debouncedQuery, {
    skip: debouncedQuery.length < 2,
  });

  // Фильтруем пользователей, которые уже есть в чате
  const filteredUsers = useMemo(() => 
    users?.filter(user => !existingMemberIds.has(user.id)),
  [users, existingMemberIds]);

  const [addMembers, { isLoading: isAddingMembers }] = useAddMembersToGroupMutation();

  const handleToggleUser = (userId: string) => {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUserIds(newSelection);
  };

  const handleAction = () => {
    const userIds = Array.from(selectedUserIds);
    if (isAddingMode) {
      // Логика добавления участников
      addMembers({ chatId: params.chatId!, profileIds: userIds })
        .unwrap()
        .then(() => {
          router.back(); // Возвращаемся на экран инфо о группе
        })
        .catch(() => {
          Alert.alert('Ошибка', 'Не удалось добавить участников.');
        });
    } else {
      // Логика создания новой группы
      router.push({
        pathname: '/(main)/chats/finalize',
        params: { userIds: userIds.join(',') },
      });
    }
  };

  const selectedUsersCount = selectedUserIds.size;
  const buttonTitle = isAddingMode 
    ? `Добавить (${selectedUsersCount})`
    : `Создать группу (${selectedUsersCount > 0 ? selectedUsersCount + 1 : ''})`;
  const isButtonDisabled = isAddingMode ? selectedUsersCount === 0 : selectedUsersCount < 1;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: isAddingMode ? 'Добавить участников' : 'Новый чат' }} />
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          placeholder="Поиск пользователей..."
          placeholderTextColor={Colors.textSecondary}
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isSearching && <ActivityIndicator style={{ marginTop: 20 }} color={Colors.primary} />}

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <UserListItem
            user={item}
            isSelected={selectedUserIds.has(item.id)}
            onToggle={() => handleToggleUser(item.id)}
          />
        )}
        ListEmptyComponent={() =>
          !isSearching && debouncedQuery.length > 1 ? ( // <-- ИСПРАВЛЕНИЕ ЗДЕСЬ
            <Text style={styles.emptyText}>Пользователи не найдены.</Text>
          ) : null
        }
      />

      {!isButtonDisabled && (
        <View style={styles.footer}>
          <PrimaryButton
            title={buttonTitle}
            onPress={handleAction}
            isLoading={isAddingMembers}
          />
        </View>
      )}
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
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
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