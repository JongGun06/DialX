import React from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
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
    <ImageBackground
      source={theme.wallpaperUrl ? { uri: theme.wallpaperUrl } : undefined}
      style={styles.backgroundImage}
      imageStyle={{ opacity: 0.1 }}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Stack.Screen 
          options={{
            headerStyle: { backgroundColor: Colors.surface },
            headerTintColor: Colors.text,
            headerTransparent: true,
            title: 'AI Персонажи',
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
    </ImageBackground>
  );
}

const createStyles = (Colors: any) => StyleSheet.create({
  backgroundImage: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingTop: 100
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent',
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