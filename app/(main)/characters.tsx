import React from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, Pressable } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGetAiCharactersQuery } from '@/store/services/aiCharactersApi';
import AiCharacterListItem from '@/components/ai/AiCharacterListItem';
import { useTheme } from '@/hooks/useTheme';

export default function AiCharactersScreen() {
  const { theme } = useTheme();
  const Colors = theme;
  const styles = createStyles(Colors);
  
  const { data: characters, isLoading, isError } = useGetAiCharactersQuery();

  if (isLoading) {
    return <ActivityIndicator size="large" color={Colors.primary} style={styles.centered} />;
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Ошибка при загрузке персонажей.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerRight: () => (
            <Link href="/(main)/characters/create" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Ionicons
                    name="add"
                    size={28}
                    color={Colors.primary}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <FlatList
        data={characters}
        renderItem={({ item }) => <AiCharacterListItem character={item} />}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>У вас пока нет персонажей.</Text>
            <Text style={styles.emptyText}>Нажмите "+", чтобы создать первого.</Text>
          </View>
        )}
      />
    </View>
  );
}

const createStyles = (Colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
});