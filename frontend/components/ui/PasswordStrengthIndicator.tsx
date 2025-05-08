'use client'

interface PasswordStrengthIndicatorProps {
  password: string
}

export function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const getStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  const strength = getStrength(password)
  const strengthText = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong']
  const strengthColor = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-emerald-500'
  ]

  return (
    <div className="mt-2">
      <div className="flex gap-1 h-1 mb-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors ${
              i < strength ? strengthColor[strength - 1] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${strength > 0 ? 'text-white/80' : 'text-gray-400'}`}>
        {strength > 0 ? strengthText[strength - 1] : 'Enter a password'}
      </p>
    </div>
  )
} 