import toast from 'react-hot-toast'
import { MIN_PASSWORD_LENGTH } from '../constants'

export const validateSignUpForm = (password: string, confirmPassword: string): boolean => {
  if (password !== confirmPassword) {
    toast.error('Passwords do not match')
    return false
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    return false
  }

  return true
}

