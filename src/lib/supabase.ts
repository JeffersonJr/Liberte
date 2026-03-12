import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Prevent crash during build if credentials are missing
const isInvalid = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id');

if (isInvalid) {
    console.warn('Supabase credentials missing or invalid. Check your .env.local file or Vercel settings.');
}

export const supabase = createClient(
    isInvalid ? 'https://placeholder.supabase.co' : supabaseUrl,
    isInvalid ? 'placeholder' : supabaseAnonKey
)
