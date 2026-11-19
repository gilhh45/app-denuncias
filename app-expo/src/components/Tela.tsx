import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/context/ThemeContext';
import { espaco } from '@/theme';

type Props = {
  children: ReactNode;
  rolavel?: boolean;
  /** Telas com barra de abas não precisam de espaço extra embaixo. */
  semFundoSeguro?: boolean;
  semTopoSeguro?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  style?: StyleProp<ViewStyle>;
};

export default function Tela({
  children,
  rolavel = true,
  semFundoSeguro,
  semTopoSeguro,
  refreshControl,
  style,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const espacamento = {
    paddingTop: (semTopoSeguro ? 0 : insets.top) + espaco.lg,
    paddingBottom: (semFundoSeguro ? 0 : insets.bottom) + espaco.xl,
  };

  return (
    <KeyboardAvoidingView
      style={[estilos.raiz, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {rolavel ? (
        <ScrollView
          contentContainerStyle={[estilos.conteudo, espacamento, style]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}>
          {children}
        </ScrollView>
      ) : (
        <View style={[estilos.raiz, estilos.conteudo, espacamento, style]}>{children}</View>
      )}
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1 },
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: espaco.lg,
    gap: espaco.lg,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
});
