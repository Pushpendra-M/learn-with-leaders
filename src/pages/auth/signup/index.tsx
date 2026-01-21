import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Mail, Lock, User } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthLayout from '@/components/auth/AuthLayout'
import AuthLogo from '@/components/auth/AuthLogo'
import AuthHeader from '@/components/auth/AuthHeader'
import FormInput from '@/components/auth/FormInput'
import AuthButton from '@/components/auth/AuthButton'
import AuthLink from '@/components/auth/AuthLink'
import RoleSelector from './components/RoleSelector'
import { AUTH_DESCRIPTION, MIN_PASSWORD_LENGTH, SIGNUP_REDIRECT_DELAY } from '../constants'
import { validateSignUpForm } from './utils'
import { ROUTES } from '@/routes/constants'
import type { UserRole } from '@/types'

export default function SignUp() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<UserRole>('student')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateSignUpForm(password, confirmPassword)) {
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp(email, password, role as 'student' | 'mentor', fullName)
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Account created successfully! Please check your email to verify your account.')
        setTimeout(() => {
          navigate(ROUTES.SIGN_IN)
        }, SIGNUP_REDIRECT_DELAY)
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthLogo />
      <AuthHeader title="Sign Up" description={AUTH_DESCRIPTION} />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <FormInput
            icon={<User className="h-5 w-5" />}
            id="full_name"
            name="full_name"
            type="text"
            autoComplete="name"
            required
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value as string)}
          />

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
            autoComplete="new-password"
            required
            placeholder={`Password (min. ${MIN_PASSWORD_LENGTH} characters)`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <FormInput
            icon={<Lock className="h-5 w-5" />}
            id="confirm-password"
            name="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <RoleSelector role={role} onRoleChange={setRole} />
        </div>

        <AuthButton loading={loading} loadingText="Creating account...">
          Sign Up
        </AuthButton>

        <AuthLink text="Already have an account?" linkText="Sign in" to={ROUTES.SIGN_IN} />
      </form>
    </AuthLayout>
  )
}

