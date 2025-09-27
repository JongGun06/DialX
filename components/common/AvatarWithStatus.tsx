import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useAppSelector } from '@/hooks/redux';
import { selectOnlineUserIds } from '@/store/slices/presenceSlice';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  avatarUrl?: string | null;
  userId: string;
  size: number;
};

export default function AvatarWithStatus({ avatarUrl, userId, size }: Props) {
  const { theme } = useTheme();
  const Colors = theme;
  const onlineUserIds = useAppSelector(selectOnlineUserIds);
  const isOnline = onlineUserIds.includes(userId);

  const defaultAvatar = `https://i.pinimg.com/736x/ca/8c/7d/ca8c7de3ae607348b5d3f124eba8a3ee.jpg`;

  return (
    <View>
      <Image
        source={{ uri: avatarUrl || defaultAvatar }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
      {isOnline && (
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: Colors.success,
              borderColor: Colors.background,
              right: size * 0.05,
              bottom: size * 0.05,
              width: size * 0.25,
              height: size * 0.25,
              borderRadius: size * 0.125,
              borderWidth: size * 0.04,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  statusIndicator: {
    position: 'absolute',
  },
});