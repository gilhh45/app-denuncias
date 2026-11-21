import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, SectionList, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Texto from '@/components/Texto';
import { CATEGORIAS } from '@/constants';
import { useTheme } from '@/context/ThemeContext';
import { espaco, fontes, raio } from '@/theme';

type Props = {
  valor: string | null;
  onChange: (categoria: string) => void;
  erro?: string;
};

export default function SeletorCategoria({ valor, onChange, erro }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const escolhida = CATEGORIAS.find((c) => c.valor === valor);

  // as mais comuns no topo; a busca procura no nome e no exemplo
  const secoes = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const achadas = CATEGORIAS.filter((c) =>
      `${c.valor} ${c.exemplo}`.toLowerCase().includes(termo),
    );
    if (termo) return [{ titulo: 'Resultados', data: achadas }];
    return [
      { titulo: 'Mais comuns', data: achadas.filter((c) => c.comum) },
      { titulo: 'Todas as categorias', data: achadas.filter((c) => !c.comum) },
    ];
  }, [busca]);

  function fechar() {
    setAberto(false);
    setBusca('');
  }

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

      <Modal visible={aberto} transparent animationType="slide" onRequestClose={fechar}>
        <Pressable
          style={[estilos.fundo, { backgroundColor: colors.overlay }]}
          onPress={fechar}
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
          <View
            style={[
              estilos.busca,
              { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
            ]}>
            <Feather name="search" size={18} color={colors.textMuted} />
            <TextInput
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar: Pix, perfil, ameaça"
              placeholderTextColor={colors.textPlaceholder}
              accessibilityLabel="Buscar categoria"
              style={[estilos.campoBusca, { color: colors.text }]}
            />
          </View>
          <SectionList
            sections={secoes}
            keyExtractor={(c) => c.valor}
            keyboardShouldPersistTaps="handled"
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section }) =>
              section.data.length ? (
                <Texto variante="rotulo" style={estilos.secao}>
                  {section.titulo}
                </Texto>
              ) : null
            }
            ListEmptyComponent={
              <Texto variante="legenda" style={estilos.secao}>
                Nada encontrado. Tente outra palavra ou escolha Outro.
              </Texto>
            }
            renderItem={({ item }) => {
              const ativa = item.valor === valor;
              return (
                <Pressable
                  onPress={() => {
                    onChange(item.valor);
                    fechar();
                  }}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: ativa }}
                  accessibilityHint={item.exemplo}
                  style={({ pressed }) => [
                    estilos.opcao,
                    (ativa || pressed) && { backgroundColor: colors.primarySoft },
                  ]}>
                  <View
                    style={[
                      estilos.iconeOpcao,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}>
                    <Feather name={item.icone} size={18} color={colors.primary} />
                  </View>
                  <View style={estilos.texto}>
                    <Texto variante="destaque">{item.valor}</Texto>
                    <Texto variante="legenda">{item.exemplo}</Texto>
                  </View>
                  {ativa && <Feather name="check" size={20} color={colors.primary} />}
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
    maxHeight: '88%',
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
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.sm,
    borderWidth: 1.5,
    borderRadius: raio.md,
    paddingHorizontal: espaco.md,
    minHeight: 48,
    marginHorizontal: espaco.sm,
    marginBottom: espaco.sm,
  },
  campoBusca: { flex: 1, fontFamily: fontes.regular, fontSize: 16, minHeight: 44 },
  secao: { paddingHorizontal: espaco.sm, paddingTop: espaco.md, paddingBottom: espaco.xs },
  iconeOpcao: {
    width: 40,
    height: 40,
    borderRadius: raio.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    paddingHorizontal: espaco.sm,
    paddingVertical: espaco.sm,
    minHeight: 64,
    borderRadius: raio.md,
  },
});
