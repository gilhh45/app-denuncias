import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import BarraProgresso from '@/components/BarraProgresso';
import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { espaco, raio, type Cores } from '@/theme';
import type { Estatisticas, Usuario } from '@/types';

const VISUAL: Record<
  string,
  { icone: keyof typeof Feather.glyphMap; cor: keyof Cores; fundo: keyof Cores }
> = {
  Iniciante: { icone: 'user', cor: 'textMuted', fundo: 'cardAlt' },
  Confiável: { icone: 'thumbs-up', cor: 'info', fundo: 'infoSoft' },
  Verificado: { icone: 'check-circle', cor: 'success', fundo: 'successSoft' },
  Especialista: { icone: 'award', cor: 'primary', fundo: 'primarySoft' },
};

type Props = { usuario: Usuario; estatisticas?: Estatisticas | null };

export default function CartaoConfianca({ usuario, estatisticas }: Props) {
  const { colors } = useTheme();
  const { nivel, pontos } = usuario;
  const visual = VISUAL[nivel.nome] ?? VISUAL.Iniciante;
  const faltam = nivel.proximo ? nivel.proximo.minimo - pontos : 0;

  return (
    <View style={[estilos.cartao, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={estilos.topo}>
        <View style={[estilos.selo, { backgroundColor: colors[visual.fundo] }]}>
          <Feather name={visual.icone} size={22} color={colors[visual.cor]} />
        </View>
        <View style={estilos.textos}>
          <Texto variante="rotulo">Nível de confiança</Texto>
          <Texto variante="subtitulo">{nivel.nome}</Texto>
        </View>
        <View style={estilos.pontos}>
          <Texto variante="numero">{pontos}</Texto>
          <Texto variante="legenda">pontos</Texto>
        </View>
      </View>

      <BarraProgresso
        valor={nivel.progresso}
        cor={visual.cor === 'textMuted' ? 'primary' : visual.cor}
      />
      <Texto variante="legenda">
        {nivel.proximo
          ? `Faltam ${faltam} pontos para ${nivel.proximo.nome}.`
          : 'Você chegou ao nível máximo. Suas denúncias têm prioridade alta.'}
      </Texto>

      {estatisticas && (
        <View style={[estilos.rodape, { borderTopColor: colors.divider }]}>
          <Feather name="target" size={14} color={colors.textMuted} />
          <Texto variante="legenda" style={estilos.flex}>
            {estatisticas.taxaAcerto === null
              ? 'Taxa de acerto aparece depois da primeira análise.'
              : `Taxa de acerto: ${estatisticas.taxaAcerto}% das denúncias analisadas foram confirmadas.`}
          </Texto>
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: { borderWidth: 1, borderRadius: raio.lg, padding: espaco.lg, gap: espaco.md },
  topo: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  selo: {
    width: 48,
    height: 48,
    borderRadius: raio.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: { flex: 1, gap: 2 },
  pontos: { alignItems: 'flex-end' },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    borderTopWidth: 1,
    paddingTop: espaco.md,
  },
  flex: { flex: 1 },
});
