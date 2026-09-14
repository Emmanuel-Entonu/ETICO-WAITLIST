import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// SERVER-ONLY Supabase client using the service-role key. Bypasses RLS, so it
// must never be imported into a client component. Only used inside API routes.
//
// The client is created lazily and re-created if the env changes. This matters
// in dev: Next bundles this module per-route and evaluates it on first compile.
// If a route compiled before SUPABASE_SERVICE_ROLE_KEY was set, a module-level
// client would be stuck with an empty key (RLS then hides every row). Reading
// the env at call time instead guarantees each request uses the current key.

let cached: SupabaseClient | null = null
let cachedKey = ''

function getClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) {
    console.warn('[waitlist] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  if (!cached || cachedKey !== key) {
    cached = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      // Force every Supabase request to bypass Next.js's persistent fetch Data
      // Cache. Without this, Next caches the underlying fetch() responses and a
      // route can keep serving a stale DB snapshot (e.g. an old count/cap) even
      // after the data changes. `no-store` guarantees fresh reads on every call.
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, { ...init, cache: 'no-store' }),
      },
    })
    cachedKey = key
  }
  return cached
}

// A thin proxy so existing `supabaseAdmin.from(...)` calls keep working while
// the underlying client is resolved (with the current env) on every access.
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getClient()
    const value = Reflect.get(client as object, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
