// components/auth/PrimaryButton.tsx
import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { Colors } from '@/constants/Colors';

interface Props extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
}

export default function PrimaryButton({ title, isLoading, style, ...props }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
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

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
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