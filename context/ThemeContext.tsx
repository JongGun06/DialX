import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { themes } from '@/constants/Colors';
import { useUpdateProfileMutation } from '@/store/services/profileApi';

// Создаем точный тип для нашей темы
export type Theme = {
  background: string;
  surface: string;
  primary: string;
  text: string;
  textSecondary: string;
  error: string;
  success: string;
  overlay: string;
  avatarBorder: string;
  drawerActiveBackground: string;
  wallpaperUrl: string | null; // <-- Явно указываем, что обои могут быть null
};

type ThemeColorKey = keyof Omit<Theme, 'wallpaperUrl'>;

interface ThemeContextType {
  theme: Theme;
  updateColor: (key: ThemeColorKey, value: string) => void;
  updateWallpaper: (url: string | null) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const currentUser = useAppSelector(selectCurrentUser);
  const [updateProfile] = useUpdateProfileMutation();
  
  const getInitialTheme = (): Theme => {
    const defaultTheme: Theme = themes.dialx;
    const savedThemeObject = currentUser?.settings?.theme as Partial<Theme> | undefined;
    
    if (typeof savedThemeObject === 'object' && savedThemeObject !== null) {
      return { ...defaultTheme, ...savedThemeObject };
    }
    return defaultTheme;
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme());

  useEffect(() => {
    setTheme(getInitialTheme());
  }, [currentUser]);

  const updateThemeProperty = (key: keyof Theme, value: string | null) => {
    const newTheme = { ...theme, [key]: value };
    setTheme(newTheme);

    const currentSavedTheme = (currentUser?.settings?.theme as object) || {};
    // Теперь ошибка не возникнет, так как тип DTO в profileApi будет правильным
    updateProfile({
      settings: {
        //@ts-ignore
        theme: { ...currentSavedTheme, [key]: value }
      }
    });
  };

  const updateColor = (key: ThemeColorKey, value: string) => {
    updateThemeProperty(key, value);
  };

  const updateWallpaper = (url: string | null) => {
    updateThemeProperty('wallpaperUrl', url);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateColor, updateWallpaper }}>
      {children} 
    </ThemeContext.Provider>
  );
};