'use client'

import * as React from 'react'

import * as SelectPrimitive from '@radix-ui/react-select'
import { cva, type VariantProps } from 'class-variance-authority'
import { Check, ChevronDown, type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils/cn'

const selectTriggerVariants = cva(
  [
    'group flex h-10 w-full items-center justify-between gap-2 rounded-xl px-3 text-sm',
    'border transition-colors cursor-pointer',
    'focus:outline-none focus-visible:border-[#d4af37]/60',
    'disabled:cursor-not-allowed disabled:opacity-50',
    '[&>span]:line-clamp-1',
  ],
  {
    variants: {
      variant: {
        default: 'bg-[#161616] border-transparent hover:border-[#242424] text-[#e2e0d5]',
        outline: 'bg-transparent border-[#242424] hover:border-[#383838] text-[#e2e0d5]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group

const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value> & { placeholder?: string }
>(({ className, placeholder, ...props }, ref) => (
  <SelectPrimitive.Value
    ref={ref}
    className={cn('select-none text-sm', className)}
    placeholder={placeholder && <span className="text-[#484848]">{placeholder}</span>}
    {...props}
  />
))
SelectValue.displayName = SelectPrimitive.Value.displayName

interface SelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectTriggerVariants> {
  icon?: LucideIcon
  label?: string
  error?: string
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  SelectTriggerProps
>(({ className, children, variant, icon: Icon, label, error, ...props }, ref) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <span className="text-xs font-medium tracking-widest text-[#888] uppercase">{label}</span>
    )}
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        selectTriggerVariants({ variant }),
        error && 'border-[#ef4444]',
        className
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {Icon && <Icon size={14} className="shrink-0 text-[#484848]" />}
        <span className="truncate">{children}</span>
      </div>
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          size={14}
          className="shrink-0 text-[#484848] opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
    {error && <p className="text-xs text-[#ef4444]">{error}</p>}
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
        'relative z-50 min-w-[8rem] overflow-hidden',
        'rounded-xl border border-[#1c1c1c] bg-[#0e0e0e]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
        position === 'popper' && 'mt-1 data-[side=bottom]:translate-y-1',
        className
      )}
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
    className={cn('px-3 py-1.5 text-[10px] font-semibold tracking-widest text-[#484848] uppercase', className)}
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
        'text-[#c8c6bb] outline-none transition-colors',
        'focus:bg-[#161616] focus:text-[#e8e6db]',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
        'data-[state=checked]:text-[#e8e6db]',
        className
      )}
      {...props}
    >
      <motion.div
        className="flex w-full items-center gap-2"
        whileHover={{ x: 2 }}
        transition={{ duration: 0.1 }}
      >
        {Icon && <Icon size={14} className="shrink-0 text-[#484848]" />}
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      </motion.div>
      <span className="absolute right-3 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.1, type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Check size={12} className="text-[#d4af37]" />
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
    className={cn('-mx-1 my-1 h-px bg-[#1c1c1c]', className)}
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
