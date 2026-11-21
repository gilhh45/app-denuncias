import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import Texto from '@/components/Texto';
import { NIVEIS } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import { espaco, raio, type Cores } from '@/theme';
import type { NivelPublico } from '@/types';

const VISUAL: Record<string, { cor: keyof Cores; fundo: keyof Cores }> = {
  Iniciante: { cor: 'textMuted', fundo: 'cardAlt' },
  Confiável: { cor: 'info', fundo: 'infoSoft' },
  Verificado: { cor: 'success', fundo: 'successSoft' },
  Especialista: { cor: 'primary', fundo: 'primarySoft' },
};

/** Nível de confiança só por escrito: os pontos ficam na tela "Como meu nível é calculado". */
export default function CartaoConfianca({ nivel }: { nivel: NivelPublico }) {
  const { colors } = useTheme();
  const visual = VISUAL[nivel.nome] ?? VISUAL.Iniciante;
  const info = NIVEIS[nivel.ordem - 1];

  let texto = 'Você chegou ao nível máximo. Suas denúncias têm prioridade alta.';
  if (nivel.proximo) {
    texto = nivel.perto
      ? `Você está perto do nível ${nivel.proximo}.`
      : `Denúncias confirmadas levam você ao nível ${nivel.proximo}.`;
  }

  return (
    <View style={[estilos.cartao, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={estilos.topo}>
        <View style={[estilos.selo, { backgroundColor: colors[visual.fundo] }]}>
          <Feather name={info.icone} size={22} color={colors[visual.cor]} />
        </View>
        <View style={estilos.textos}>
          <Texto variante="rotulo">Seu nível</Texto>
          <Texto variante="subtitulo">{nivel.nome}</Texto>
        </View>
      </View>

      <View
        style={estilos.trilha}
        accessible
        accessibilityLabel={`Nível ${nivel.ordem} de 4: ${nivel.nome}`}>
        {NIVEIS.map((n, i) => {
          const atual = i === nivel.ordem - 1;
          return (
            <View key={n.nome} style={estilos.etapa}>
              <View
                style={[
                  estilos.barra,
                  {
                    backgroundColor:
                      i < nivel.ordem - 1 ? colors.text : atual ? colors.primary : colors.cardAlt,
                  },
                ]}
              />
              <Texto variante="legenda" cor={atual ? 'text' : 'textMuted'} numberOfLines={1}>
                {n.nome}
              </Texto>
            </View>
          );
        })}
      </View>
      <Texto variante="legenda">
        {info.texto} {texto}
      </Texto>
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
  trilha: { flexDirection: 'row', gap: espaco.xs },
  etapa: { flex: 1, gap: espaco.xs },
  barra: { height: 8, borderRadius: raio.pill },
});
