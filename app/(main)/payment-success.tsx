import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import PrimaryButton from '@/components/auth/PrimaryButton';
import { useGetMeQuery } from '@/store/services/profileApi';

export default function PaymentSuccessScreen() {
  const { theme } = useTheme();
  const Colors = theme;
  const styles = createStyles(Colors);
  const router = useRouter();
  const { refetch } = useGetMeQuery();

  useEffect(() => {
    refetch();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Успешно!', headerLeft: () => null }} />
      <Ionicons name="checkmark-circle" size={100} color={Colors.success} />
      <Text style={styles.title}>Оплата прошла успешно!</Text>
      <Text style={styles.subtitle}>Спасибо за вашу поддержку. Premium-статус активирован.</Text>
      <PrimaryButton title="Отлично!" onPress={() => router.replace('/(main)/profile')} />
    </View>
  );
}

const createStyles = (Colors: any) => StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: Colors.background },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginVertical: 16, textAlign: 'center' },
  subtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: 30 },
});