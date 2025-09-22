import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useAppSelector } from '@/hooks/redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DrawerContent(props: any) {
  const currentUser = useAppSelector(selectCurrentUser);
  const hasActiveSubscription = currentUser?.subscriptionStatus === 'ACTIVE';

  const avatar = currentUser?.avatarUrl || `https://i.pravatar.cc/150?u=${currentUser?.id}`;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <SafeAreaView>
          <Image source={{ uri: avatar }} style={styles.avatar} />
          <View style={styles.usernameContainer}>
            <Text style={styles.username}>{currentUser?.username || 'Username'}</Text>
            {hasActiveSubscription && (
              <Ionicons name="shield-checkmark" size={18} color={Colors.text} style={{ marginLeft: 6 }}/>
            )}
          </View>
        </SafeAreaView>
      </View>

      <DrawerContentScrollView {...props} style={{ backgroundColor: Colors.background, paddingTop: 10 }}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>DialX Messenger v1.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 15,
    backgroundColor: Colors.primary,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: Colors.avatarBorder,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
});