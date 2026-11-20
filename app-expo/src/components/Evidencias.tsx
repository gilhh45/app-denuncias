import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { espaco, raio } from '@/theme';

export const MAX_EVIDENCIAS = 5;

export type Imagem = { uri: string; nome: string; tipo: string };

type Props = { imagens: Imagem[]; onChange: (imagens: Imagem[]) => void };

export default function Evidencias({ imagens, onChange }: Props) {
  const { colors } = useTheme();
  const restantes = MAX_EVIDENCIAS - imagens.length;

  async function escolher() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Sem acesso às fotos', 'Libere o acesso nas configurações para anexar prints.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: restantes,
      quality: 0.7,
    });
    if (resultado.canceled) return;

    const novas = resultado.assets.slice(0, restantes).map((a, i) => ({
      uri: a.uri,
      nome: a.fileName ?? `evidencia-${Date.now()}-${i}.jpg`,
      tipo: a.mimeType ?? 'image/jpeg',
    }));
    onChange([...imagens, ...novas]);
  }

  return (
    <View style={estilos.grupo}>
      <View style={estilos.cabecalho}>
        <Texto variante="rotulo">Evidências (prints ou fotos)</Texto>
        <Texto variante="legenda">
          {imagens.length}/{MAX_EVIDENCIAS}
        </Texto>
      </View>
      <View style={estilos.grade}>
        {imagens.map((img) => (
          <Animated.View
            key={img.uri}
            entering={FadeIn}
            exiting={FadeOut}
            layout={LinearTransition}
            style={[estilos.item, { borderColor: colors.border }]}>
            <Image source={{ uri: img.uri }} style={estilos.foto} contentFit="cover" />
            <Pressable
              onPress={() => onChange(imagens.filter((i) => i.uri !== img.uri))}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Remover evidência"
              style={[estilos.remover, { backgroundColor: colors.overlay }]}>
              <Feather name="x" size={14} color="#ffffff" />
            </Pressable>
          </Animated.View>
        ))}
        {restantes > 0 && (
          <Pressable
            onPress={escolher}
            accessibilityRole="button"
            accessibilityLabel="Adicionar evidência"
            style={({ pressed }) => [
              estilos.item,
              estilos.adicionar,
              {
                borderColor: colors.inputBorder,
                backgroundColor: pressed ? colors.cardAlt : 'transparent',
              },
            ]}>
            <Feather name="image" size={22} color={colors.textMuted} />
            <Texto variante="legenda">Adicionar</Texto>
          </Pressable>
        )}
      </View>
      <Texto variante="legenda">
        Evidências aumentam o score de credibilidade. Evite mostrar dados pessoais seus.
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  grupo: { gap: espaco.sm },
  cabecalho: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  item: {
    width: 84,
    height: 84,
    borderRadius: raio.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  foto: { width: '100%', height: '100%' },
  remover: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: raio.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adicionar: {
    borderStyle: 'dashed',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
});
