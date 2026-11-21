import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  HankenGrotesk_800ExtraBold,
} from '@expo-google-fonts/hanken-grotesk';
import { JetBrainsMono_500Medium, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

SplashScreen.preventAutoHideAsync();

const clienteConsultas = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function Navegacao() {
  const { colors, escuro } = useTheme();
  const { usuario, carregando } = useAuth();

  // o splash só sai depois de saber se tem alguém logado, assim a tela de login não pisca
  useEffect(() => {
    if (!carregando) SplashScreen.hideAsync();
  }, [carregando]);

  if (carregando) return null;

  return (
    <>
      <StatusBar style={escuro ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}>
        <Stack.Protected guard={!usuario}>
          <Stack.Screen name="boas-vindas" />
          <Stack.Screen name="entrar" />
          <Stack.Screen name="recuperar-senha" />
          <Stack.Screen name="verificar-codigo" />
          <Stack.Screen name="redefinir-senha" />
        </Stack.Protected>
        {/* a conta de administrador só enxerga o painel administrativo */}
        <Stack.Protected guard={usuario?.papel === 'admin'}>
          <Stack.Screen name="admin" />
        </Stack.Protected>
        <Stack.Protected guard={usuario?.papel === 'cidadao'}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="nova-denuncia" />
          <Stack.Screen name="denuncia/[id]" />
          <Stack.Screen name="meu-nivel" />
          <Stack.Screen name="sucesso" options={{ gestureEnabled: false }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontesCarregadas, erroFontes] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    HankenGrotesk_800ExtraBold,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });
  const pronto = fontesCarregadas || !!erroFontes;

  if (!pronto) return null;

  return (
    <QueryClientProvider client={clienteConsultas}>
      <ThemeProvider>
        <AuthProvider>
          <Navegacao />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
