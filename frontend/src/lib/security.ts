// Security utilities for KerfOS

export const PASSWORD_MIN_LENGTH = 12

export interface PasswordStrength {
  score: number
  feedback: string[]
  isStrong: boolean
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = []
  let score = 0

  if (password.length >= PASSWORD_MIN_LENGTH) score++
  else feedback.push(`At least ${PASSWORD_MIN_LENGTH} characters`)

  if (/[A-Z]/.test(password)) score++
  else feedback.push('One uppercase letter')

  if (/[a-z]/.test(password)) score++
  else feedback.push('One lowercase letter')

  if (/[0-9]/.test(password)) score++
  else feedback.push('One number')

  if (/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password)) score++
  else feedback.push('One special character')

  return { score, feedback, isStrong: score === 5 }
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}
