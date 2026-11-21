import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Modal, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import Botao from '@/components/Botao';
import CartaoConfianca from '@/components/CartaoConfianca';
import DenunciaCard from '@/components/DenunciaCard';
import Esqueleto from '@/components/Esqueleto';
import EstadoVazio from '@/components/EstadoVazio';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { NIVEIS } from '@/constants';
import { nivelVisto, rascunhos, type Rascunho } from '@/services/conta';
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
  const [rascunho, setRascunho] = useState<Rascunho | null>(null);
  const [novoNivel, setNovoNivel] = useState<string | null>(null);
  const idUsuario = usuario?.id;
  const nomeNivel = usuario?.nivel.nome;
  const ordemNivel = usuario?.nivel.ordem ?? 0;

  // ao voltar para o Início: confere se há rascunho e se a pessoa subiu de nível
  useFocusEffect(
    useCallback(() => {
      if (!idUsuario || !nomeNivel) return;
      rascunhos.ler(idUsuario).then(setRascunho);
      nivelVisto.ler(idUsuario).then((anterior) => {
        const ordemAnterior = NIVEIS.findIndex((n) => n.nome === anterior) + 1;
        if (anterior && ordemAnterior && ordemNivel > ordemAnterior) setNovoNivel(nomeNivel);
        nivelVisto.marcar(idUsuario, nomeNivel);
      });
    }, [idUsuario, nomeNivel, ordemNivel]),
  );

  async function atualizar() {
    setAtualizando(true);
    await Promise.allSettled([denuncias.refetch(), recarregarUsuario()]);
    setAtualizando(false);
  }

  if (!usuario) return null;
  const primeiroNome = usuario.nome.split(' ')[0];
  const recentes = (denuncias.data ?? []).slice(0, 3);
  const primeiroAcesso = estatisticas?.total === 0;

  return (
    <Tela
      semFundoSeguro
      refreshControl={
        <RefreshControl refreshing={atualizando} onRefresh={atualizar} tintColor={colors.primary} />
      }>
      <View style={estilos.cabecalho}>
        <View style={estilos.flex}>
          <Texto variante="titulo">Olá, {primeiroNome}</Texto>
          <Texto cor="textMuted">
            {primeiroAcesso ? 'Boas-vindas ao DenuncieJá.' : 'Acompanhe suas denúncias.'}
          </Texto>
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
        {rascunho ? (
          <Pressable
            onPress={() => router.push('/nova-denuncia')}
            accessibilityRole="button"
            accessibilityLabel={`Continuar rascunho: ${rascunho.titulo || 'nova denúncia'}`}
            style={({ pressed }) => [
              estilos.chamada,
              estilos.rascunho,
              {
                backgroundColor: pressed ? colors.cardAlt : colors.card,
                borderColor: colors.primary,
              },
            ]}>
            <View style={estilos.linhaRascunho}>
              <Texto variante="rotulo" cor="primary" style={estilos.flex}>
                Rascunho salvo · {formatarData(rascunho.salvoEm)}
              </Texto>
              <Texto variante="rotulo">{rascunho.passo + 1}/4</Texto>
            </View>
            <Texto variante="subtitulo" numberOfLines={2}>
              {rascunho.titulo || 'Nova denúncia sem título'}
            </Texto>
            <View style={estilos.linhaRascunho}>
              <Texto variante="legenda" style={estilos.flex}>
                Continue de onde parou.
              </Texto>
              <Texto variante="destaque" cor="primary">
                Continuar
              </Texto>
              <Feather name="arrow-right" size={18} color={colors.primary} />
            </View>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push('/nova-denuncia')}
            accessibilityRole="button"
            accessibilityLabel="Fazer uma nova denúncia"
            style={({ pressed }) => [
              estilos.chamada,
              {
                backgroundColor: pressed ? colors.cardAlt : colors.card,
                borderColor: colors.border,
              },
            ]}>
            <View style={[estilos.chamadaIcone, { backgroundColor: colors.primary }]}>
              <Feather name="plus" size={24} color={colors.onPrimary} />
            </View>
            <View style={estilos.flex}>
              <Texto variante="subtitulo">Nova denúncia</Texto>
              <Texto variante="legenda">Site ou rede social, em menos de 2 minutos.</Texto>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(350)}>
        <CartaoConfianca nivel={usuario.nivel} />
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

      {primeiroAcesso && (
        <View
          style={[
            estilos.comoFunciona,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}>
          <Texto variante="subtitulo">Como funciona</Texto>
          {[
            [
              'Conte onde viu e o que aconteceu',
              'Link do site ou perfil, categoria e um relato curto.',
            ],
            ['Anexe prints', 'Eles deixam a denúncia mais forte.'],
            ['Acompanhe pelo protocolo', 'Você recebe um aviso quando a moderação decidir.'],
          ].map(([titulo, texto], i) => (
            <View key={titulo} style={estilos.passo}>
              <View style={[estilos.numeroPasso, { backgroundColor: colors.cardAlt }]}>
                <Texto variante="destaque">{i + 1}</Texto>
              </View>
              <View style={estilos.flex}>
                <Texto variante="destaque">{titulo}</Texto>
                <Texto variante="legenda">{texto}</Texto>
              </View>
            </View>
          ))}
        </View>
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
          <Esqueleto />
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
          recentes.map((d, i) => (
            <Animated.View key={d.id} entering={FadeInDown.delay(200 + i * 60).duration(300)}>
              <DenunciaCard
                titulo={d.titulo}
                detalhe={resumoDenuncia(d)}
                data={formatarData(d.criadaEm)}
                status={d.status}
                icone={d.tipo === 'SITE' ? 'globe' : 'users'}
                onPress={() => router.push(`/denuncia/${d.id}`)}
              />
            </Animated.View>
          ))
        )}
      </View>

      <Modal
        visible={!!novoNivel}
        transparent
        animationType="slide"
        onRequestClose={() => setNovoNivel(null)}>
        <Pressable
          style={[estilos.flex, { backgroundColor: colors.overlay }]}
          onPress={() => setNovoNivel(null)}
          accessibilityLabel="Fechar"
        />
        <View style={[estilos.folha, { backgroundColor: colors.surface }]}>
          <View style={[estilos.selo, { backgroundColor: colors.primarySoft }]}>
            <Feather name="award" size={32} color={colors.primary} />
          </View>
          <Texto variante="rotulo" cor="primary" centro>
            Novo nível
          </Texto>
          <Texto variante="titulo" centro accessibilityRole="header">
            Você agora é {novoNivel}
          </Texto>
          <Texto cor="textMuted" centro>
            {NIVEIS.find((n) => n.nome === novoNivel)?.texto} Obrigado por denunciar com cuidado.
          </Texto>
          <Botao titulo="Entendi" onPress={() => setNovoNivel(null)} />
        </View>
      </Modal>
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
    borderWidth: 1,
  },
  rascunho: { flexDirection: 'column', alignItems: 'stretch', borderWidth: 1.5 },
  linhaRascunho: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  chamadaIcone: {
    width: 48,
    height: 48,
    borderRadius: raio.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comoFunciona: { borderWidth: 1, borderRadius: raio.lg, padding: espaco.lg, gap: espaco.md },
  passo: { flexDirection: 'row', gap: espaco.md, alignItems: 'flex-start' },
  numeroPasso: {
    width: 32,
    height: 32,
    borderRadius: raio.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folha: {
    borderTopLeftRadius: raio.xl,
    borderTopRightRadius: raio.xl,
    padding: espaco.xl,
    paddingBottom: espaco.xxl,
    gap: espaco.md,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  selo: {
    width: 72,
    height: 72,
    borderRadius: raio.pill,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
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
