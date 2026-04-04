import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  year: "numeric",
  month: "numeric",
  day: "numeric",
})

export function formatDateUtc(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value
  return DATE_FORMATTER.format(date)
}
