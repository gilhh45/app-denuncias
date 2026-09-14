import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AppBar({ title, subtitle, userInitials }) {
  return (
    <View style={styles.appBar}>
      <View>
        <Text style={styles.appName}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{userInitials}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appBar: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    fontSize: 23,
    fontWeight: '800',
    color: '#1C1B1F',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 3,
    color: '#79747E',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6750A4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 17,
  },
});