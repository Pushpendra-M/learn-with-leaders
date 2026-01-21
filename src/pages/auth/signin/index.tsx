import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthLogo from '@/components/auth/AuthLogo'
import AuthHeader from '@/components/auth/AuthHeader'
import FormInput from '@/components/auth/FormInput'
import AuthButton from '@/components/auth/AuthButton'
import AuthLink from '@/components/auth/AuthLink'
import { AUTH_DESCRIPTION } from '../constants'
import { ROUTES } from '@/routes/constants'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await signIn(email, password)
      if (error) {
        const errorMessage = error.message || 'Failed to sign in. Please check your credentials.'
        toast.error(errorMessage)
        setLoading(false)
      } else {
        toast.success('Signed in successfully!')
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred'
      toast.error(errorMessage)
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthLogo />
      <AuthHeader title="Sign In" description={AUTH_DESCRIPTION} />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <FormInput
            icon={<Mail className="h-5 w-5" />}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <FormInput
            icon={<Lock className="h-5 w-5" />}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightElement={
              <Link to="#" className="text-sm text-gray-600 hover:text-gray-900">
                Forgot password?
              </Link>
            }
          />
        </div>

        <AuthButton loading={loading} loadingText="Signing in...">
          Sign In
        </AuthButton>

        <AuthLink text="Don't have an account?" linkText="Sign up" to={ROUTES.SIGN_UP} />
      </form>
    </AuthLayout>
  )
}

