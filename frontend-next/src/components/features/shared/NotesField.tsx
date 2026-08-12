'use client'

interface NotesFieldProps {
  value: string
  placeholder: string
  onChange: (value: string) => void
}

export function NotesField({ value, placeholder, onChange }: NotesFieldProps) {
  return (
    <>
      <p className="mb-2 mt-4 text-[10px] font-bold uppercase tracking-[0.1em]" style={{ color: 'var(--text-placeholder)' }}>
        Nota{' '}
        <span className="font-semibold normal-case tracking-normal">(opcional)</span>
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="liquid-glass-ic w-full resize-none rounded-[16px] px-[15px] py-3 text-[14px] outline-none"
        style={{ color: 'var(--text-primary)' }}
      />
    </>
  )
}
