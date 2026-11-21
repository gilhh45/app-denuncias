import { Feather } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { espaco, fontes, raio } from '@/theme';

type Chip = { valor: string; rotulo: string; icone?: keyof typeof Feather.glyphMap };

type Props = {
  opcoes: Chip[];
  valor: string | null;
  onChange: (valor: string) => void;
  /** Em telas com margem lateral, deixa a rolagem ir até a borda. */
  sangrar?: boolean;
};

export default function Chips({ opcoes, valor, onChange, sangrar }: Props) {
  const { colors } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[estilos.rolagem, sangrar && estilos.sangrar]}
      contentContainerStyle={[estilos.linha, sangrar && estilos.sangrarConteudo]}>
      {opcoes.map((o) => {
        const ativo = o.valor === valor;
        return (
          <Pressable
            key={o.valor}
            onPress={() => onChange(o.valor)}
            accessibilityRole="radio"
            accessibilityState={{ checked: ativo }}
            style={({ pressed }) => [
              estilos.chip,
              {
                backgroundColor: ativo ? colors.primary : colors.card,
                borderColor: ativo ? colors.primary : colors.border,
              },
              pressed && !ativo && { backgroundColor: colors.cardAlt },
            ]}>
            {o.icone && (
              <Feather
                name={o.icone}
                size={14}
                color={ativo ? colors.onPrimary : colors.textMuted}
              />
            )}
            <Texto style={[estilos.rotulo, { color: ativo ? colors.onPrimary : colors.text }]}>
              {o.rotulo}
            </Texto>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  // no navegador o ScrollView cresce por padrão e esticava os chips em telas curtas (Avisos)
  rolagem: { flexGrow: 0 },
  linha: { gap: espaco.sm },
  sangrar: { marginHorizontal: -espaco.lg },
  sangrarConteudo: { paddingHorizontal: espaco.lg },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.sm,
    borderRadius: raio.pill,
    borderWidth: 1,
  },
  rotulo: { fontFamily: fontes.medio, fontSize: 14 },
});
