import React, { createContext, useContext, useState } from 'react';
import { lightColors, darkColors } from '../theme/colors';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));
  const colors = theme === 'light' ? lightColors : darkColors;
  return (
    <ThemeContext.Provider value={{ theme, toggle, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
