import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // no-impure-state-updater / no-side-effect-in-state-updater-function:
  // El updater de setState debe ser puro (solo calcular y retornar el nuevo estado).
  // React puede invocar updaters más de una vez en Strict Mode, lo que causaría
  // que localStorage y DOM se actualicen de forma duplicada.
  // Solución: calcular el nuevo valor fuera del updater, aplicar los efectos
  // secundarios en el manejador del evento y pasar el valor calculado a setIsDark.
  const toggleTheme = useCallback(() => {
    const newTheme = !isDark;
    // Efectos secundarios: fuera del updater, en el manejador del evento.
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.body.classList.toggle('dark', newTheme);
    // Updater puro: simplemente asigna el nuevo valor calculado.
    setIsDark(newTheme);
  }, [isDark]);

  // jsx-no-constructed-context-values: memoizar el value evita re-renders en todos los
  // consumidores cada vez que el Provider re-renderiza por otras razones.
  // toggleTheme es estable (useCallback con deps []), por lo que se puede incluir
  // en el array de dependencias del useMemo sin riesgo de re-creación infinita.
  const value = useMemo(() => ({ isDark, toggleTheme }), [isDark, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
