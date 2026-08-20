const KEY = 'pockr-pending-notice'

export function leaveNotice<T>(notice: T): void {
  sessionStorage.setItem(KEY, JSON.stringify(notice))
}

export function takeNotice<T>(): T | null {
  const raw = sessionStorage.getItem(KEY)
  if (!raw) return null
  sessionStorage.removeItem(KEY)
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}
