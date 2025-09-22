// context/ThemeContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { themes } from '@/constants/Colors'; // Обрати внимание, импортируем объект themes

// Определяем тип для наших тем
type Theme = typeof themes.dialx;
type ThemeName = keyof typeof themes;

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const currentUser = useAppSelector(selectCurrentUser);
  const savedThemeName = (currentUser?.settings?.theme as ThemeName) || 'dialx';
  
  const [themeName, setThemeName] = useState<ThemeName>(savedThemeName);

  // Следим за изменениями в профиле пользователя
  useEffect(() => {
    const userTheme = (currentUser?.settings?.theme as ThemeName);
    if (userTheme && themes[userTheme]) {
      setThemeName(userTheme);
    }
  }, [currentUser]);

  const theme = themes[themeName] || themes.dialx;

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme: setThemeName }}>
      {children}
    </ThemeContext.Provider>
  );
};