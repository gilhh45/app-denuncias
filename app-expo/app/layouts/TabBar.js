import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

function BottomButton({ icon, label, active, onPress }) {
  return (
    <TouchableOpacity style={styles.bottomButton} onPress={onPress}>
      <View style={[styles.bottomIconContainer, active && styles.bottomIconActive]}>
        <Text style={[styles.bottomIcon, active && styles.bottomIconTextActive]}>
          {icon}
        </Text>
      </View>
      <Text style={[styles.bottomLabel, active && styles.bottomLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function TabBar({ menuAtivo, mudarMenu }) {
  return (
    <View style={styles.bottomNavigation}>
      <BottomButton
        icon="⌂"
        label="Início"
        active={menuAtivo === 'home'}
        onPress={() => mudarMenu('home')}
      />

      <BottomButton
        icon="◉"
        label="Explorar"
        active={menuAtivo === 'explorar'}
        onPress={() => mudarMenu('explorar')}
      />

      <BottomButton
        icon="♢"
        label="Avisos"
        active={menuAtivo === 'notificacoes'}
        onPress={() => mudarMenu('notificacoes')}
      />

      <BottomButton
        icon="●"
        label="Perfil"
        active={menuAtivo === 'perfil'}
        onPress={() => mudarMenu('perfil')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
    backgroundColor: '#F3EDF7',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 8,
    elevation: 20,
  },
  bottomButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 75,
  },
  bottomIconContainer: {
    width: 55,
    height: 30,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomIconActive: {
    backgroundColor: '#E8DEF8',
  },
  bottomIcon: {
    fontSize: 20,
    color: '#49454F',
  },
  bottomIconTextActive: {
    color: '#21005D',
    fontWeight: '900',
  },
  bottomLabel: {
    marginTop: 4,
    fontSize: 11,
    color: '#49454F',
  },
  bottomLabelActive: {
    color: '#1D1B20',
    fontWeight: '800',
  },
});