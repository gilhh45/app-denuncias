import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';

// Subcomponente de Card Rápido
function QuickCard({ icon, title, subtitle }) {
  return (
    <View style={styles.quickCard}>
      <View style={styles.quickIcon}>
        <Text style={styles.quickEmoji}>{icon}</Text>
      </View>
      <Text style={styles.quickTitle}>{title}</Text>
      <Text style={styles.quickSubtitle}>{subtitle}</Text>
    </View>
  );
}

// Subcomponente de Atividade
function ActivityItem({ icon, title, description, time }) {
  return (
    <View style={styles.activity}>
      <View style={styles.activityIcon}>
        <Text style={styles.activityIconText}>{icon}</Text>
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityDescription}>{description}</Text>
      </View>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
  );
}

// Tela Principal Home
export default function Home() {
  return (
    <View>
      {/* CARD PRINCIPAL */}
      <View style={styles.heroCard}>
        <View style={styles.heroIcon}>
          <Text style={styles.heroEmoji}>🚀</Text>
        </View>

        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Continue explorando</Text>

          <Text style={styles.heroDescription}>
            Seu ambiente React Native + Expo está funcionando perfeitamente.
          </Text>

          <PrimaryButton 
            title="Começar agora" 
            onPress={() => alert('Componente funcionando!')} 
          />
        </View>
      </View>

      {/* ATALHOS */}
      <Text style={styles.sectionTitle}>Acesso rápido</Text>

      <View style={styles.quickGrid}>
        <QuickCard icon="📚" title="Cursos" subtitle="12 disponíveis" />
        <QuickCard icon="📊" title="Relatórios" subtitle="Veja seus dados" />
        <QuickCard icon="🎯" title="Metas" subtitle="4 em andamento" />
        <QuickCard icon="⚙️" title="Configurar" subtitle="Preferências" />
      </View>

      {/* ATIVIDADES */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Atividades recentes</Text>

        <TouchableOpacity>
          <Text style={styles.seeAll}>Ver todas</Text>
        </TouchableOpacity>
      </View>

      <ActivityItem
        icon="✓"
        title="Projeto criado"
        description="Seu novo projeto foi configurado."
        time="Há 5 min"
      />

      <ActivityItem
        icon="★"
        title="Nova conquista"
        description="Você completou uma nova etapa."
        time="Há 1 hora"
      />

      <ActivityItem
        icon="↗"
        title="Atualização disponível"
        description="Existem novos conteúdos para explorar."
        time="Ontem"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  /* HERO */
  heroCard: {
    backgroundColor: '#EADDFF',
    padding: 22,
    borderRadius: 28,
    marginBottom: 30,
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  heroEmoji: {
    fontSize: 28,
  },
  heroContent: {},
  heroTitle: {
    fontSize: 25,
    fontWeight: '800',
    color: '#21005D',
  },
  heroDescription: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#49454F',
  },

  /* SEÇÕES */
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D1B20',
    marginBottom: 15,
  },
  sectionHeader: {
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seeAll: {
    color: '#6750A4',
    fontWeight: '700',
  },

  /* QUICK */
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    elevation: 2,
  },
  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#F3EDF7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  quickEmoji: {
    fontSize: 23,
  },
  quickTitle: {
    fontWeight: '800',
    fontSize: 16,
    color: '#1D1B20',
  },
  quickSubtitle: {
    fontSize: 12,
    color: '#79747E',
    marginTop: 4,
  },

  /* ATIVIDADES */
  activity: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#F3EDF7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIconText: {
    color: '#6750A4',
    fontWeight: '900',
    fontSize: 19,
  },
  activityContent: {
    flex: 1,
    marginLeft: 14,
  },
  activityTitle: {
    fontWeight: '700',
    color: '#1D1B20',
  },
  activityDescription: {
    color: '#79747E',
    fontSize: 12,
    marginTop: 3,
  },
  activityTime: {
    fontSize: 10,
    color: '#999',
  },
});