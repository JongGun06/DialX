import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, StyleProp, ViewStyle } from 'react-native';
import { defaultTheme as Colors } from '@/constants/Colors'; // <-- ИЗМЕНЕНИЕ

interface Props extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function StyledInput({ label, error, style, containerStyle, ...props }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = props.value && props.value.length > 0;
  
  const labelStyle = {
    position: 'absolute' as 'absolute',
    left: 4,
    top: isFocused || hasValue ? 0 : 22,
    fontSize: isFocused || hasValue ? 12 : 16,
    color: isFocused ? Colors.primary : Colors.textSecondary,
    paddingHorizontal: 4,
    zIndex: 1,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={labelStyle}>{label}</Text>
      <TextInput
        style={[styles.input, { borderBottomColor: isFocused ? Colors.primary : Colors.surface }, style]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor={Colors.textSecondary}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24, position: 'relative' },
  input: { height: 50, borderBottomWidth: 2, color: Colors.text, fontSize: 16, paddingTop: 18, paddingHorizontal: 4 },
  errorText: { color: Colors.error, marginTop: 4, fontSize: 12 },
});