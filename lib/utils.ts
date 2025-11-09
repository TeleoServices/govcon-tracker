import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '$0'

  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  }

  return `$${amount.toLocaleString()}`
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString()
}

export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0%'
  return `${value.toFixed(1)}%`
}
