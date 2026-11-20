import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { espaco, fontes, raio } from '@/theme';

type Opcao<T extends string> = { valor: T; rotulo: string; icone?: keyof typeof Feather.glyphMap };

type Props<T extends string> = {
  opcoes: Opcao<T>[];
  valor: T;
  onChange: (valor: T) => void;
};

/** Botões lado a lado onde só um fica marcado (ex.: Site / Rede social). */
export default function Seletor<T extends string>({ opcoes, valor, onChange }: Props<T>) {
  const { colors } = useTheme();

  return (
    <View
      style={[estilos.grupo, { backgroundColor: colors.cardAlt }]}
      accessibilityRole="radiogroup">
      {opcoes.map((o) => {
        const ativo = o.valor === valor;
        const cor = ativo ? colors.text : colors.textMuted;
        return (
          <Pressable
            key={o.valor}
            onPress={() => onChange(o.valor)}
            accessibilityRole="radio"
            accessibilityState={{ checked: ativo }}
            style={[estilos.opcao, ativo && { backgroundColor: colors.card }]}>
            {o.icone && <Feather name={o.icone} size={16} color={cor} />}
            <Texto style={[estilos.rotulo, { color: cor }]}>{o.rotulo}</Texto>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: { flexDirection: 'row', borderRadius: raio.md, padding: 4 },
  opcao: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.sm,
    paddingVertical: 10,
    borderRadius: raio.sm,
  },
  rotulo: { fontFamily: fontes.semi, fontSize: 14 },
});
