'use client'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Browser-side Supabase client using the PUBLIC anon key — safe to ship to the
// client. Used only for account registration (auth.signUp) against the same
// project as the niqra web app / mobile app, so an account created here is a
// real ETICO user ready to sign in and complete KYC when the platform is live.

const FALLBACK_URL = 'https://cmrxwuqfagqskrjdmjte.supabase.co'
const FALLBACK_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtcnh3dXFmYWdxc2tyamRtanRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5NTYwODEsImV4cCI6MjA5MDUzMjA4MX0.cHCxF1XJbZHqatZ8ImMWJPUplB1wfWqx3j_EjkAAZa0'

let client: SupabaseClient | null = null

export function supabaseBrowser(): SupabaseClient {
  if (client) return client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON
  client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return client
}
