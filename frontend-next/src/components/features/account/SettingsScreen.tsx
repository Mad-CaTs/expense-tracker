'use client'

import { useRouter } from 'next/navigation'

import { motion } from 'framer-motion'
import { KeyRound, LogOut } from 'lucide-react'

import { AccessCard } from '@/components/features/shared/AccessCard'
import { useStoredUsername } from '@/components/features/shared/useStoredUsername'
import { ThemeSelector } from '@/components/features/account/ThemeSelector'
import { WalletAccessIcon } from '@/components/features/wallets/WalletAccessIcon'
import { useCategories } from '@/lib/hooks/useCategories'

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="px-[18px] pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'var(--text-tertiary)' }}>
      {children}
    </p>
  )
}

/**
 * Configuración: quién está dentro, qué administra, cómo se ve la app y cómo
 * salir.
 *
 * Dos bloques: CUENTA reúne lo que pertenece al usuario —sus categorías y su
 * contraseña— y PREFERENCIAS, cómo se ve la app. Antes cada opción tenía su
 * propio rótulo, así que "Gestión" y "Tema" encabezaban un solo elemento cada
 * uno: más separadores que contenido.
 *
 * Categorías vive acá y no en el detalle de billetera: son del usuario y las
 * comparten todas las billeteras, así que colgarlas de una sugería que se
 * configuraban por billetera. Presupuestos y Frecuentes sí son por billetera y
 * siguen abriéndose desde su detalle.
 */
export function SettingsScreen() {
  const router = useRouter()
  const { data: categories = [] } = useCategories()
  const username = useStoredUsername()

  function handleLogout() {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_username')
    localStorage.removeItem('auth_must_change')
    router.push('/login')
  }

  return (
    // Columna de alto completo: es lo que permite que `mt-auto` empuje el botón
    // de salir al pie. El alto descuenta la top-bar (68px) y el pb-32 del
    // <main>, que es lo que reserva el sitio de la bottom-nav flotante; sin ese
    // descuento el botón quedaba justo debajo de la barra, medio tapado.
    <div className="mx-auto flex min-h-[calc(100dvh-68px-8rem)] max-w-3xl flex-col pt-[11px]">
      {/* Sin chevron: no hay pantalla de cuenta a la que llevar —el backend no
          expone perfil, solo el usuario guardado al entrar—, y un chevron que
          no navega promete algo que no existe. */}
      <div className="enter-pop liquid-glass mx-4 mb-[18px] flex items-center gap-3.5 rounded-[22px] p-[14px]" style={{ ['--enter-i' as string]: 0 }}>
        <span
          className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-[17px] font-extrabold"
          style={{ background: 'linear-gradient(140deg, #dfe4ea, #a8b0bd)', color: 'var(--bg-base)' }}
        >
          {username ? username[0].toUpperCase() : '?'}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-extrabold tracking-[-0.02em]" style={{ color: 'var(--text-primary)' }}>
            {username || 'Sin sesión'}
          </span>
          <span className="mt-px block text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            Cuenta personal
          </span>
        </span>
      </div>

      <div className="enter-pop mb-[18px] flex flex-col gap-2.5" style={{ ['--enter-i' as string]: 1 }}>
        <SectionLabel>Cuenta</SectionLabel>
        <div className="mx-4 flex">
          <AccessCard
            wide
            chevron
            title="Categorías"
            caption={`${categories.length} activas`}
            icon={<WalletAccessIcon name="categorias" />}
            onClick={() => router.push('/categories')}
          />
        </div>
        <div className="mx-4 flex">
          <AccessCard
            wide
            chevron
            title="Cambiar contraseña"
            caption="Actualiza tu clave de acceso"
            icon={<KeyRound size={19} strokeWidth={2} />}
            onClick={() => router.push('/change-password')}
          />
        </div>
      </div>

      <div className="enter-pop" style={{ ['--enter-i' as string]: 2 }}>
        <SectionLabel>Preferencias</SectionLabel>
        <ThemeSelector />
      </div>

      {/* Al pie y sin rótulo: cerrar sesión no es una preferencia más, es la
          salida. Empujado con mt-auto para que quede abajo aunque la pantalla
          sobre espacio, y sin la sección "Sesión" que encabezaba un solo botón. */}
      <motion.button
        type="button"
        onClick={handleLogout}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="enter-pop mx-4 mt-auto flex w-[calc(100%-2rem)] cursor-pointer items-center justify-center gap-2 rounded-[18px] border p-[14px] text-[13px] font-extrabold"
        style={{
          ['--enter-i' as string]: 3,
          color: 'var(--danger)',
          borderColor: 'rgba(239,68,68,0.22)',
          background: 'rgba(239,68,68,0.07)',
        }}
      >
        <LogOut size={15} strokeWidth={2} />
        Cerrar sesión
      </motion.button>
    </div>
  )
}
