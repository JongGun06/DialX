import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { Colors } from '@/constants/Colors';
import PrimaryButton from '@/components/auth/PrimaryButton';
import { useCreateCheckoutSessionMutation } from '@/store/services/stripeApi';
import { useAppSelector } from '@/hooks/redux';
import { selectCurrentUser } from '@/store/slices/authSlice';

const FeatureItem = ({ text }: { text: string }) => (
  <View style={styles.featureItem}>
    <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

export default function PremiumScreen() {
  const [createCheckoutSession, { isLoading }] = useCreateCheckoutSessionMutation();
  const currentUser = useAppSelector(selectCurrentUser);
  const hasActiveSubscription = currentUser?.subscriptionStatus === 'ACTIVE';

  const handleSubscribe = async () => {
    try {
      const { url } = await createCheckoutSession().unwrap();
      const result = await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      Alert.alert('Ошибка', 'Не удалось перейти к оплате. Пожалуйста, попробуйте позже.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen options={{ title: 'DialX Premium' }} />
      
      <View style={styles.header}>
        <Ionicons name="sparkles" size={60} color={Colors.primary} />
        <Text style={styles.title}>Получите Premium</Text>
        <Text style={styles.subtitle}>Разблокируйте все возможности нашего AI-ассистента</Text>
      </View>

      <View style={styles.features}>
        <FeatureItem text="Безлимитное создание AI-персонажей" />
        <FeatureItem text="Доступ к самым продвинутым языковым моделям" />
        <FeatureItem text="Приоритетная поддержка" />
        <FeatureItem text="Ранний доступ к новым функциям" />
      </View>

      {hasActiveSubscription ? (
        <View style={styles.activeSubContainer}>
          <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
          <Text style={styles.activeSubText}>У вас активна Premium подписка!</Text>
          <Text style={styles.footerText}>Спасибо за вашу поддержку.</Text>
        </View>
      ) : (
        <View style={styles.footer}>
          <PrimaryButton
            title="Подписаться за $5.00/мес"
            onPress={handleSubscribe}
            isLoading={isLoading}
          />
          <Text style={styles.footerText}>
            Подписку можно отменить в любой момент.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  features: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureText: {
    color: Colors.text,
    fontSize: 16,
    marginLeft: 16,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
  activeSubContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 8,
  },
  activeSubText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
});