import { Feather } from '@expo/vector-icons';
import { useState, type ComponentRef, type Ref } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { espaco, fontes, raio } from '@/theme';

type Props = TextInputProps & {
  rotulo: string;
  erro?: string;
  dica?: string;
  icone?: keyof typeof Feather.glyphMap;
  senha?: boolean;
  ref?: Ref<ComponentRef<typeof TextInput>>;
};

export default function Campo({ rotulo, erro, dica, icone, senha, style, ref, ...resto }: Props) {
  const { colors } = useTheme();
  const [focado, setFocado] = useState(false);
  const [visivel, setVisivel] = useState(false);

  const corBorda = erro ? colors.danger : focado ? colors.primary : colors.inputBorder;

  return (
    <View style={estilos.grupo}>
      <Texto variante="rotulo">{rotulo}</Texto>
      <View style={[estilos.caixa, { backgroundColor: colors.inputBg, borderColor: corBorda }]}>
        {icone && <Feather name={icone} size={18} color={colors.textMuted} />}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textPlaceholder}
          secureTextEntry={senha && !visivel}
          accessibilityLabel={rotulo}
          {...resto}
          onFocus={(e) => {
            setFocado(true);
            resto.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocado(false);
            resto.onBlur?.(e);
          }}
          style={[estilos.input, { color: colors.text }, style]}
        />
        {senha && (
          <Pressable
            onPress={() => setVisivel((v) => !v)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={visivel ? 'Ocultar senha' : 'Mostrar senha'}>
            <Feather name={visivel ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
      {erro ? (
        <Texto variante="legenda" cor="danger">
          {erro}
        </Texto>
      ) : dica ? (
        <Texto variante="legenda">{dica}</Texto>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: { gap: espaco.sm },
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    borderWidth: 1.5,
    borderRadius: raio.md,
    paddingHorizontal: espaco.md,
    minHeight: 50,
  },
  input: {
    flex: 1,
    fontFamily: fontes.regular,
    fontSize: 16,
    paddingVertical: espaco.md,
    outlineStyle: 'none',
  } as object,
});
