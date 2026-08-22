import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type MenuItem = 'home' | 'explorar' | 'notificacoes' | 'perfil';

export default function Index() {
  const [menuAtivo, setMenuAtivo] = useState<MenuItem>('home');

  const mudarMenu = (menu: MenuItem) => {
    setMenuAtivo(menu);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F7FF" />

      {/* APP BAR */}
      <View style={styles.appBar}>
        <View>
          <Text style={styles.appName}>Meu Android App</Text>
          <Text style={styles.subtitle}>Bem-vindo de volta 👋</Text>
        </View>

        <TouchableOpacity style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </TouchableOpacity>
      </View>

      {/* CONTEÚDO */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {menuAtivo === 'home' && <Home />}
        {menuAtivo === 'explorar' && <Explorar />}
        {menuAtivo === 'notificacoes' && <Notificacoes />}
        {menuAtivo === 'perfil' && <Perfil />}
      </ScrollView>

      {/* MENU INFERIOR */}
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
    </SafeAreaView>
  );
}

/* =========================================================
   HOME
========================================================= */

function Home() {
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

          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Começar agora</Text>
          </TouchableOpacity>
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

/* =========================================================
   EXPLORAR
========================================================= */

function Explorar() {
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

/* =========================================================
   NOTIFICAÇÕES
========================================================= */

function Notificacoes() {
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

/* =========================================================
   PERFIL
========================================================= */

function Perfil() {
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

/* =========================================================
   COMPONENTES
========================================================= */

function BottomButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.bottomButton} onPress={onPress}>
      <View
        style={[
          styles.bottomIconContainer,
          active && styles.bottomIconActive,
        ]}
      >
        <Text
          style={[
            styles.bottomIcon,
            active && styles.bottomIconTextActive,
          ]}
        >
          {icon}
        </Text>
      </View>

      <Text
        style={[
          styles.bottomLabel,
          active && styles.bottomLabelActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function QuickCard({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) {
  return (
    <TouchableOpacity style={styles.quickCard}>
      <View style={styles.quickIcon}>
        <Text style={styles.quickEmoji}>{icon}</Text>
      </View>

      <Text style={styles.quickTitle}>{title}</Text>

      <Text style={styles.quickSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

function ActivityItem({
  icon,
  title,
  description,
  time,
}: {
  icon: string;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <TouchableOpacity style={styles.activity}>
      <View style={styles.activityIcon}>
        <Text style={styles.activityIconText}>{icon}</Text>
      </View>

      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{title}</Text>

        <Text style={styles.activityDescription}>
          {description}
        </Text>
      </View>

      <Text style={styles.activityTime}>{time}</Text>
    </TouchableOpacity>
  );
}

function LargeMenuCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <TouchableOpacity style={styles.largeMenuCard}>
      <View style={styles.largeMenuIcon}>
        <Text style={styles.largeMenuEmoji}>{emoji}</Text>
      </View>

      <View style={styles.largeMenuContent}>
        <Text style={styles.largeMenuTitle}>{title}</Text>

        <Text style={styles.largeMenuDescription}>
          {description}
        </Text>
      </View>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

function Notification({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.notification}>
      <View style={styles.notificationIcon}>
        <Text style={styles.notificationEmoji}>{emoji}</Text>
      </View>

      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{title}</Text>

        <Text style={styles.notificationDescription}>
          {description}
        </Text>
      </View>
    </View>
  );
}

function ProfileOption({
  icon,
  title,
}: {
  icon: string;
  title: string;
}) {
  return (
    <TouchableOpacity style={styles.profileOption}>
      <Text style={styles.profileOptionIcon}>{icon}</Text>

      <Text style={styles.profileOptionText}>{title}</Text>

      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

/* =========================================================
   ESTILOS
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F7FF',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  /* APP BAR */

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

  primaryButton: {
    alignSelf: 'flex-start',
    marginTop: 20,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 25,
    backgroundColor: '#6750A4',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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

  /* PÁGINAS */

  pageTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1D1B20',
    marginTop: 10,
  },

  pageDescription: {
    marginTop: 5,
    marginBottom: 25,
    fontSize: 15,
    color: '#79747E',
  },

  /* LARGE MENU */

  largeMenuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 17,
    marginBottom: 12,
  },

  largeMenuIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3EDF7',
  },

  largeMenuEmoji: {
    fontSize: 26,
  },

  largeMenuContent: {
    flex: 1,
    marginLeft: 15,
  },

  largeMenuTitle: {
    fontSize: 17,
    fontWeight: '800',
  },

  largeMenuDescription: {
    fontSize: 13,
    marginTop: 3,
    color: '#79747E',
  },

  arrow: {
    fontSize: 30,
    color: '#79747E',
  },

  /* NOTIFICAÇÕES */

  notification: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 17,
    borderRadius: 20,
    marginBottom: 12,
  },

  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: '#F3EDF7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  notificationEmoji: {
    fontSize: 24,
  },

  notificationContent: {
    flex: 1,
    marginLeft: 15,
  },

  notificationTitle: {
    fontWeight: '800',
    fontSize: 16,
  },

  notificationDescription: {
    color: '#79747E',
    marginTop: 4,
  },

  /* PERFIL */

  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  largeAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#6750A4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  largeAvatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 25,
  },

  profileName: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 15,
  },

  profileEmail: {
    color: '#79747E',
    marginTop: 5,
  },

  profileMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
  },

  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 17,
    borderBottomWidth: 1,
    borderBottomColor: '#F1EEF5',
  },

  profileOptionIcon: {
    fontSize: 20,
    width: 40,
  },

  profileOptionText: {
    flex: 1,
    fontWeight: '600',
  },

  /* BOTTOM NAVIGATION */

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