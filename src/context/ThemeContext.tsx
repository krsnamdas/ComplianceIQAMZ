import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const THEME_STORAGE_KEY = 'complianceiq_bright_mode_v1';

interface ThemeContextValue {
  /** When true, the app renders a brighter, higher-contrast version of the dark palette. */
  brightMode: boolean;
  toggleBrightMode: () => void;
  setBrightMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * ThemeProvider manages a "brighter" display mode on top of the existing dark
 * slate palette. Rather than rewriting ~1,800 hardcoded color classes across
 * 43 components, it applies a single `bright-mode` class to the document root,
 * which a CSS filter in index.css uses to brighten and lift contrast globally.
 * The choice persists to localStorage so it survives reloads.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brightMode, setBrightModeState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Apply / remove the root class and persist whenever the value changes
  useEffect(() => {
    const root = document.documentElement;
    if (brightMode) {
      root.classList.add('bright-mode');
    } else {
      root.classList.remove('bright-mode');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, String(brightMode));
    } catch {
      // localStorage unavailable (private browsing / quota) — non-fatal
    }
  }, [brightMode]);

  const setBrightMode = useCallback((value: boolean) => setBrightModeState(value), []);
  const toggleBrightMode = useCallback(() => setBrightModeState((prev) => !prev), []);

  return (
    <ThemeContext.Provider value={{ brightMode, toggleBrightMode, setBrightMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
};
