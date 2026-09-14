import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Subcomponente de Card Grande
function LargeMenuCard({ emoji, title, description }) {
  return (
    <View style={styles.largeCard}>
      <Text style={styles.largeEmoji}>{emoji}</Text>
      <View style={styles.largeContent}>
        <Text style={styles.largeTitle}>{title}</Text>
        <Text style={styles.largeDescription}>{description}</Text>
      </View>
    </View>
  );
}

// Tela Principal Explorar
export default function Explorar() {
  return (
    <View>
      <Text style={styles.pageTitle}>Explorar</Text>

      <Text style={styles.pageDescription}>
        Descubra recursos disponíveis no aplicativo.
      </Text>

      <LargeMenuCard
        emoji="📱"
        title="Aplicativos"
        description="Explore seus aplicativos e projetos."
      />

      <LargeMenuCard
        emoji="🧠"
        title="Aprendizado"
        description="Conteúdos, cursos e materiais."
      />

      <LargeMenuCard
        emoji="📈"
        title="Analytics"
        description="Visualize métricas e desempenho."
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
  largeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  largeEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  largeContent: {
    flex: 1,
  },
  largeTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1D1B20',
  },
  largeDescription: {
    fontSize: 13,
    color: '#79747E',
    marginTop: 4,
  },
});