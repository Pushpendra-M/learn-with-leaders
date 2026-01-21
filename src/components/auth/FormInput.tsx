import type { ReactNode, InputHTMLAttributes } from 'react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: ReactNode
  rightElement?: ReactNode
}

export default function FormInput({ icon, rightElement, className = '', ...props }: FormInputProps) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        {icon}
      </div>
      <input
        {...props}
        className={`w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${className}`}
      />
      {rightElement && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {rightElement}
        </div>
      )}
    </div>
  )
}

