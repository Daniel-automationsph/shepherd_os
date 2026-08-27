import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Fails loudly in the console rather than letting every screen hang on
  // a silent fetch failure — see README "Connect Supabase" section.
  console.error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill in your Supabase project values (Project Settings → API).',
  )
}

// IMPORTANT: createClient('', '') throws synchronously ("supabaseUrl is
// required") — and this file is imported at the very top of the import
// chain (api.js → DataContext.jsx → App.jsx), so that throw would happen
// before React even renders, crashing to a blank white screen with no
// helpful message anywhere in the UI. Instead, leave `supabase` as null
// when unconfigured, and let api.js's fetchAppData() throw a friendly,
// catchable error — DataContext already has a try/catch around that call
// and shows a proper error screen with a retry button.
export const supabase = url && anonKey ? createClient(url, anonKey) : null
