import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import Texto from '@/components/Texto';
import { useTheme } from '@/context/ThemeContext';
import { espaco, raio } from '@/theme';

type Props = {
  uri: string;
  sensivel?: boolean;
  rotulo: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * Evidência de categoria sensível chega borrada. O "Ver" vale só para esta imagem
 * e não fica salvo: na próxima vez ela aparece borrada de novo.
 */
export default function FotoEvidencia({ uri, sensivel, rotulo, onPress, style }: Props) {
  const { colors } = useTheme();
  const [visto, setVisto] = useState(false);
  const coberta = !!sensivel && !visto;

  return (
    <Pressable
      onPress={coberta ? () => setVisto(true) : onPress}
      accessibilityRole="button"
      accessibilityLabel={coberta ? `${rotulo}. Conteúdo sensível, toque para ver` : rotulo}
      style={[estilos.caixa, { borderColor: colors.border }, style]}>
      <Image
        source={{ uri }}
        style={estilos.foto}
        contentFit="cover"
        blurRadius={coberta ? 40 : 0}
      />
      {coberta && (
        <View style={[estilos.capa, { backgroundColor: colors.overlay }]}>
          <Feather name="eye-off" size={20} color="#ffffff" />
          <Texto variante="legenda" style={estilos.textoCapa} centro>
            Conteúdo sensível
          </Texto>
          <View style={estilos.ver}>
            <Texto variante="legenda" style={estilos.textoCapa}>
              Ver
            </Texto>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  caixa: { borderRadius: raio.md, borderWidth: 1, overflow: 'hidden' },
  foto: { width: '100%', height: '100%' },
  capa: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: espaco.xs,
    padding: espaco.sm,
  },
  textoCapa: { color: '#ffffff', fontWeight: '700' },
  ver: {
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.xs,
    borderRadius: raio.pill,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
});
