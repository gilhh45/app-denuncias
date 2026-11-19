import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type Cores } from '@/theme';

export type Preferencia = 'sistema' | 'claro' | 'escuro';

type ValorTema = {
  colors: Cores;
  theme: 'light' | 'dark';
  escuro: boolean;
  preferencia: Preferencia;
  definirPreferencia: (p: Preferencia) => void;
  toggle: () => void;
};

const CHAVE = 'denuncieja:tema';
const ThemeContext = createContext<ValorTema | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const sistema = useColorScheme();
  const [preferencia, setPreferencia] = useState<Preferencia>('sistema');

  useEffect(() => {
    AsyncStorage.getItem(CHAVE)
      .then((salva) => {
        if (salva === 'claro' || salva === 'escuro' || salva === 'sistema') setPreferencia(salva);
      })
      .catch(() => {});
  }, []);

  function definirPreferencia(p: Preferencia) {
    setPreferencia(p);
    AsyncStorage.setItem(CHAVE, p).catch(() => {});
  }

  const escuro = preferencia === 'sistema' ? sistema === 'dark' : preferencia === 'escuro';

  const valor: ValorTema = {
    colors: escuro ? darkColors : lightColors,
    theme: escuro ? 'dark' : 'light',
    escuro,
    preferencia,
    definirPreferencia,
    toggle: () => definirPreferencia(escuro ? 'claro' : 'escuro'),
  };

  return <ThemeContext value={valor}>{children}</ThemeContext>;
}

export function useTheme() {
  const valor = use(ThemeContext);
  if (!valor) throw new Error('useTheme precisa estar dentro do ThemeProvider');
  return valor;
}
