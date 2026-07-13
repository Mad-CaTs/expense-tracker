'use client'

interface NotesFieldProps {
  value: string
  placeholder: string
  onChange: (value: string) => void
}

export function NotesField({ value, placeholder, onChange }: NotesFieldProps) {
  return (
    <div className="px-4 pt-2 pb-3">
      <div className="mb-3 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }} />
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
        Nota
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="input-borderless w-full resize-none px-3 py-3 text-[13px] outline-none"
        style={{ color: 'var(--text-secondary)' }}
      />
    </div>
  )
}
