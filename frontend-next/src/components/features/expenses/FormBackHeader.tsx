'use client'

import { useRouter } from 'next/navigation'

import { ChevronLeft } from 'lucide-react'

export function FormBackHeader({ title }: { title: string }) {
  const router = useRouter()

  return (
    <div
      className="sticky top-0 z-20 flex items-center gap-1 px-2 pt-5 pb-3"
      style={{ background: 'var(--bg-base)' }}
    >
      <button
        onClick={() => router.back()}
        className="flex h-10 w-10 items-center justify-center transition-opacity active:opacity-60 cursor-pointer"
        style={{ color: 'var(--text-secondary)' }}
        aria-label="Volver"
      >
        <ChevronLeft size={26} strokeWidth={2} />
      </button>
      <h1 className="text-[17px] font-bold tracking-[-0.01em]" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h1>
    </div>
  )
}
