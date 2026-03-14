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
          let link = document.querySelector<HTMLLinkElement>("link[rel='icon']")
          if (!link) {
            link = document.createElement('link')
            link.rel = 'icon'
            document.head.appendChild(link)
          }
          link.href = data.favicon_url
        }
      })
      .catch(() => {})
  }, [])

  return null
}
