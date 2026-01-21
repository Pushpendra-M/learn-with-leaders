interface AuthHeaderProps {
  title: string
  description: string
}

export default function AuthHeader({ title, description }: AuthHeaderProps) {
  return (
    <div className="text-center space-y-2 pb-6">
      <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
      <p className="text-base text-gray-600">{description}</p>
    </div>
  )
}

