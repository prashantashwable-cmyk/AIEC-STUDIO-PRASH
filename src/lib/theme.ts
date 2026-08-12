import { useState, useEffect } from 'react';
import { DbManager } from './db';
import { User } from '../types';

export type ThemeMode = 'light' | 'snow' | 'dark' | 'system';

const LISTEN_EVENT = 'aiec_theme_update';

export function getAppTheme(): ThemeMode {
  const saved = localStorage.getItem('aiec_theme_mode');
  if (saved === 'light' || saved === 'snow' || saved === 'dark' || saved === 'system') {
    return saved;
  }
  return 'light';
}

export function applyThemeToDOM(theme: ThemeMode) {
  let activeTheme: 'light' | 'snow' | 'dark' = 'light';
  
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    activeTheme = prefersDark ? 'dark' : 'light';
  } else {
    activeTheme = theme;
  }

  const root = document.documentElement;
  root.setAttribute('data-theme', activeTheme);
  
  // Update body background and text for clean transition
  if (activeTheme === 'dark') {
    root.style.backgroundColor = '#1A1815';
    root.style.color = '#F0EDE6';
  } else if (activeTheme === 'snow') {
    root.style.backgroundColor = '#FFFFFF';
    root.style.color = '#1F2124';
  } else {
    root.style.backgroundColor = '#F8F6F1';
    root.style.color = '#2A2723';
  }
}

export function setAppTheme(theme: ThemeMode, currentUser?: User | null) {
  localStorage.setItem('aiec_theme_mode', theme);
  applyThemeToDOM(theme);
  
  if (currentUser) {
    const updatedUser = {
      ...currentUser,
      theme_preference: theme
    };
    DbManager.updateUser(updatedUser);
  }

  window.dispatchEvent(new CustomEvent(LISTEN_EVENT, { detail: theme }));
}

export function useTheme(currentUser?: User | null) {
  const [theme, setThemeState] = useState<ThemeMode>(getAppTheme());

  useEffect(() => {
    // Initial apply
    applyThemeToDOM(theme);

    // Watch system preference if system mode is selected
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (getAppTheme() === 'system') {
        applyThemeToDOM('system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeMode>;
      if (customEvent.detail) {
        setThemeState(customEvent.detail);
      }
    };

    window.addEventListener(LISTEN_EVENT, handleUpdate);
    return () => {
      mediaQuery.removeEventListener('change', handleSystemChange);
      window.removeEventListener(LISTEN_EVENT, handleUpdate);
    };
  }, [theme]);

  // Sync when user preference changes or login occurs
  useEffect(() => {
    if (currentUser && currentUser.theme_preference) {
      if (currentUser.theme_preference !== theme) {
        setAppTheme(currentUser.theme_preference);
      }
    }
  }, [currentUser]);

  return {
    theme,
    setTheme: (newTheme: ThemeMode) => setAppTheme(newTheme, currentUser),
    resolvedTheme: theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme
  };
}
