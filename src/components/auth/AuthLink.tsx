import { Link } from 'react-router-dom'

interface AuthLinkProps {
  text: string
  linkText: string
  to: string
}

export default function AuthLink({ text, linkText, to }: AuthLinkProps) {
  return (
    <div className="text-center text-sm text-gray-600 mt-6">
      {text}{' '}
      <Link to={to} className="font-medium text-gray-900 hover:underline">
        {linkText}
      </Link>
    </div>
  )
}

