'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Shield,
  User as UserIcon,
  LogOut,
  CheckCircle2,
  Clock,
  FileText,
  Calendar,
  Phone,
  Mail,
  Award,
  BookOpen,
  Layers,
  Loader2,
  AlertCircle,
  ExternalLink,
  HelpCircle,
  Sparkles,
  Hourglass,
  Search,
  XCircle,
  MessageSquare,
  Edit3,
  Trash2,
  Lock,
  AlertTriangle,
} from 'lucide-react'
import { clsx } from 'clsx'
import { supabase } from '@/lib/supabase'
import RegistrationForm from '@/components/RegistrationForm'
import { DIVISIONS } from '@/types/registration'

interface ExistingRegistration {
  id: string
  full_name: string
  email: string
  phone: string
  student_id: string
  faculty?: string
  major: string
  batch: string
  motivation: string
  division_preference: string
  division_preferences: string[]
  division_reasons: Record<string, string>
  instagram: string
  linkedin?: string
  portfolio?: string
  cv_url?: string
  portfolio_url?: string
  created_at: string
  updated_at?: string
  status?: string
  notes?: string
  current_stage?: string
}

function parseBooleanSetting(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  return Boolean(value)
}

function formatWIBDateTime(dateStr: string): string {
  const formatted = new Date(dateStr).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  })
  return `${formatted} WIB`
}

const STATUS_UI_CONFIG: Record<
  string,
  {
    badge: string
    title: string
    icon: React.ComponentType<{ className?: string }>
    iconWrapperClass: string
    badgeClass: string
    cardBorderClass: string
  }
> = {
  pending: {
    badge: 'PENDING',
    title: 'Pendaftaran Sedang Menunggu Peninjauan',
    icon: Hourglass,
    iconWrapperClass: 'bg-amber-100 text-amber-600',
    badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200',
    cardBorderClass: 'border-amber-200',
  },
  reviewed: {
    badge: 'REVIEWED',
    title: 'Berkas Anda Sedang Ditinjau Panitia',
    icon: Search,
    iconWrapperClass: 'bg-blue-100 text-blue-600',
    badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200',
    cardBorderClass: 'border-blue-200',
  },
  accepted: {
    badge: 'ACCEPTED',
    title: 'Selamat! Anda Dinyatakan Lolos Seleksi',
    icon: CheckCircle2,
    iconWrapperClass: 'bg-emerald-100 text-emerald-600',
    badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    cardBorderClass: 'border-emerald-200',
  },
  rejected: {
    badge: 'REJECTED',
    title: 'Mohon Maaf, Anda Belum Lolos Seleksi',
    icon: XCircle,
    iconWrapperClass: 'bg-red-100 text-red-600',
    badgeClass: 'bg-red-100 text-red-800 border border-red-200',
    cardBorderClass: 'border-red-200',
  },
}

const STAGE_LABEL_MAP: Record<string, string> = {
  seleksi_berkas: 'Seleksi Berkas',
  wawancara: 'Wawancara',
  welcoming_onboarding: 'Welcoming & Onboarding',
}

const STAGE_INDEX_MAP: Record<string, number> = {
  seleksi_berkas: 2,
  wawancara: 3,
  welcoming_onboarding: 4,
}

const TIMELINE_STEPS = [
  {
    stepNumber: 1,
    key: 'formulir',
    title: '1. Pengisian Formulir',
    completedDesc: 'Selesai terverifikasi sistem.',
    activeDesc: 'Sedang memverifikasi formulir.',
    pendingDesc: 'Menunggu pengisian formulir.',
  },
  {
    stepNumber: 2,
    key: 'seleksi_berkas',
    title: '2. Seleksi Berkas',
    completedDesc: 'Berkas telah lolos tahap seleksi administrasi.',
    activeDesc: 'Sedang dalam proses peninjauan oleh tim rekrutmen.',
    pendingDesc: 'Menunggu proses seleksi berkas.',
  },
  {
    stepNumber: 3,
    key: 'wawancara',
    title: '3. Wawancara',
    completedDesc: 'Tahap wawancara telah selesai dilakukan.',
    activeDesc: 'Sedang dalam tahap wawancara. Cek jadwal via WA & email.',
    pendingDesc: 'Jadwal dan tautan wawancara dikirim via WA & email.',
  },
  {
    stepNumber: 4,
    key: 'welcoming_onboarding',
    title: '4. Welcoming & Onboarding',
    completedDesc: 'Selamat bergabung menjadi bagian dari PKM Center UNY!',
    activeDesc: 'Persiapan pelantikan & onboarding anggota baru PKM Center 2025.',
    pendingDesc: 'Pelantikan resmi anggota baru PKM Center 2025.',
  },
]

function isUnyEmail(email: string | undefined | null): boolean {
  if (!email) return false
  const normalized = email.trim().toLowerCase()
  return normalized.endsWith('@student.uny.ac.id') || normalized.endsWith('@uny.ac.id')
}

export default function DashboardPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any | null>(null)
  const [isVerifying, setIsVerifying] = useState(true)
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false)
  const [registration, setRegistration] = useState<ExistingRegistration | null>(null)
  const [lockRegistrations, setLockRegistrations] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')

  const fetchGlobalLockSetting = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'lock_registrations')
        .maybeSingle()

      if (!error && data) {
        setLockRegistrations(parseBooleanSetting(data.value))
      }
    } catch (err) {
      console.error('Failed to load lock_registrations setting:', err)
    }
  }, [])

  const checkRegistration = useCallback(async (email: string) => {
    setIsCheckingRegistration(true)
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching registration:', error)
      } else if (data) {
        setRegistration(data as ExistingRegistration)
      } else {
        setRegistration(null)
      }
    } catch (err) {
      console.error('Failed to query registration status:', err)
    } finally {
      setIsCheckingRegistration(false)
    }
  }, [])

  useEffect(() => {
    async function initSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session || !session.user) {
          router.replace('/login')
          return
        }

        const userEmail = session.user.email
        if (!isUnyEmail(userEmail)) {
          await supabase.auth.signOut()
          router.replace(`/login?error=invalid_email&email=${encodeURIComponent(userEmail || '')}`)
          return
        }

        setCurrentUser(session.user)
        await fetchGlobalLockSetting()
        if (session.user.email) {
          await checkRegistration(session.user.email)
        }
      } catch (err) {
        console.error('Auth error in dashboard:', err)
        router.replace('/login')
      } finally {
        setIsVerifying(false)
      }
    }

    initSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session || !session.user) {
        router.replace('/login')
      } else {
        const userEmail = session.user.email
        if (!isUnyEmail(userEmail)) {
          await supabase.auth.signOut()
          router.replace(`/login?error=invalid_email&email=${encodeURIComponent(userEmail || '')}`)
          return
        }
        setCurrentUser(session.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, checkRegistration, fetchGlobalLockSetting])

  // Real-time sync for system_settings (global lock_registrations switch)
  useEffect(() => {
    const settingsChannel = supabase
      .channel('system-settings-lock')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_settings',
          filter: 'key=eq.lock_registrations',
        },
        (payload) => {
          const newRecord = payload.new as { value?: unknown } | null
          if (newRecord && 'value' in newRecord) {
            const locked = parseBooleanSetting(newRecord.value)
            setLockRegistrations(locked)
            if (locked) setIsEditing(false)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(settingsChannel)
    }
  }, [])

  // Real-time sync when admin updates status, current_stage, or notes
  useEffect(() => {
    if (!registration?.id) return

    const channel = supabase
      .channel(`registration-updates-${registration.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'registrations',
          filter: `id=eq.${registration.id}`,
        },
        (payload) => {
          if (payload.new) {
            setRegistration(payload.new as ExistingRegistration)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [registration?.id])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.replace('/login')
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  const handleConfirmCancelRegistration = async () => {
    setIsCancelling(true)
    setCancelError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        setCancelError('Sesi login tidak valid. Silakan login kembali.')
        return
      }

      const res = await fetch('/api/register', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setCancelError(data.error || 'Gagal membatalkan pendaftaran.')
        return
      }

      setShowCancelModal(false)
      setIsEditing(false)
      setRegistration(null)
    } catch (err) {
      console.error('Cancel registration error:', err)
      setCancelError('Terjadi kesalahan server saat membatalkan pendaftaran.')
    } finally {
      setIsCancelling(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium">Memuat dashboard pendaftar...</p>
        </div>
      </div>
    )
  }

  const userDisplayName = 
    currentUser?.user_metadata?.full_name || 
    currentUser?.user_metadata?.name || 
    registration?.full_name || 
    currentUser?.email?.split('@')[0] || 
    'Pendaftar'

  const userEmail = currentUser?.email || ''

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-sm shadow-indigo-500/20">
                <Shield className="h-5 w-5 text-white" aria-hidden="true" />
              </div>
              <div className="hidden sm:block text-left">
                <span className="font-bold text-base text-slate-900 leading-none block">
                  PKM Center UNY
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-600">
                  Portal Pendaftaran
                </span>
              </div>
            </Link>

            {/* User Nav */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2.5 pl-3 pr-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700">
                <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {userDisplayName.charAt(0).toUpperCase()}
                </div>
                <div className="max-w-[160px] truncate font-medium">
                  {userDisplayName}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors shadow-sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Greeting Banner */}
          <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl shadow-indigo-950/10 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-medium mb-3">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>Open Recruitment PKM Center 2025</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                Halo, {userDisplayName}! 👋
              </h1>
              <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
                {registration
                  ? 'Pendaftaran Anda telah berhasil tercatat di sistem kami. Pantau status seleksi dan informasi berkas Anda di halaman ini.'
                  : 'Silakan lengkapi formulir pendaftaran di bawah ini untuk bergabung menjadi anggota resmi PKM Center UNY.'}
              </p>
            </div>
          </div>

          {/* Conditional Content: Already Registered OR Registration Form */}
          {isCheckingRegistration ? (
            <div className="py-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Memeriksa status pendaftaran...</p>
            </div>
          ) : registration && isEditing && (registration.status || 'pending').toLowerCase() === 'pending' && !lockRegistrations ? (
            /* ================= VIEW EDIT DATA PENDAFTARAN ================= */
            <div className="max-w-6xl mx-auto animate-fade-in">
              <RegistrationForm
                editMode
                initialData={registration}
                initialFullName={userDisplayName !== 'Pendaftar' ? userDisplayName : ''}
                initialEmail={userEmail}
                onCancelEdit={() => setIsEditing(false)}
                onSuccess={async () => {
                  setIsEditing(false)
                  if (userEmail) {
                    await checkRegistration(userEmail)
                  }
                }}
              />
            </div>
          ) : registration ? (
            /* ================= VIEW SUDAH TERDAFTAR ================= */
            (() => {
              const normalizedStatus = (registration.status || 'pending').toLowerCase()
              const statusUI = STATUS_UI_CONFIG[normalizedStatus] || STATUS_UI_CONFIG.pending
              const StatusIcon = statusUI.icon
              const currentStageKey = registration.current_stage || 'seleksi_berkas'
              const currentStageLabel = STAGE_LABEL_MAP[currentStageKey] || 'Seleksi Berkas'
              const activeStageIndex = STAGE_INDEX_MAP[currentStageKey] || 2
              const isRejected = normalizedStatus === 'rejected'
              const isStatusLocked = normalizedStatus !== 'pending'
              const isActionLocked = isStatusLocked || lockRegistrations

              const lockReasonText =
                lockRegistrations && isStatusLocked
                  ? 'Data pendaftaran sudah dikunci karena sedang/telah ditinjau panitia dan masa perubahan data telah ditutup (Data Fix).'
                  : lockRegistrations
                  ? 'Data pendaftaran sudah dikunci karena masa perubahan data telah ditutup oleh panitia (Data Fix).'
                  : 'Data pendaftaran sudah dikunci karena berkas Anda sedang/telah ditinjau oleh panitia.'

              return (
            <div className="space-y-8 animate-fade-in">
              {/* Status Header Card */}
              <div className={clsx('bg-white rounded-3xl p-6 sm:p-8 border shadow-sm', statusUI.cardBorderClass)}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className={clsx('flex h-14 w-14 items-center justify-center rounded-2xl flex-shrink-0', statusUI.iconWrapperClass)}>
                      <StatusIcon className="h-8 w-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={clsx('px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider', statusUI.badgeClass)}>
                          {statusUI.badge}
                        </span>
                        <span className="text-xs text-slate-400">
                          ID: {registration.id?.slice(0, 8)}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                        {statusUI.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Dikirim pada {new Date(registration.created_at || Date.now()).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div
                      className={clsx(
                        'px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2',
                        isRejected
                          ? 'bg-red-50 border-red-200 text-red-700'
                          : normalizedStatus === 'accepted'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-indigo-50 border-indigo-100 text-indigo-700'
                      )}
                    >
                      {isRejected ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                      Tahap: {currentStageLabel}
                    </div>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <p className="font-semibold">Informasi Pengumuman & Seleksi</p>
                    <p className="text-amber-800">
                      Pengumuman lolos administrasi dan jadwal wawancara akan dikirimkan langsung ke email{' '}
                      <span className="font-semibold underline">{registration.email}</span> dan nomor WhatsApp{' '}
                      <span className="font-semibold">{registration.phone}</span>. Pastikan kontak Anda selalu aktif.
                    </p>
                    {registration.notes && registration.notes.trim() !== '' && (
                      <div className="mt-3 p-3.5 rounded-xl bg-white/90 border border-amber-300/80 text-slate-800">
                        <div className="flex items-center gap-1.5 font-semibold text-amber-900 mb-1">
                          <MessageSquare className="h-4 w-4 text-amber-600" />
                          <span>Catatan Panitia:</span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {registration.notes}
                        </p>
                      </div>
                    )}
                    {registration.updated_at && (
                      <p className="text-[11px] sm:text-xs text-amber-800/85 pt-1 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 flex-shrink-0 text-amber-600" />
                        <span>
                          Terakhir diperbarui panitia:{' '}
                          <span className="font-semibold">{formatWIBDateTime(registration.updated_at)}</span>
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons: Edit Data & Batalkan Pendaftaran (2-Layer Lock) */}
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                      type="button"
                      disabled={isActionLocked}
                      onClick={() => {
                        if (!isActionLocked) setIsEditing(true)
                      }}
                      className={clsx(
                        'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-colors',
                        isActionLocked
                          ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                      )}
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit Data Pendaftaran
                    </button>

                    <button
                      type="button"
                      disabled={isActionLocked}
                      onClick={() => {
                        if (!isActionLocked) {
                          setCancelError('')
                          setShowCancelModal(true)
                        }
                      }}
                      className={clsx(
                        'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-colors',
                        isActionLocked
                          ? 'bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed'
                          : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                      Batalkan Pendaftaran
                    </button>
                  </div>

                  {isActionLocked && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-start gap-2">
                      <Lock className="h-4 w-4 text-slate-500 flex-shrink-0 mt-0.5" />
                      <span>{lockReasonText}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Data Summary Grid */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Left 2 Cols: Biodata & Divisi */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Biodata Card */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-indigo-600" />
                      Data Diri Pendaftar
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs text-slate-500 block mb-0.5">Nama Lengkap</span>
                        <span className="font-semibold text-slate-900">{registration.full_name}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs text-slate-500 block mb-0.5">NIM</span>
                        <span className="font-semibold text-slate-900">{registration.student_id}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs text-slate-500 block mb-0.5">Email Mahasiswa</span>
                        <span className="font-semibold text-slate-900">{registration.email}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs text-slate-500 block mb-0.5">No. WhatsApp</span>
                        <span className="font-semibold text-slate-900">{registration.phone}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs text-slate-500 block mb-0.5">Fakultas</span>
                        <span className="font-semibold text-slate-900">{registration.faculty || '-'}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs text-slate-500 block mb-0.5">Program Studi</span>
                        <span className="font-semibold text-slate-900">{registration.major}</span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-xs text-slate-500 block mb-0.5">Angkatan</span>
                        <span className="font-semibold text-slate-900">{registration.batch}</span>
                      </div>
                    </div>
                  </div>

                  {/* Division Choice (Single Division) */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Layers className="h-5 w-5 text-indigo-600" />
                      Divisi Terpilih & Alasan
                    </h3>
                    {(() => {
                      const primaryDivKey =
                        registration.division_preferences?.[0] || registration.division_preference
                      if (!primaryDivKey) return null
                      const divisionMeta = DIVISIONS.find((d) => d.value === primaryDivKey)
                      const reason = registration.division_reasons?.[primaryDivKey]
                      return (
                        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                          <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white">
                              Divisi Terpilih
                            </span>
                            <span className="text-base font-bold text-slate-900">
                              {divisionMeta?.label || primaryDivKey}
                            </span>
                          </div>
                          {reason && (
                            <div className="text-xs sm:text-sm text-slate-700 bg-white p-3.5 rounded-xl border border-indigo-100 leading-relaxed">
                              <span className="font-semibold text-slate-900 block mb-1">
                                Alasan Memilih Divisi {divisionMeta?.label || primaryDivKey}:
                              </span>
                              <p className="whitespace-pre-wrap">"{reason}"</p>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                </div>

                {/* Right Col: Timeline & Helpdesk */}
                <div className="space-y-6">
                  {/* Timeline Next Steps */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-indigo-600" />
                      Tahapan Berikutnya
                    </h3>
                    <ol className="relative border-l border-slate-200 ml-2 space-y-5 text-xs sm:text-sm">
                      {TIMELINE_STEPS.map((step) => {
                        const isCompleted = step.stepNumber === 1 || step.stepNumber < activeStageIndex
                        const isCurrent = step.stepNumber === activeStageIndex
                        const isStepRejected = isCurrent && isRejected
                        const isStepActive = isCurrent && !isRejected

                        return (
                          <li key={step.key} className="ml-4">
                            {isStepActive ? (
                              <span className="absolute -left-1.5 mt-1.5 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-3 w-3 border border-white bg-indigo-600" />
                              </span>
                            ) : (
                              <div
                                className={clsx(
                                  'absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white',
                                  isCompleted && 'bg-emerald-500',
                                  isStepRejected && 'bg-red-500',
                                  !isCompleted && !isCurrent && 'bg-slate-300'
                                )}
                              />
                            )}
                            <h4
                              className={clsx(
                                'font-semibold flex items-center gap-1.5',
                                isCompleted && 'text-emerald-700',
                                isStepActive && 'text-indigo-600',
                                isStepRejected && 'text-red-600',
                                !isCompleted && !isCurrent && (isRejected ? 'text-slate-400' : 'text-slate-700')
                              )}
                            >
                              <span>{step.title}</span>
                              {isStepRejected && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                                  Tidak Lolos
                                </span>
                              )}
                              {isStepActive && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                                  Tahap Aktif
                                </span>
                              )}
                            </h4>
                            <p className={clsx('mt-0.5', isStepRejected ? 'text-red-600/90' : 'text-slate-500')}>
                              {isCompleted
                                ? step.completedDesc
                                : isStepRejected
                                ? 'Proses seleksi berhenti di tahap ini. Tetap semangat untuk kesempatan berikutnya!'
                                : isStepActive
                                ? step.activeDesc
                                : step.pendingDesc}
                            </p>
                          </li>
                        )
                      })}
                    </ol>
                  </div>

                  {/* Helpdesk Contact */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-100 text-sm">
                    <h4 className="font-bold text-indigo-950 flex items-center gap-2 mb-2">
                      <HelpCircle className="h-5 w-5 text-indigo-600" />
                      Butuh Bantuan?
                    </h4>
                    <p className="text-xs text-indigo-900/80 mb-4 leading-relaxed">
                      Jika terdapat kekeliruan data pada berkas yang dikirimkan, hubungi tim sekretariat PKM Center UNY.
                    </p>
                    <a
                      href="https://wa.me/6281234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      <Phone className="h-4 w-4" />
                      WhatsApp Helpdesk
                    </a>
                  </div>
                </div>
              </div>
            </div>
              )
            })()
          ) : (
            /* ================= VIEW FORM PENDAFTARAN ================= */
            <div className="max-w-6xl mx-auto animate-fade-in">
              <RegistrationForm
                initialFullName={userDisplayName !== 'Pendaftar' ? userDisplayName : ''}
                initialEmail={userEmail}
                onSuccess={() => {
                  if (userEmail) {
                    checkRegistration(userEmail)
                  }
                }}
              />
            </div>
          )}
        </div>
      </main>

      {/* Cancel Registration Confirmation Modal */}
      {showCancelModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-reg-title"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 flex-shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 id="cancel-reg-title" className="text-lg font-bold text-slate-900">
                  Batalkan Pendaftaran?
                </h3>
                <p className="text-xs text-red-600 font-medium">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Apakah Anda yakin ingin membatalkan pendaftaran? Seluruh data formulir beserta file CV dan Portofolio yang telah diunggah akan{' '}
              <span className="font-semibold text-slate-900">dihapus permanen</span> dari sistem. Anda harus mengisi ulang formulir dari awal jika ingin mendaftar kembali.
            </p>

            {cancelError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2" role="alert">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{cancelError}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isCancelling}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelRegistration}
                disabled={isCancelling}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  'Ya, Batalkan Pendaftaran'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
