import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Pressable, Alert, ImageBackground } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useGetChatDetailsQuery, useUpdateGroupAvatarMutation, useRemoveMemberFromGroupMutation } from '@/store/services/chatsApi';
import { useUploadFileMutation } from '@/store/services/filesApi';
import { useAppSelector } from '@/hooks/redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { useTheme } from '@/hooks/useTheme'; // <-- ШАГ 1
import { Profile } from '@/types/chat';

function MemberListItem({ 
  member,
  isCurrentUser,
  onRemove,
}: { 
  member: Profile,
  isCurrentUser: boolean,
  onRemove: () => void,
}) {
  const { theme } = useTheme(); // <-- ШАГ 2
  const Colors = theme;
  const styles = createStyles(Colors); 
  const avatar = member.avatarUrl || `https://i.pinimg.com/736x/ca/8c/7d/ca8c7de3ae607348b5d3f124eba8a3ee.jpg`;
  return (
    <View style={styles.memberItem}>
      <Image source={{ uri: avatar }} style={styles.memberAvatar} />
      <Text style={styles.memberName}>{member.username}</Text>
      {!isCurrentUser && (
        <Pressable onPress={onRemove} hitSlop={10}>
          <Ionicons name="close-circle" size={24} color={Colors.error} />
        </Pressable>
      )}
    </View>
  );
}

export default function GroupInfoScreen() {
  const { theme } = useTheme(); // <-- ШАГ 2
  const Colors = theme;
  const styles = createStyles(Colors); 
  const router = useRouter();
  const { id: chatId } = useLocalSearchParams<{ id: string }>();
  const currentUser = useAppSelector(selectCurrentUser);
  const { data: chat, isLoading: isChatLoading, isError } = useGetChatDetailsQuery(chatId!);
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [updateGroupAvatar, { isLoading: isUpdating }] = useUpdateGroupAvatarMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberFromGroupMutation();
  const isLoading = isChatLoading || isUploading || isUpdating;

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

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }

    const file = result.assets[0];
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.fileName || 'avatar.jpg',
      type: file.mimeType || 'image/jpeg',
    } as any);

    try {
      const uploadResult = await uploadFile(formData).unwrap();
      await updateGroupAvatar({ chatId: chatId!, avatarUrl: uploadResult.url }).unwrap();
    } catch (error) {
      console.error('Failed to update group avatar:', error);
      Alert.alert('Ошибка', 'Не удалось обновить аватар группы.');
    }
  };

  const handleRemoveMember = (member: Profile) => {
    Alert.alert(
      'Удалить участника',
      `Вы уверены, что хотите удалить ${member.username} из группы?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive', 
          onPress: () => {
            removeMember({ chatId: chatId!, memberId: member.id }).unwrap().catch(() => {
                Alert.alert('Ошибка', 'Не удалось удалить участника.');
            });
          }
        }
      ]
    )
  };

  if (isChatLoading) {
    return <ActivityIndicator size="large" color={Colors.primary} style={styles.centered} />;
  }

  if (isError || !chat) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Не удалось загрузить информацию о группе.</Text>
      </View>
    );
  }

  const groupAvatar = chat.avatarUrl || `https://i.pinimg.com/736x/ca/8c/7d/ca8c7de3ae607348b5d3f124eba8a3ee.jpg`;

  return (
  <ImageBackground
    source={theme.wallpaperUrl ? { uri: theme.wallpaperUrl } : undefined}
    style={styles.backgroundImage}
    imageStyle={{ opacity: 0.1 }}
    resizeMode="cover"
  >
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Инфо о группе' }} />
      <FlatList
        data={chat.participants || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MemberListItem 
            member={item}
            isCurrentUser={item.id === currentUser?.id}
            onRemove={() => handleRemoveMember(item)}
          />
        )}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Pressable onPress={handleAvatarChange} disabled={isUploading || isUpdating}>
              <Image source={{ uri: groupAvatar }} style={styles.groupAvatar} />
              {(isUploading || isUpdating) && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator color={Colors.text} />
                </View>
              )}
            </Pressable>
            <Text style={styles.groupName}>{chat.name}</Text>
            <Text style={styles.memberCount}>{chat.participants?.length ?? 0} участников</Text>
          </View>
        }
        ListFooterComponent={
          <Pressable 
            style={styles.addButton}
            onPress={() => router.push({
                pathname: '/(main)/chats/create',
                params: { chatId }
            })}
          >
            <Ionicons name="person-add-outline" size={24} color={Colors.primary} />
            <Text style={styles.addButtonText}>Добавить участника</Text>
          </Pressable>
        }
      />
    </View>
  </ImageBackground>
);

}

const createStyles = (Colors: any) => StyleSheet.create({ // <-- ШАГ 3 (часть 1)
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 16,
  },
  headerContainer: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  groupAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  groupName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  memberCount: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberName: {
    color: Colors.text,
    fontSize: 16,
  },
  errorText: {
    color: Colors.error,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
  },
  addButtonText: {
    color: Colors.primary,
    fontSize: 16,
    marginLeft: 12,
  },
  backgroundImage: {
  flex: 1,
  backgroundColor: Colors.background,
},

});