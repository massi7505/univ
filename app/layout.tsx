import './globals.css'
import BrandingHead from '@/components/ui/BrandingHead'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <title>SEISAD — Gestion des produits chimiques</title>
        <meta name="description" content="Gérez vos produits chimiques, suivez leur emplacement et assurez la conformité sécurité." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" id="app-favicon" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <BrandingHead />
        {children}
      </body>
    </html>
  )
}
