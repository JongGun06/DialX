import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import PrimaryButton from '@/components/auth/PrimaryButton';

export default function PaymentCanceledScreen() {
  const { theme } = useTheme();
  const Colors = theme;
  const styles = createStyles(Colors);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Отменено', headerLeft: () => null }} />
      <Ionicons name="close-circle" size={100} color={Colors.error} />
      <Text style={styles.title}>Оплата отменена</Text>
      <Text style={styles.subtitle}>Вы можете вернуться и попробовать снова в любое время.</Text>
      <PrimaryButton title="Вернуться" onPress={() => router.replace('/(main)/premium')} />
    </View>
  );
}

const createStyles = (Colors: any) => StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: Colors.background },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text, marginVertical: 16, textAlign: 'center' },
  subtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', marginBottom: 30 },
});