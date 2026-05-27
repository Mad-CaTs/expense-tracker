'use client'

import * as React from 'react'

import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils/cn'

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group

const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value> & { placeholder?: string }
>(({ className, placeholder, ...props }, ref) => (
  <SelectPrimitive.Value
    ref={ref}
    className={cn('select-none text-sm', className)}
    placeholder={placeholder && <span style={{ color: 'var(--text-placeholder)' }}>{placeholder}</span>}
    {...props}
  />
))
SelectValue.displayName = SelectPrimitive.Value.displayName

interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  icon?: LucideIcon
  label?: string
  error?: string
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, children, icon: Icon, label, error, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <span className="text-xs font-medium tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>{label}</span>
    )}
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        'input-wrapper group flex h-10 w-full items-center justify-between gap-2 px-3 text-sm',
        'cursor-pointer focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        '[&>span]:line-clamp-1',
        className
      )}
      style={{
        color: 'var(--text-primary)',
        ...(error ? { borderColor: 'var(--danger)' } : {}),
      } as React.CSSProperties}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {Icon && <Icon size={14} className="shrink-0" style={{ color: 'var(--text-muted)' }} />}
        <span className="truncate">{children}</span>
      </div>
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          size={14}
          className="shrink-0 opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180"
          style={{ color: 'var(--text-muted)' }}
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
    {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
  </div>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    position?: 'popper' | 'item-aligned'
  }
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        'relative z-50 min-w-[8rem] rounded-xl border',
        position === 'popper' && 'mt-1 data-[side=bottom]:translate-y-1',
        className
      )}
      style={{
        borderColor: 'var(--border-subtle)',
        background: 'var(--bg-elevated)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      }}
      position={position}
      {...props}
    >
      <motion.div
        initial={{ opacity: 0, y: -4, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.97 }}
        transition={{ duration: 0.15, ease: [0.32, 0.72, 0, 1] }}
      >
        <SelectPrimitive.Viewport
          className={cn(
            'p-1.5',
            position === 'popper' && 'w-full min-w-[var(--radix-select-trigger-width)]'
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </motion.div>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn('px-3 py-1.5 text-[10px] font-semibold tracking-widest uppercase', className)}
    style={{ color: 'var(--text-placeholder)' }}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

interface SelectItemProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {
  icon?: LucideIcon
}

const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, SelectItemProps>(
  ({ className, children, icon: Icon, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-lg py-2 pl-3 pr-8 text-sm',
        'outline-none transition-colors',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
        className
      )}
      style={{ color: 'var(--text-secondary)' }}
      {...props}
    >
      <motion.div
        className="flex w-full items-center gap-2"
        whileHover={{ x: 2 }}
        transition={{ duration: 0.1 }}
      >
        {Icon && <Icon size={14} className="shrink-0" style={{ color: 'var(--text-muted)' }} />}
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </motion.div>
      <span className="absolute right-3 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.1, type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Check size={12} style={{ color: 'var(--accent-light)' }} />
          </motion.div>
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  )
)
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px', className)}
    style={{ background: 'var(--border-subtle)' }}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}
