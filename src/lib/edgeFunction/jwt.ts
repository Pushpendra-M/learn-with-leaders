import { SignJWT } from 'jose'
import { supabase } from '@/lib/supabase'
import { JWT_EXPIRATION, JWT_AUDIENCE, JWT_ALGORITHM, MESSAGES } from './constants'

export async function generateUserToken(
  userId: string,
  role: string
): Promise<string> {
  const secret = import.meta.env.VITE_MY_HS256_SECRET

  if (!secret) {
    throw new Error(MESSAGES.SECRET_NOT_DEFINED)
  }

  const secretKey = new TextEncoder().encode(secret)

  return await new SignJWT({
    sub: userId,
    role,
    aud: JWT_AUDIENCE,
  })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(secretKey)
}

export async function generateSystemAdminToken(): Promise<string> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session || !session.user) {
    throw new Error(MESSAGES.NOT_AUTHENTICATED)
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (profileError || !profile) {
    throw new Error(MESSAGES.PROFILE_NOT_FOUND)
  }

  return generateUserToken(session.user.id, profile.role)
}

