import type { ButtonHTMLAttributes } from 'react'

interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  loadingText?: string
  children: React.ReactNode
}

export default function AuthButton({
  loading = false,
  loadingText,
  children,
  className = '',
  disabled,
  ...props
}: AuthButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={`w-full py-3 rounded-lg bg-gray-800 hover:bg-gray-900 text-white font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {loading ? loadingText || 'Loading...' : children}
    </button>
  )
}

