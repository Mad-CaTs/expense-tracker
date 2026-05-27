import { type InputHTMLAttributes, forwardRef, useState } from 'react'

import { cn } from '@/lib/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  suffix?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, suffix, className, id, onFocus, onBlur, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  const [focused, setFocused] = useState(false)

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
        className="input-wrapper"
        style={error ? { borderColor: 'var(--danger)' } : focused ? { borderColor: 'var(--accent-light)' } : undefined}
      >
        <div className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-10 w-full rounded-[10px] px-3 text-sm outline-none',
              suffix ? 'pr-10' : '',
              className
            )}
            style={{ background: 'transparent', color: 'var(--text-primary)' }}
            onFocus={(e) => { setFocused(true); onFocus?.(e) }}
            onBlur={(e) => { setFocused(false); onBlur?.(e) }}
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
