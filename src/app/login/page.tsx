'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Shield,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Info,
  Lock,
} from 'lucide-react'
import { clsx } from 'clsx'
import { supabase } from '@/lib/supabase'
import { isAdminEmail } from '@/lib/admin'

function isUnyEmail(email: string | undefined | null): boolean {
  if (!email) return false
  const normalized = email.trim().toLowerCase()
  return normalized.endsWith('@student.uny.ac.id') || normalized.endsWith('@uny.ac.id')
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'pendaftar'

  const [activeTab, setActiveTab] = useState<'pendaftar' | 'admin'>(initialRole)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isLoadingOAuth, setIsLoadingOAuth] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Sync tab with URL search parameter if changed
  useEffect(() => {
    const role = searchParams.get('role')
    if (role === 'admin') {
      setActiveTab('admin')
    } else if (role === 'pendaftar') {
      setActiveTab('pendaftar')
    }
  }, [searchParams])

  // Initial session check & OAuth callback handler
  useEffect(() => {
    // 1. Periksa parameter error dari URL
    if (typeof window !== 'undefined') {
      const errorParam = searchParams.get('error')
      const emailParam = searchParams.get('email')

      if (errorParam === 'invalid_email' || errorParam === 'domain_rejected') {
        setErrorMessage(
          emailParam
            ? `Akses ditolak: Akun "${emailParam}" bukan email resmi UNY. Anda wajib menggunakan akun dengan domain @student.uny.ac.id atau @uny.ac.id.`
            : 'Akses ditolak: Hanya akun Google dengan email resmi UNY (@student.uny.ac.id atau @uny.ac.id) yang dapat masuk ke portal ini.'
        )
      } else if (errorParam === 'not_admin') {
        setErrorMessage(
          emailParam
            ? `Akses ditolak: Akun "${emailParam}" tidak memiliki akses panitia PKM Center UNY.`
            : 'Akses ditolak: Akun Google Anda tidak terdaftar dalam daftar panitia resmi PKM Center UNY.'
        )
      }
    }

    const handleAuthenticatedUser = async (userEmail: string) => {
      if (activeTab === 'pendaftar') {
        if (isUnyEmail(userEmail)) {
          router.replace('/dashboard')
          return
        }
        await supabase.auth.signOut()
        setErrorMessage(
          `Akses ditolak: Akun Google "${userEmail}" tidak diizinkan. Pendaftaran PKM Center UNY hanya dapat diakses menggunakan email @student.uny.ac.id atau @uny.ac.id.`
        )
      } else {
        // Tab Panitia: langsung cek whitelist NEXT_PUBLIC_ADMIN_EMAILS (case-insensitive)
        if (isAdminEmail(userEmail)) {
          setSuccessMessage('Autentikasi panitia berhasil! Mengalihkan ke Panel Admin...')
          router.replace('/admin')
          return
        }
        // Tidak cocok -> sign out otomatis & tampilkan pesan error
        await supabase.auth.signOut()
        setErrorMessage(
          `Akses ditolak: Akun "${userEmail}" tidak memiliki akses panitia PKM Center UNY. Silakan masuk menggunakan akun resmi panitia yang terdaftar.`
        )
      }
    }

    // 2. Verifikasi status sesi Supabase saat halaman dimuat
    async function checkCurrentSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const user = session?.user || null

        if (user?.email) {
          await handleAuthenticatedUser(user.email)
        }
      } catch (err) {
        console.error('Error checking auth session:', err)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkCurrentSession()

    // 3. Listener perubahan state autentikasi (callback OAuth Google)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user || null

      if (user?.email) {
        await handleAuthenticatedUser(user.email)
      }
      setIsCheckingAuth(false)
      setIsLoadingOAuth(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, activeTab, searchParams])

  const handleTabChange = (tab: 'pendaftar' | 'admin') => {
    setActiveTab(tab)
    setErrorMessage('')
    setSuccessMessage('')
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', tab === 'admin' ? '/login?role=admin' : '/login')
    }
  }

  // Google OAuth Login
  const handleGoogleLogin = async (targetRole: 'pendaftar' | 'admin') => {
    setIsLoadingOAuth(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const redirectPath = targetRole === 'admin' ? '/login?role=admin' : '/login'
      const redirectUrl =
        typeof window !== 'undefined' ? `${window.location.origin}${redirectPath}` : undefined

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: 'select_account',
            ...(targetRole === 'pendaftar' ? { hd: 'student.uny.ac.id' } : {}),
          },
        },
      })

      if (error) {
        throw error
      }
    } catch (err: any) {
      console.error('Google login error:', err)
      setErrorMessage(
        err?.message || 'Gagal menghubungkan ke layanan Google OAuth. Silakan coba kembali.'
      )
      setIsLoadingOAuth(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium">Memverifikasi sesi akun...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50/70 via-slate-50 to-purple-50/70 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home Link */}
      <div className="max-w-md w-full mx-auto mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </Link>
      </div>

      <div className="max-w-md w-full mx-auto">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2.5 text-slate-900 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Shield className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <div className="text-left">
              <span className="block font-bold text-xl tracking-tight text-slate-900 leading-none">
                PKM Center
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Universitas Negeri Yogyakarta
              </span>
            </div>
          </Link>
          <h1 className="mt-5 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Portal Autentikasi
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Open Recruitment Pengurus & Anggota PKM Center UNY 2025
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8">
          {/* Tab Switcher: Pendaftar vs Panitia */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100/90 rounded-2xl mb-6 border border-slate-200/60">
            <button
              type="button"
              onClick={() => handleTabChange('pendaftar')}
              className={clsx(
                'py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200',
                activeTab === 'pendaftar'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Masuk sebagai Pendaftar
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('admin')}
              className={clsx(
                'py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200',
                activeTab === 'admin'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Masuk sebagai Panitia
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div
              className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 animate-fade-in"
              role="alert"
            >
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-800 uppercase tracking-wide">Peringatan</p>
                <p className="text-xs sm:text-sm text-red-700 mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div
              className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 animate-fade-in"
              role="alert"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-emerald-800 font-medium">{successMessage}</p>
            </div>
          )}

          {/* TAB 1: PENDAFTAR */}
          {activeTab === 'pendaftar' && (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>Khusus Mahasiswa & Civitas UNY</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs leading-relaxed space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs">
                  <Info className="h-4 w-4 text-indigo-600" />
                  Ketentuan Akun Pendaftar:
                </div>
                <ul className="space-y-1.5 pl-6 list-disc text-slate-600">
                  <li>Wajib login menggunakan akun Google dengan email resmi UNY:</li>
                  <li className="font-mono text-[11px] text-indigo-700 font-semibold list-none pl-1">
                    • @student.uny.ac.id (Mahasiswa)
                  </li>
                  <li className="font-mono text-[11px] text-indigo-700 font-semibold list-none pl-1">
                    • @uny.ac.id (Civitas Akademika)
                  </li>
                  <li>Email publik (@gmail.com dsb) akan otomatis ditolak.</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleLogin('pendaftar')}
                disabled={isLoadingOAuth}
                className="w-full py-4 px-5 rounded-2xl font-semibold text-slate-800 bg-white border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 hover:text-indigo-900 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3.5 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoadingOAuth ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                    <span className="text-sm font-semibold text-slate-700">
                      Menghubungkan ke Google SSO...
                    </span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="text-sm sm:text-base font-bold">
                      Masuk dengan Akun SSO / Email UNY
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: PANITIA / ADMIN (Google SSO + Whitelist ADMIN_EMAILS) */}
          {activeTab === 'admin' && (
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-semibold">
                <Lock className="h-3.5 w-3.5 text-purple-600" />
                <span>Area Khusus Panitia Rekrutmen PKM Center</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs leading-relaxed space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-900 text-xs">
                  <Info className="h-4 w-4 text-purple-600" />
                  Autentikasi Panitia Resmi:
                </div>
                <p className="text-slate-600">
                  Masuk menggunakan akun Google resmi PKM Center UNY yang terdaftar pada daftar panitia. Akun yang tidak terdaftar akan ditolak secara otomatis.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleGoogleLogin('admin')}
                disabled={isLoadingOAuth}
                className="w-full py-4 px-5 rounded-2xl font-semibold text-slate-800 bg-white border-2 border-purple-200 hover:border-purple-600 hover:bg-purple-50/40 hover:text-purple-900 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3.5 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoadingOAuth ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                    <span className="text-sm font-semibold text-slate-700">
                      Menghubungkan ke Google SSO...
                    </span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span className="text-sm sm:text-base font-bold text-slate-900">
                      Masuk dengan Akun Resmi PKM Center (Google SSO)
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Security Guarantee Note */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-500 text-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <span>Terhubung langsung dengan Google SSO UNY</span>
          </div>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-center text-xs text-slate-500 leading-relaxed">
          Mengalami kendala login SSO UNY atau akses panitia? Hubungi sekretariat PKM Center UNY di Gedung LPPM Lantai 2.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium">Memuat portal login...</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}
