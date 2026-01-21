import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, role: 'student' | 'mentor', fullName?: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

async function fetchProfile(userId: string, userMetadata?: Record<string, any>): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116' && userMetadata?.role) {
        const role = userMetadata.role as 'student' | 'mentor' | 'admin'
        const email = userMetadata.email || ''
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: email,
            role: role,
            full_name: userMetadata.full_name || null,
            is_approved: false,
          })
          .select()
          .single()

        if (insertError) {
          console.error('Error creating profile from metadata:', insertError)
          return {
            id: userId,
            email: email,
            full_name: userMetadata.full_name || null,
            role: role,
            is_approved: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Profile
        }
        return newProfile as Profile
      }
      console.error('Error fetching profile:', error)
      return null
    }
    
    if (data && userMetadata?.role && !data.role) {
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .update({ role: userMetadata.role })
        .eq('id', userId)
        .select()
        .single()
      
      if (updatedProfile) {
        return updatedProfile as Profile
      }
    }
    
    return data ? { ...data, is_approved: data.is_approved ?? null } as Profile : null
  } catch (error) {
    console.error('Exception fetching profile:', error)
    return null
  }
}

function getProfileFromMetadata(user: User | null): Profile | null {
  if (!user) return null
  
  const metadata = user.user_metadata
  const role = (metadata?.role || 'student') as 'student' | 'mentor' | 'admin'
  
  return {
    id: user.id,
    email: user.email || '',
    full_name: metadata?.full_name || null,
    role: role,
    is_approved: metadata?.is_approved ?? null,
    created_at: user.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function handleUserSession(
  user: User,
  setProfile: (profile: Profile | null) => void,
  setUser: (user: User | null) => void,
  setSession: (session: Session | null) => void,
  mounted: boolean
) {
  const metadataProfile = getProfileFromMetadata(user)
  
  fetchProfile(user.id, user.user_metadata)
    .then((userProfile) => {
      if (!mounted) return
      
      const finalProfile = userProfile || metadataProfile
      if (finalProfile) {
        setProfile(finalProfile)
      } else {
        setProfile(null)
        setUser(null)
        setSession(null)
        supabase.auth.signOut()
      }
    })
    .catch((error) => {
      console.error('Error fetching profile:', error)
      if (mounted && metadataProfile) {
        setProfile(metadataProfile)
      } else if (mounted) {
        setProfile(null)
        setUser(null)
        setSession(null)
        supabase.auth.signOut()
      }
    })
}

const AUTH_LOADING_TIMEOUT = 10000

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const clearAuthState = useCallback(() => {
    queryClient.cancelQueries()
    queryClient.getQueryCache().clear()
    queryClient.getMutationCache().clear()
    queryClient.clear()
    queryClient.resetQueries()
    setProfile(null)
    setUser(null)
    setSession(null)
  }, [queryClient])

  useEffect(() => {
    let mounted = true

    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('Auth loading timeout - forcing loading to false')
        setLoading(false)
      }
    }, AUTH_LOADING_TIMEOUT)

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
      if (!mounted) return
      
      if (error) {
        console.error('Error getting session:', error)
        clearTimeout(timeoutId)
        setLoading(false)
        return
      }

      setSession(session)
      setUser(session?.user ?? null)
      
      if (mounted) {
        clearTimeout(timeoutId)
        setLoading(false)
      }
      } catch (error) {
      console.error('Error in getSession:', error)
      if (mounted) {
        clearTimeout(timeoutId)
        setLoading(false)
      }
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      
      setSession(session)
      setUser(session?.user ?? null)
      
      if (mounted) {
        setLoading(false)
      }
      
      if (session?.user) {
        handleUserSession(session.user, setProfile, setUser, setSession, mounted)
      } else {
        clearAuthState()
      }
    })

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [clearAuthState])

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      return { error }
    }
    
    if (!data.user) {
      return { 
        error: {
          message: 'Failed to sign in. Please try again.',
          name: 'SignInFailed',
          status: 400,
        } as AuthError
      }
    }
    
    return { error: null }
  }, [])

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    role: 'student' | 'mentor', 
    fullName?: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role,
          full_name: fullName || null,
        },
      },
    })

    if (error) {
      return { error }
    }

    if (data.user) {
      try {
        await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email,
              role: role,
              full_name: fullName || null,
              is_approved: false,
              created_at: data.user.created_at,
            })
      } catch (err) {
        console.error('Error setting up profile:', err)
      }
    }

    return { error: null }
  }, [])

  const signOut = useCallback(async () => {
    queryClient.cancelQueries()
    queryClient.getQueryCache().clear()
    queryClient.getMutationCache().clear()
    queryClient.clear()
    queryClient.resetQueries()
    setProfile(null)
    setUser(null)
    setSession(null)
    await supabase.auth.signOut()
    
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key)
          }
        })
      } catch (error) {
        console.error('Error clearing localStorage:', error)
      }
    }
  }, [queryClient])

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}