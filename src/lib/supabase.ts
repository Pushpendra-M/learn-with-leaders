import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file')
}

let supabaseClient
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
    console.log('Supabase client initialized successfully')
  } else {
    supabaseClient = createClient('https://placeholder.supabase.co', 'placeholder-key')
  }
} catch (error) {
  console.error('Error creating Supabase client:', error)
  supabaseClient = createClient('https://placeholder.supabase.co', 'placeholder-key')
}

export const supabase = supabaseClient

