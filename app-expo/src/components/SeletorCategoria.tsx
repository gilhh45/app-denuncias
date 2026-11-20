import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Texto from '@/components/Texto';
import { CATEGORIAS } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import { espaco, raio } from '@/theme';

type Props = {
  valor: string | null;
  onChange: (categoria: string) => void;
  erro?: string;
};

export default function SeletorCategoria({ valor, onChange, erro }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [aberto, setAberto] = useState(false);
  const escolhida = CATEGORIAS.find((c) => c.valor === valor);

  return (
    <View style={estilos.grupo}>
      <Texto variante="rotulo">Categoria</Texto>
      <Pressable
        onPress={() => setAberto(true)}
        accessibilityRole="button"
        accessibilityLabel={`Categoria: ${valor ?? 'nenhuma escolhida'}`}
        style={[
          estilos.campo,
          {
            backgroundColor: colors.inputBg,
            borderColor: erro ? colors.danger : colors.inputBorder,
          },
        ]}>
        <Feather name={escolhida?.icone ?? 'tag'} size={18} color={colors.textMuted} />
        <Texto style={estilos.texto} cor={valor ? 'text' : 'textPlaceholder'}>
          {valor ?? 'Escolha o tipo de problema'}
        </Texto>
        <Feather name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      {!!erro && (
        <Texto variante="legenda" cor="danger">
          {erro}
        </Texto>
      )}

      <Modal
        visible={aberto}
        transparent
        animationType="slide"
        onRequestClose={() => setAberto(false)}>
        <Pressable
          style={[estilos.fundo, { backgroundColor: colors.overlay }]}
          onPress={() => setAberto(false)}
          accessibilityLabel="Fechar"
        />
        <View
          style={[
            estilos.folha,
            { backgroundColor: colors.surface, paddingBottom: insets.bottom + espaco.lg },
          ]}>
          <View style={[estilos.alca, { backgroundColor: colors.border }]} />
          <Texto variante="subtitulo" style={estilos.tituloFolha}>
            Qual é o problema?
          </Texto>
          <FlatList
            data={CATEGORIAS}
            keyExtractor={(c) => c.valor}
            renderItem={({ item }) => {
              const ativa = item.valor === valor;
              return (
                <Pressable
                  onPress={() => {
                    onChange(item.valor);
                    setAberto(false);
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: ativa }}
                  style={({ pressed }) => [
                    estilos.opcao,
                    (ativa || pressed) && { backgroundColor: colors.primarySoft },
                  ]}>
                  <Feather
                    name={item.icone}
                    size={18}
                    color={ativa ? colors.primary : colors.textMuted}
                  />
                  <Texto style={estilos.texto} cor={ativa ? 'primary' : 'text'}>
                    {item.valor}
                  </Texto>
                  {ativa && <Feather name="check" size={18} color={colors.primary} />}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: { gap: espaco.sm },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    borderWidth: 1.5,
    borderRadius: raio.md,
    paddingHorizontal: espaco.md,
    minHeight: 50,
  },
  texto: { flex: 1 },
  fundo: { flex: 1 },
  folha: {
    maxHeight: '75%',
    borderTopLeftRadius: raio.xl,
    borderTopRightRadius: raio.xl,
    paddingHorizontal: espaco.md,
    paddingTop: espaco.sm,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  alca: {
    width: 40,
    height: 4,
    borderRadius: raio.pill,
    alignSelf: 'center',
    marginBottom: espaco.md,
  },
  tituloFolha: { paddingHorizontal: espaco.sm, marginBottom: espaco.sm },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    paddingHorizontal: espaco.sm,
    paddingVertical: espaco.md,
    borderRadius: raio.md,
  },
});
