import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug logging to help identify environment variable issues
console.log('Environment check:', {
  supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
  supabaseAnonKey: supabaseAnonKey ? 'Set' : 'Missing',
  envMode: import.meta.env.MODE,
  urlValue: supabaseUrl,
  keyValue: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'Missing'
})

// Check if environment variables are missing or contain placeholder values
const isValidUrl = supabaseUrl && !supabaseUrl.includes('your_supabase_project_url_here')
const isValidKey = supabaseAnonKey && !supabaseAnonKey.includes('your_supabase_anon_key_here')

if (!isValidUrl || !isValidKey) {
  console.error('❌ Supabase environment variables are missing or contain placeholder values!')
  console.error('Current values:')
  console.error('VITE_SUPABASE_URL:', supabaseUrl || 'MISSING')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'MISSING')
  console.error('')
  console.error('Please update your .env file with your actual Supabase credentials:')
  console.error('1. Go to https://supabase.com/dashboard')
  console.error('2. Select your project')
  console.error('3. Go to Settings > API')
  console.error('4. Copy your Project URL and anon/public key')
  console.error('5. Update .env file with actual values')
  
  // Provide a more user-friendly error for development
  const errorMessage = `
🔧 SUPABASE CONFIGURATION REQUIRED

Your .env file contains placeholder values. Please update it with your actual Supabase credentials:

1. Go to https://supabase.com/dashboard
2. Select your project  
3. Go to Settings > API
4. Copy your Project URL and anon/public key
5. Replace the placeholder values in your .env file

Current .env file location: ${window.location.origin}/.env
  `
  
  throw new Error(errorMessage)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'secur-geek-platform'
    }
  }
})

// Security utilities
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    minLength: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  }
}