import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'

import { Providers } from '@/providers/Providers'

import './globals.css'

const interSans = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Gastos — Control de gastos personales',
  description: 'Registra y analiza tus gastos personales con presupuestos y reportes.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-scroll-behavior: Next 16 ya no anula scroll-behavior:smooth al navegar;
    // sin este atributo cada cambio de ruta haría un scroll animado al top.
    <html
      lang="es"
      className={`${interSans.variable} ${geistMono.variable} h-full dark`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('pockr-theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light')}else{document.documentElement.classList.remove('light');document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="h-full antialiased" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
        <a href="#main-content" className="skip-link">
          Saltar al contenido
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
