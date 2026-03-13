import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function parsePackaging(str: string | null | undefined): { value: number | null, unit: string | null } {
  if (!str) return { value: null, unit: null }
  const units = ['kg', 'g', 'mg', 'µg', 'ng', 'L', 'dL', 'cL', 'mL', 'µL']
  for (const unit of units) {
    const regex = new RegExp(`^([\\d.,]+)\\s*${unit}$`, 'i')
    const match = str.trim().match(regex)
    if (match) {
      return { value: parseFloat(match[1].replace(',', '.')), unit }
    }
  }
  // Try to extract any number + remainder
  const m = str.match(/^([\d.,]+)\s*(.*)$/)
  if (m) return { value: parseFloat(m[1].replace(',', '.')), unit: m[2].trim() || null }
  return { value: null, unit: null }
}

