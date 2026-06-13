export function CategoryIcon({ name, size = 15, color }: { name: string; size?: number; color?: string }) {
  const s = { width: size, height: size, stroke: color ?? 'currentColor', fill: 'none', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'utensils': return <svg viewBox="0 0 24 24" {...s}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
    case 'car': return <svg viewBox="0 0 24 24" {...s}><path d="M19 17H5a2 2 0 0 1-2-2V9l3-6h12l3 6v6a2 2 0 0 1-2 2Z"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
    case 'heart-pulse': return <svg viewBox="0 0 24 24" {...s}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h5.27"/></svg>
    case 'film': return <svg viewBox="0 0 24 24" {...s}><rect x="2" y="2" width="20" height="20" rx="2.18"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/></svg>
    case 'home': return <svg viewBox="0 0 24 24" {...s}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22V12h6v10"/></svg>
    case 'shopping-cart': return <svg viewBox="0 0 24 24" {...s}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
    case 'wallet': return <svg viewBox="0 0 24 24" {...s}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z"/></svg>
    case 'zap': return <svg viewBox="0 0 24 24" {...s}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>
    case 'banknote': return <svg viewBox="0 0 24 24" {...s}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
    case 'laptop': return <svg viewBox="0 0 24 24" {...s}><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/></svg>
    case 'trending-up': return <svg viewBox="0 0 24 24" {...s}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
    default: return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
  }
}
