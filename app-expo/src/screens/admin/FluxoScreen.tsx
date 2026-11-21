import { Feather } from '@expo/vector-icons';
import { Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import BarraProgresso from '@/components/BarraProgresso';
import EstadoVazio, { Carregando } from '@/components/EstadoVazio';
import GraficoBarras from '@/components/GraficoBarras';
import Tela from '@/components/Tela';
import Texto from '@/components/Texto';
import { PRIORIDADE } from '@/constants';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useResumo } from '@/services/admin';
import { espaco, raio, type Cores } from '@/theme';
import { confirmar } from '@/utils';

function BotaoIcone({
  icone,
  rotulo,
  onPress,
}: {
  icone: keyof typeof Feather.glyphMap;
  rotulo: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      style={({ pressed }) => [
        estilos.botaoIcone,
        { backgroundColor: pressed ? colors.cardAlt : colors.card, borderColor: colors.border },
      ]}>
      <Feather name={icone} size={18} color={colors.text} />
    </Pressable>
  );
}

function Indicador({
  valor,
  rotulo,
  icone,
  cor,
}: {
  valor: number;
  rotulo: string;
  icone: keyof typeof Feather.glyphMap;
  cor: keyof Cores;
}) {
  const { colors } = useTheme();
  return (
    <View style={[estilos.indicador, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name={icone} size={16} color={colors[cor]} />
      <Texto variante="numero">{valor}</Texto>
      <Texto variante="legenda">{rotulo}</Texto>
    </View>
  );
}

const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export default function FluxoScreen() {
  const { colors, escuro, toggle } = useTheme();
  const { usuario, sair } = useAuth();
  const resumo = useResumo();

  async function pedirParaSair() {
    if (await confirmar('Sair do painel?', 'Você vai precisar entrar de novo.', 'Sair')) sair();
  }

  const cartao = [estilos.cartao, { backgroundColor: colors.card, borderColor: colors.border }];
  const r = resumo.data;
  const abertas = r
    ? r.abertasPorPrioridade.ALTA + r.abertasPorPrioridade.MEDIA + r.abertasPorPrioridade.BAIXA
    : 0;
  const maiorCategoria = Math.max(1, ...(r?.porCategoria.map((c) => c.total) ?? [1]));

  return (
    <Tela
      semFundoSeguro
      refreshControl={
        <RefreshControl
          refreshing={resumo.isRefetching}
          onRefresh={() => void resumo.refetch()}
          tintColor={colors.primary}
        />
      }>
      <View style={estilos.cabecalho}>
        <View style={estilos.flex}>
          <Texto variante="rotulo" cor="primary">
            Painel administrativo
          </Texto>
          <Texto variante="titulo">Fluxo de denúncias</Texto>
          <Texto cor="textMuted">Conectado como {usuario?.nome}</Texto>
        </View>
        <BotaoIcone
          icone={escuro ? 'sun' : 'moon'}
          rotulo={escuro ? 'Usar tema claro' : 'Usar tema escuro'}
          onPress={toggle}
        />
        <BotaoIcone icone="log-out" rotulo="Sair" onPress={pedirParaSair} />
      </View>

      {resumo.isPending ? (
        <Carregando texto="Carregando o fluxo..." />
      ) : resumo.isError ? (
        <EstadoVazio
          icone="wifi-off"
          titulo="Não deu para carregar"
          texto={resumo.error.message}
          acao={{ titulo: 'Tentar de novo', onPress: () => resumo.refetch() }}
        />
      ) : (
        r && (
          <>
            <Animated.View entering={FadeInDown.duration(300)} style={estilos.indicadores}>
              <Indicador valor={r.totais.hoje} rotulo="Recebidas hoje" icone="sun" cor="primary" />
              <Indicador
                valor={r.totais.semana}
                rotulo="Últimos 7 dias"
                icone="calendar"
                cor="info"
              />
              <Indicador
                valor={r.totais.pendentes}
                rotulo="Pendentes"
                icone="clock"
                cor="warning"
              />
              <Indicador valor={r.totais.emAnalise} rotulo="Em análise" icone="search" cor="info" />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(80).duration(300)} style={cartao}>
              <View style={estilos.linha}>
                <Texto variante="subtitulo">Últimos 14 dias</Texto>
                <Texto variante="legenda">{r.totais.total} no total</Texto>
              </View>
              <GraficoBarras
                dados={r.porDia.map((d) => {
                  const data = new Date(`${d.dia}T12:00:00`);
                  return {
                    rotulo: `${DIAS[data.getDay()]} ${data.getDate()}`,
                    valor: d.total,
                  };
                })}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(160).duration(300)} style={cartao}>
              <View style={estilos.linha}>
                <Texto variante="subtitulo">Fila aberta por prioridade</Texto>
                <Texto variante="legenda">{abertas} abertas</Texto>
              </View>
              {(['ALTA', 'MEDIA', 'BAIXA'] as const).map((p) => (
                <View key={p} style={estilos.prioridade}>
                  <View style={estilos.linha}>
                    <View style={estilos.linhaEsquerda}>
                      <View
                        style={[estilos.ponto, { backgroundColor: colors[PRIORIDADE[p].cor] }]}
                      />
                      <Texto variante="destaque">{PRIORIDADE[p].rotulo}</Texto>
                      <Texto variante="legenda">{PRIORIDADE[p].explicacao}</Texto>
                    </View>
                    <Texto variante="destaque">{r.abertasPorPrioridade[p]}</Texto>
                  </View>
                  <BarraProgresso
                    valor={abertas ? r.abertasPorPrioridade[p] / abertas : 0}
                    cor={PRIORIDADE[p].cor}
                    altura={6}
                  />
                </View>
              ))}
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(240).duration(300)} style={cartao}>
              <Texto variante="subtitulo">Categorias mais denunciadas</Texto>
              {r.porCategoria.map((c) => (
                <View key={c.categoria} style={estilos.prioridade}>
                  <View style={estilos.linha}>
                    <Texto style={estilos.flex} numberOfLines={1}>
                      {c.categoria}
                    </Texto>
                    <Texto variante="destaque">{c.total}</Texto>
                  </View>
                  <BarraProgresso valor={c.total / maiorCategoria} cor="info" altura={6} />
                </View>
              ))}
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(320).duration(300)} style={cartao}>
              <Texto variante="subtitulo">Usuários</Texto>
              <View style={estilos.linha}>
                <Texto>Cidadãos cadastrados</Texto>
                <Texto variante="destaque">{r.usuarios.total}</Texto>
              </View>
              {Object.entries(r.usuarios.porNivel).map(([nivel, total]) => (
                <View key={nivel} style={estilos.linha}>
                  <Texto variante="legenda">{nivel}</Texto>
                  <Texto variante="legenda">{total}</Texto>
                </View>
              ))}
              <View style={estilos.linha}>
                <Texto variante="legenda" cor="danger">
                  Bloqueados
                </Texto>
                <Texto variante="legenda" cor="danger">
                  {r.usuarios.bloqueados}
                </Texto>
              </View>
            </Animated.View>
          </>
        )
      )}
    </Tela>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  cabecalho: { flexDirection: 'row', alignItems: 'flex-start', gap: espaco.sm },
  botaoIcone: {
    width: 40,
    height: 40,
    borderRadius: raio.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicadores: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  indicador: {
    flexGrow: 1,
    flexBasis: '45%',
    borderWidth: 1,
    borderRadius: raio.md,
    padding: espaco.md,
    gap: 2,
  },
  cartao: { borderWidth: 1, borderRadius: raio.lg, padding: espaco.lg, gap: espaco.md },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espaco.sm,
  },
  linhaEsquerda: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, flex: 1 },
  ponto: { width: 10, height: 10, borderRadius: raio.pill },
  prioridade: { gap: espaco.xs },
});
