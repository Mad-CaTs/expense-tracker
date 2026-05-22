import { type SelectHTMLAttributes, forwardRef } from 'react'

import { cn } from '@/lib/utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, className, id, children, ...props },
  ref
) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-xs font-medium text-[#888] uppercase tracking-widest">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={cn(
          'h-10 w-full rounded-xl bg-[#161616] px-3 text-sm text-[#e2e0d5]',
          'border border-transparent focus:border-[#d4af37] focus:outline-none transition-colors',
          'appearance-none cursor-pointer',
          error && 'border-[#ef4444]',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-[#ef4444]">{error}</p>}
    </div>
  )
})
