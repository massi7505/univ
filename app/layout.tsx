import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SEISAD — Gestion des produits chimiques',
  description: 'Gérez vos produits chimiques, suivez leur emplacement et assurez la conformité sécurité.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  )
}

