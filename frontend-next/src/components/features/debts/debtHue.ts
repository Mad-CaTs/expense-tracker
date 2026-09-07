/** Color estable por persona: el mismo nombre siempre pinta igual. */
const AVATAR_HUES = ['#f59e0b', '#5b8def', '#a855f7', '#10b981', '#ef4444', '#06b6d4']

export function debtHue(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return AVATAR_HUES[Math.abs(hash) % AVATAR_HUES.length]
}
