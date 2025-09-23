import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Props extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
}

export default function PrimaryButton({ title, isLoading, style, ...props }: Props) {
  const { theme } = useTheme();
  const Colors = theme;
  const styles = createStyles(Colors);

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: Colors.primary }, style]}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={Colors.text} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (Colors: any) => StyleSheet.create({
  button: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 50,
  },
  text: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});