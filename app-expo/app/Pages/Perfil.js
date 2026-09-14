import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Subcomponente de Opção de Menu
function ProfileOption({ icon, title, onPress }) {
  return (
    <TouchableOpacity style={styles.profileOption} onPress={onPress}>
      <Text style={styles.profileOptionIcon}>{icon}</Text>
      <Text style={styles.profileOptionText}>{title}</Text>
      <Text style={styles.profileOptionArrow}>›</Text>
    </TouchableOpacity>
  );
}

// Tela Principal Perfil
export default function Perfil() {
  return (
    <View>
      <View style={styles.profileHeader}>
        <View style={styles.largeAvatar}>
          <Text style={styles.largeAvatarText}>AS</Text>
        </View>

        <Text style={styles.profileName}>Anderson</Text>

        <Text style={styles.profileEmail}>
          Desenvolvedor React Native
        </Text>
      </View>

      <View style={styles.profileMenu}>
        <ProfileOption icon="👤" title="Minha conta" />
        <ProfileOption icon="🔔" title="Notificações" />
        <ProfileOption icon="🎨" title="Aparência" />
        <ProfileOption icon="🔒" title="Privacidade" />
        <ProfileOption icon="⚙️" title="Configurações" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6750A4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  largeAvatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D1B20',
  },
  profileEmail: {
    fontSize: 14,
    color: '#79747E',
    marginTop: 4,
  },
  profileMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 10,
    elevation: 2,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EDF7',
  },
  profileOptionIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  profileOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1D1B20',
  },
  profileOptionArrow: {
    fontSize: 22,
    color: '#79747E',
  },
});