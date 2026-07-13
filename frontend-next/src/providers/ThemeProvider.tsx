'use client'

import { createContext, useContext, useEffect, useSyncExternalStore } from 'react'

type Theme = 'dark' | 'light'

const THEME_KEY = 'pockr-theme'

let themeListeners: Array<() => void> = []

function subscribeTheme(listener: () => void) {
  themeListeners = [...themeListeners, listener]
  return () => {
    themeListeners = themeListeners.filter((l) => l !== listener)
  }
}

function readStoredTheme(): Theme {
  return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'
}

// En servidor e hidratación se rinde 'dark' (igual que el HTML prerenderizado);
// useSyncExternalStore re-lee el valor guardado tras el mount, sin mismatch.
function getServerTheme(): Theme {
  return 'dark'
}

function applyTheme(t: Theme) {
  const root = document.documentElement
  root.classList.remove('dark', 'light')
  root.classList.add(t)
}

interface ThemeContextValue {
  theme: Theme
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggle: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, readStoredTheme, getServerTheme)

  useEffect(() => {
    applyTheme(readStoredTheme())
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem(THEME_KEY, next)
    applyTheme(next)
    themeListeners.forEach((l) => l())
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}
