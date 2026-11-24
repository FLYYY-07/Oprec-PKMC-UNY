import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl) {
  console.warn('Warning: Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

// Gunakan SUPABASE_SERVICE_ROLE_KEY jika tersedia, dan fallback ke NEXT_PUBLIC_SUPABASE_ANON_KEY
const adminKey = supabaseServiceKey || supabaseAnonKey || ''

export const supabaseAdmin = createClient(supabaseUrl, adminKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

/**
 * Mengambil daftar email panitia yang diizinkan (case-insensitive).
 * Mendukung 1 email resmi maupun beberapa email yang dipisahkan koma
 * dari ADMIN_EMAILS (server) dan NEXT_PUBLIC_ADMIN_EMAILS (client & server).
 */
export function getAdminEmails(): string[] {
  const raw = [
    process.env.ADMIN_EMAILS || '',
    process.env.NEXT_PUBLIC_ADMIN_EMAILS || '',
  ]
    .filter(Boolean)
    .join(',')

  return Array.from(
    new Set(
      raw
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    )
  )
}

export const ADMIN_EMAILS = getAdminEmails()

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false
  const normalized = email.trim().toLowerCase()
  return getAdminEmails().includes(normalized)
}

interface AuthRequestLike {
  headers: {
    get: (name: string) => string | null
  }
  cookies?: {
    get: (name: string) => { value?: string } | undefined
    getAll?: () => Array<{ name: string; value: string }>
  }
}

/**
 * Mengekstrak Supabase access_token dari Authorization Bearer header
 * atau dari cookie sesi Supabase (sb-*-auth-token / sb-access-token).
 */
function extractAccessToken(request: AuthRequestLike): string | null {
  // 1. Cek Authorization: Bearer <token>
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.slice(7).trim()
    if (token) return token
  }

  // 2. Fallback: cek cookie sesi Supabase
  if (request.cookies) {
    const directToken = request.cookies.get('sb-access-token')?.value
    if (directToken) return directToken

    if (typeof request.cookies.getAll === 'function') {
      const allCookies = request.cookies.getAll()
      const authCookies = allCookies
        .filter((c) => /^sb-[a-z0-9-]+-auth-token(\.\d+)?$/i.test(c.name))
        .sort((a, b) => a.name.localeCompare(b.name))

      if (authCookies.length > 0) {
        const combined = authCookies.map((c) => c.value).join('')
        try {
          const rawValue = combined.startsWith('base64-')
            ? Buffer.from(combined.slice(7), 'base64').toString('utf-8')
            : decodeURIComponent(combined)
          const parsed = JSON.parse(rawValue)
          if (typeof parsed?.access_token === 'string') {
            return parsed.access_token
          }
          if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
            return parsed[0]
          }
        } catch {
          // Abaikan jika format cookie tidak dapat di-parse
        }
      }
    }
  }

  return null
}

/**
 * Memverifikasi sesi Supabase Auth dari request dan memastikan email user
 * terdaftar dalam whitelist ADMIN_EMAILS.
 */
export async function getAuthenticatedAdminUser(request: AuthRequestLike) {
  const token = extractAccessToken(request)
  if (!token) return null

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !data?.user?.email) return null

    if (!isAdminEmail(data.user.email)) {
      return null
    }

    return data.user
  } catch (err) {
    console.error('Error verifying admin Supabase session:', err)
    return null
  }
}

export async function isAdminAuthenticated(request: AuthRequestLike): Promise<boolean> {
  const adminUser = await getAuthenticatedAdminUser(request)
  return adminUser !== null
}
