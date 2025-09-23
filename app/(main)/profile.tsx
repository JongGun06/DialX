import React from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useAppSelector } from '@/hooks/redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme'; // 1. ИМПОРТИРУЕМ ХУК

export default function ProfileScreen() {
  const { theme } = useTheme();
  const Colors = theme;
  const styles = createStyles(Colors);
  
  const currentUser = useAppSelector(selectCurrentUser);
  const hasActiveSubscription = currentUser?.subscriptionStatus === 'ACTIVE';

  if (!currentUser) {
    return <ActivityIndicator size="large" color={Colors.primary} style={styles.container} />;
  }
  
  const avatar = currentUser.avatarUrl || `https://i.pinimg.com/736x/ca/8c/7d/ca8c7de3ae607348b5d3f124eba8a3ee.jpg`;

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <View style={styles.usernameContainer}>
          <Text style={styles.username}>{currentUser.username}</Text>
          {hasActiveSubscription && (
            <Ionicons name="shield-checkmark" size={24} color={Colors.primary} style={{ marginLeft: 8 }}/>
          )}
        </View> 
      </View>
    </View>
  );
}

const createStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surface,
    marginBottom: 16,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
});