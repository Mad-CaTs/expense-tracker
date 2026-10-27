import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { Providers } from '@/providers/Providers'

import './globals.css'

const interSans = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Pockr',
  description: 'Registra y analiza tus gastos personales con presupuestos y reportes.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${interSans.variable} h-full`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="h-full antialiased" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('pockr-theme');document.documentElement.classList.add(t==='light'?'light':'dark')}catch(e){document.documentElement.classList.add('dark')}})()`,
          }}
        />
        <a href="#main-content" className="skip-link">
          Saltar al contenido
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
