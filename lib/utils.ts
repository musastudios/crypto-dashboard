import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  // Handle NaN or undefined values
  if (isNaN(value) || value === undefined) {
    value = 0
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatDate(date: string | Date): string {
  if (!date) {
    return ""
  }

  try {
    if (typeof date === "string") {
      date = new Date(date)
    }

    if (isNaN(date.getTime())) {
      return ""
    }

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date)
  } catch (error) {
    console.error("Error formatting date:", error)
    return ""
  }
}

export function formatPercentage(value: number): string {
  // Handle NaN or undefined values
  if (isNaN(value) || value === undefined) {
    value = 0
  }

  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100)
}

