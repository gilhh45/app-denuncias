import { createContext, useContext, useState } from "react";
import { darkColors, lightColors } from "../theme/colors";

// O cast para any deixa o TypeScript aceitar useTheme() nos arquivos .tsx
const ThemeContext = createContext(/** @type {any} */ (null));

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  const colors = theme === "light" ? lightColors : darkColors;
  return (
    <ThemeContext.Provider value={{ theme, toggle, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
