import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function StatusBadge({ status }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (status === 'PENDENTE') {
    return (
      <View style={[styles.badge, { backgroundColor: isDark ? '#3b0f0f' : '#ffdad6' }]}>
        <Feather name="alert-circle" size={10} color={isDark ? '#ff8a80' : '#93000a'} />
        <Text style={[styles.label, { color: isDark ? '#ff8a80' : '#93000a' }]}>PENDENTE</Text>
      </View>
    );
  }
  if (status === 'ANÁLISE') {
    return (
      <View style={[styles.badge, { backgroundColor: isDark ? '#1a2e4a' : '#bbd3fd' }]}>
        <Feather name="file-text" size={10} color={isDark ? '#4dabf7' : '#445a7f'} />
        <Text style={[styles.label, { color: isDark ? '#4dabf7' : '#445a7f' }]}>ANÁLISE</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, { backgroundColor: isDark ? '#0a2e1a' : '#008562' }]}>
      <Feather name="check" size={10} color={isDark ? '#51cf66' : '#f5fff8'} />
      <Text style={[styles.label, { color: isDark ? '#51cf66' : '#f5fff8' }]}>CONCLUÍDO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  label: {
    fontFamily: 'JetBrainsMono_700Bold',
    fontSize: 11,
    letterSpacing: 1.2,
  },
});
