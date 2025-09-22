// app/(main)/_layout.tsx

import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import DrawerContent from '@/components/navigation/DrawerContent';

export default function MainLayout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        drawerType: 'front',
        drawerStyle: {
          backgroundColor: Colors.background,
        },
        drawerActiveTintColor: Colors.primary,
        drawerActiveBackgroundColor: Colors.drawerActiveBackground,
        drawerInactiveTintColor: Colors.textSecondary,
        drawerItemStyle: {
          borderRadius: 8,
        },
        drawerLabelStyle: {
          marginLeft: -8,
        },
        headerStyle: {
          backgroundColor: Colors.surface,
        },
        headerTintColor: Colors.text,
      }}
    >
      <Drawer.Screen
        name="chats"
        options={{
          title: 'Все чаты',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="characters"
        options={{
          title: 'AI Персонажи',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="search"
        options={{
          title: 'Поиск',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: 'Мой профиль',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: 'Настройки',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
      
      {/* Скрытые экраны */}
      <Drawer.Screen name="chat/[id]" options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="characters/[id]" options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="chats/create" options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="chats/finalize" options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="chats/info/[id]" options={{ drawerItemStyle: { display: 'none' } }} />
      <Drawer.Screen name="premium" options={{ drawerItemStyle: { display: 'none' } }} />
      {/* <Drawer.Screen name="settings" options={{ drawerItemStyle: { display: 'none' } }} /> */} 
      {/* ^-- УДАЛИЛ ЭТУ ЛИШНЮЮ СТРОКУ --^ */}
    </Drawer>
  );
}