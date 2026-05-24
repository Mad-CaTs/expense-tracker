import { type InputHTMLAttributes, forwardRef } from 'react'

import { cn } from '@/lib/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  suffix?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, suffix, className, id, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[10px] font-semibold tracking-[0.15em] uppercase" style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          'rounded-xl border p-[1px] transition-colors',
          error ? 'border-[#ef4444]/50' : 'focus-within:border-[var(--accent)]/60'
        )}
        style={!error ? { borderColor: 'var(--border-subtle)' } : undefined}
      >
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'inset-highlight h-10 w-full rounded-[10px] px-3 text-sm transition-colors outline-none',
              suffix ? 'pr-10' : '',
              className
            )}
            style={{ background: 'var(--bg-input)', color: 'var(--text-primary)' }}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 flex items-center">{suffix}</div>
          )}
        </div>
      </div>
      {error && <p className="text-[11px] text-[#ef4444]">{error}</p>}
    </div>
  )
})
