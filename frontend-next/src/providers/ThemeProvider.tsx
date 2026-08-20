'use client'

import { createContext, useContext, useEffect, useSyncExternalStore } from 'react'

export type ThemePreference = 'light' | 'dark'

const THEME_KEY = 'pockr-theme'

let themeListeners: Array<() => void> = []

function subscribeTheme(listener: () => void) {
  themeListeners = [...themeListeners, listener]
  return () => {
    themeListeners = themeListeners.filter((l) => l !== listener)
  }
}

function readStoredPreference(): ThemePreference {
  return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'
}

function getServerPreference(): ThemePreference {
  return 'dark'
}

function applyTheme(t: ThemePreference) {
  const root = document.documentElement
  root.classList.remove('dark', 'light')
  root.classList.add(t)
}

interface ThemeContextValue {
  preference: ThemePreference
  setPreference: (next: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  preference: 'dark',
  setPreference: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const preference = useSyncExternalStore(subscribeTheme, readStoredPreference, getServerPreference)

  useEffect(() => {
    applyTheme(readStoredPreference())
  }, [])

  function setPreference(next: ThemePreference) {
    localStorage.setItem(THEME_KEY, next)
    applyTheme(next)
    themeListeners.forEach((l) => l())
  }

  return (
    <ThemeContext.Provider value={{ preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  )
}
