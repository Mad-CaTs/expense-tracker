import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { Providers } from '@/providers/Providers'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
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
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full dark`} suppressHydrationWarning>
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
