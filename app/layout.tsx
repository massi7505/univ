import './globals.css'
import { prisma } from '@/lib/prisma'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let appName = 'SEISAD'
  let faviconUrl = ''
  try {
    const configs = await prisma.appConfig.findMany({
      where: { key: { in: ['app_name', 'favicon_url'] } },
    })
    const map = Object.fromEntries(configs.map(c => [c.key, c.value]))
    if (map.app_name) appName = map.app_name
    if (map.favicon_url) faviconUrl = map.favicon_url
  } catch {}

  return (
    <html lang="fr">
      <head>
        <title>{`${appName} — Gestion des produits chimiques`}</title>
        <meta name="description" content="Gérez vos produits chimiques, suivez leur emplacement et assurez la conformité sécurité." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {faviconUrl && <link rel="icon" href={faviconUrl} />}
      </head>
      <body>{children}</body>
    </html>
  )
}
