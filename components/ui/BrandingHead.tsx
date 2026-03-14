'use client'
import { useEffect } from 'react'

export default function BrandingHead() {
  useEffect(() => {
    fetch('/api/branding')
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(data => {
        if (data.app_name) {
          document.title = `${data.app_name} — Gestion des produits chimiques`
        }
        if (data.favicon_url) {
          // Supprime tous les liens favicon existants
          document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove())
          // Crée un nouveau lien favicon propre
          const link = document.createElement('link')
          link.id = 'app-favicon'
          link.rel = 'icon'
          link.href = data.favicon_url + '?v=' + Date.now() // cache-bust
          document.head.appendChild(link)
        }
      })
      .catch(() => {})
  }, [])

  return null
}
