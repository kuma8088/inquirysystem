export function maskEmail(email: string): string {
  const parts = email.split('@')
  if (parts.length !== 2) return email

  const [local, domain] = parts
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`
  }

  const maskedLocal = `${local[0]}${'*'.repeat(Math.min(local.length - 2, 5))}${local[local.length - 1]}`
  return `${maskedLocal}@${domain}`
}
