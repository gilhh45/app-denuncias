import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Subcomponente de Notificação Individual
function Notification({ emoji, title, description }) {
  return (
    <View style={styles.notificationCard}>
      <Text style={styles.notificationEmoji}>{emoji}</Text>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{title}</Text>
        <Text style={styles.notificationDescription}>{description}</Text>
      </View>
    </View>
  );
}

// Tela Principal Notificações
export default function Notificacoes() {
  return (
    <View>
      <Text style={styles.pageTitle}>Notificações</Text>

      <Text style={styles.pageDescription}>
        Acompanhe as novidades do aplicativo.
      </Text>

      <Notification
        emoji="🎉"
        title="Parabéns!"
        description="Você desbloqueou uma nova conquista."
      />

      <Notification
        emoji="📢"
        title="Novo conteúdo"
        description="Um novo material foi disponibilizado."
      />

      <Notification
        emoji="⚡"
        title="Atualização"
        description="Seu aplicativo está rodando com Expo."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1D1B20',
    marginBottom: 6,
  },
  pageDescription: {
    fontSize: 14,
    color: '#79747E',
    marginBottom: 20,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  notificationEmoji: {
    fontSize: 28,
    marginRight: 14,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1B20',
  },
  notificationDescription: {
    fontSize: 13,
    color: '#79747E',
    marginTop: 2,
  },
});