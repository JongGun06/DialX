// context/ThemeContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { themes } from '@/constants/Colors';
import { useUpdateProfileMutation } from '@/store/services/profileApi';

type Theme = typeof themes.dialx;
type ThemeColorKey = keyof Theme;

interface ThemeContextType {
  theme: Theme;
  updateColor: (key: ThemeColorKey, value: string) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const currentUser = useAppSelector(selectCurrentUser);
  const [updateProfile] = useUpdateProfileMutation();
  
  const getInitialTheme = () => {
    const defaultTheme = themes.dialx;
    const savedThemeObject = currentUser?.settings?.theme;
    
    // Если на сервере сохранен объект с цветами, объединяем его с темой по умолчанию
    if (typeof savedThemeObject === 'object' && savedThemeObject !== null) {
      return { ...defaultTheme, ...savedThemeObject };
    }
    // В противном случае, если сохранено только имя темы (старая логика), используем ее
    if (typeof savedThemeObject === 'string' && themes[savedThemeObject as keyof typeof themes]) {
        return themes[savedThemeObject as keyof typeof themes];
    }

    return defaultTheme;
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme());

  useEffect(() => {
    setTheme(getInitialTheme());
  }, [currentUser]);

  const updateColor = (key: ThemeColorKey, value: string) => {
    const newTheme = { ...theme, [key]: value };
    setTheme(newTheme);

    const currentSavedTheme = currentUser?.settings?.theme || {};
    updateProfile({
      settings: {
        // Отправляем на сервер обновленный полный объект темы
        theme: { ...currentSavedTheme, [key]: value }
      }
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, updateColor }}>
      {children} 
    </ThemeContext.Provider>
  );
};