import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import CartaoConfianca from '@/components/CartaoConfianca';
import DenunciaCard from '@/components/DenunciaCard';
import EstadoVazio, { Carregando } from '@/components/EstadoVazio';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useMinhasDenuncias } from '@/services/denuncias';
import { espaco, raio, type Cores } from '@/theme';
import { formatarData, resumoDenuncia } from '@/utils';

function Numero({ valor, rotulo, cor }: { valor: number; rotulo: string; cor: keyof Cores }) {
  const { colors } = useTheme();
  return (
    <View style={[estilos.numero, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Texto variante="numero" cor={cor}>
        {valor}
      </Texto>
      <Texto variante="legenda">{rotulo}</Texto>
    </View>
  );
}

export default function PainelScreen() {
  const { colors } = useTheme();
  const { usuario, estatisticas, recarregarUsuario } = useAuth();
  const denuncias = useMinhasDenuncias();
  const [atualizando, setAtualizando] = useState(false);

  async function atualizar() {
    setAtualizando(true);
    await Promise.allSettled([denuncias.refetch(), recarregarUsuario()]);
    setAtualizando(false);
  }

  if (!usuario) return null;
  const primeiroNome = usuario.nome.split(' ')[0];
  const recentes = (denuncias.data ?? []).slice(0, 3);

  return (
    <Tela
      semFundoSeguro
      refreshControl={
        <RefreshControl refreshing={atualizando} onRefresh={atualizar} tintColor={colors.primary} />
      }>
      <View style={estilos.cabecalho}>
        <View style={estilos.flex}>
          <Texto variante="titulo">Olá, {primeiroNome}</Texto>
          <Texto cor="textMuted">Acompanhe suas denúncias e sua reputação.</Texto>
        </View>
        <Pressable
          onPress={() => router.navigate('/perfil')}
          accessibilityRole="button"
          accessibilityLabel="Abrir perfil"
          style={[estilos.avatar, { backgroundColor: colors.primary }]}>
          <Texto variante="destaque" cor="onPrimary">
            {primeiroNome[0]?.toUpperCase()}
          </Texto>
        </Pressable>
      </View>

      <Animated.View entering={FadeInDown.duration(350)}>
        <Pressable
          onPress={() => router.push('/nova-denuncia')}
          accessibilityRole="button"
          accessibilityLabel="Fazer uma nova denúncia"
          style={({ pressed }) => [
            estilos.chamada,
            { backgroundColor: pressed ? colors.primaryPressed : colors.primary },
          ]}>
          <View style={estilos.flex}>
            <Texto variante="subtitulo" cor="onPrimary">
              Viu algo suspeito?
            </Texto>
            <Texto cor="onPrimary" style={estilos.chamadaTexto}>
              Faça uma denúncia em menos de 2 minutos.
            </Texto>
          </View>
          <View style={estilos.chamadaIcone}>
            <Feather name="flag" size={22} color={colors.onPrimary} />
          </View>
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(350)}>
        <CartaoConfianca usuario={usuario} estatisticas={estatisticas} />
      </Animated.View>

      {estatisticas && (
        <Animated.View entering={FadeInDown.delay(160).duration(350)} style={estilos.numeros}>
          <Numero valor={estatisticas.total} rotulo="Enviadas" cor="text" />
          <Numero
            valor={estatisticas.pendentes + estatisticas.emAnalise}
            rotulo="Em andamento"
            cor="info"
          />
          <Numero valor={estatisticas.confirmadas} rotulo="Confirmadas" cor="success" />
        </Animated.View>
      )}

      <View style={estilos.secao}>
        <View style={estilos.secaoTopo}>
          <Texto variante="subtitulo">Atividade recente</Texto>
          {recentes.length > 0 && (
            <Pressable onPress={() => router.navigate('/historico')} hitSlop={8}>
              <Texto variante="destaque" cor="primary">
                Ver tudo
              </Texto>
            </Pressable>
          )}
        </View>

        {denuncias.isPending ? (
          <Carregando />
        ) : denuncias.isError ? (
          <EstadoVazio
            icone="wifi-off"
            titulo="Não deu para carregar"
            texto={denuncias.error.message}
            acao={{ titulo: 'Tentar de novo', onPress: () => denuncias.refetch() }}
          />
        ) : recentes.length === 0 ? (
          <EstadoVazio
            icone="flag"
            titulo="Nenhuma denúncia ainda"
            texto="Quando você denunciar algo, o andamento aparece aqui."
          />
        ) : (
          recentes.map((d) => (
            <DenunciaCard
              key={d.id}
              titulo={d.titulo}
              detalhe={resumoDenuncia(d)}
              data={formatarData(d.criadaEm)}
              status={d.status}
              icone={d.tipo === 'SITE' ? 'globe' : 'users'}
              onPress={() => router.push(`/denuncia/${d.id}`)}
            />
          ))
        )}
      </View>
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: raio.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chamada: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    padding: espaco.lg,
    borderRadius: raio.lg,
  },
  chamadaTexto: { opacity: 0.9 },
  chamadaIcone: {
    width: 48,
    height: 48,
    borderRadius: raio.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numeros: { flexDirection: 'row', gap: espaco.sm },
  numero: {
    flex: 1,
    borderWidth: 1,
    borderRadius: raio.md,
    paddingVertical: espaco.md,
    alignItems: 'center',
    gap: 2,
  },
  secao: { gap: espaco.md },
  secaoTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
