"use client"

import { useCallback, useEffect, useState } from "react"

/**
 * SSR-safe localStorage state hook.
 * - Reads the persisted value after mount (avoids hydration mismatch).
 * - Serializes/deserializes JSON automatically.
 * - Syncs across components/tabs via a custom event + the native storage event.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)
  const [hydrated, setHydrated] = useState(false)

  // Load persisted value on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) {
        setValue(JSON.parse(raw) as T)
      }
    } catch (error) {
      console.log("[v0] useLocalStorage read error:", (error as Error).message)
    }
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // Listen for updates from other components / tabs
  useEffect(() => {
    const handler = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.key === key) {
        setValue(event.detail.value as T)
      }
      if (event instanceof StorageEvent && event.key === key && event.newValue) {
        try {
          setValue(JSON.parse(event.newValue) as T)
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener("local-storage", handler as EventListener)
    window.addEventListener("storage", handler as EventListener)
    return () => {
      window.removeEventListener("local-storage", handler as EventListener)
      window.removeEventListener("storage", handler as EventListener)
    }
  }, [key])

  const setStoredValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved))
          window.dispatchEvent(
            new CustomEvent("local-storage", { detail: { key, value: resolved } }),
          )
        } catch (error) {
          console.log("[v0] useLocalStorage write error:", (error as Error).message)
        }
        return resolved
      })
    },
    [key],
  )

  return [value, setStoredValue, hydrated] as const
}
