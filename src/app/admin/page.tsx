'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Shield,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  FileText,
  Upload,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle,
  MoreHorizontal,
  Home,
  Settings,
  LogOut,
  BarChart2,
  UserCheck,
  UserX,
  Hourglass,
  X,
  Lock,
  Unlock,
  AlertTriangle,
  ChevronDown,
  FileSpreadsheet,
} from 'lucide-react'
import { clsx } from 'clsx'
import { DIVISIONS } from '@/types/registration'
import { supabase } from '@/lib/supabase'
import { isAdminEmail } from '@/lib/admin'
import BoardManager from '@/components/admin/BoardManager'

interface Registration {
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
  status: string
  notes?: string
  current_stage?: string
}

interface Stats {
  total: number
  byStatus: Record<string, number>
  byDivision: Record<string, number>
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const STATUS_LABELS: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  pending: { label: 'Pending', icon: Hourglass, color: 'bg-amber-100 text-amber-800 border-amber-200' },
  reviewed: { label: 'Reviewed', icon: Clock, color: 'bg-blue-100 text-blue-800 border-blue-200' },
  accepted: { label: 'Diterima', icon: UserCheck, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  rejected: { label: 'Ditolak', icon: UserX, color: 'bg-red-100 text-red-800 border-red-200' },
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'accepted', label: 'Diterima' },
  { value: 'rejected', label: 'Ditolak' },
]

const STAGE_OPTIONS = [
  { value: 'seleksi_berkas', label: 'Tahap 2: Seleksi Berkas' },
  { value: 'wawancara', label: 'Tahap 3: Wawancara' },
  { value: 'welcoming_onboarding', label: 'Tahap 4: Welcoming & Onboarding' },
]

const STAGE_LABELS: Record<string, { label: string; shortLabel: string; color: string }> = {
  seleksi_berkas: {
    label: 'Tahap 2: Seleksi Berkas',
    shortLabel: 'Seleksi Berkas',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  wawancara: {
    label: 'Tahap 3: Wawancara',
    shortLabel: 'Wawancara',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  welcoming_onboarding: {
    label: 'Tahap 4: Welcoming & Onboarding',
    shortLabel: 'Welcoming & Onboarding',
    color: 'bg-teal-100 text-teal-800 border-teal-200',
  },
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getDivisionLabel(value: string): string {
  return DIVISIONS.find((d) => d.value === value)?.label || value
}

function AdminDashboard() {
  const router = useRouter()
  const [activeAdminTab, setActiveAdminTab] = useState<'registrations' | 'board'>('registrations')
  const [verified, setVerified] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [stats, setStats] = useState<Stats | null>(null)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  const [search, setSearch] = useState('')
  const [divisionFilter, setDivisionFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  const [selectedReg, setSelectedReg] = useState<Registration | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [modalStatus, setModalStatus] = useState('')
  const [modalNotes, setModalNotes] = useState('')
  const [modalStage, setModalStage] = useState('seleksi_berkas')
  const [exporting, setExporting] = useState<'csv' | 'xlsx' | null>(null)
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false)
  const exportDropdownRef = useRef<HTMLDivElement | null>(null)
  const [lockRegistrations, setLockRegistrations] = useState(false)
  const [togglingLock, setTogglingLock] = useState(false)
  const [showLockConfirmModal, setShowLockConfirmModal] = useState(false)

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target as Node)
      ) {
        setExportDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Helper fetch dengan Supabase Bearer token untuk semua endpoint /api/admin/*
  const adminFetch = async (input: string, init: RequestInit = {}) => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const headers = new Headers(init.headers)
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`)
    }
    return fetch(input, { ...init, headers })
  }

  const loadStats = async () => {
    try {
      const res = await adminFetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else if (res.status === 401) {
        router.replace('/login?role=admin')
      }
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  const loadRegistrations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
        sortOrder,
      })
      if (search) params.set('search', search)
      if (divisionFilter) params.set('division', divisionFilter)
      if (statusFilter) params.set('status', statusFilter)

      const res = await adminFetch(`/api/admin/registrations?${params}`)
      if (res.ok) {
        const data = await res.json()
        setRegistrations(data.data)
        setPagination(data.pagination)
      } else if (res.status === 401) {
        router.replace('/login?role=admin')
      }
    } catch (err) {
      console.error('Failed to load registrations:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const res = await adminFetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        setLockRegistrations(Boolean(data.lock_registrations))
      }
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }

  const handleConfirmToggleLock = async () => {
    setTogglingLock(true)
    try {
      const nextValue = !lockRegistrations
      const res = await adminFetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lock_registrations: nextValue }),
      })
      if (res.ok) {
        const data = await res.json()
        setLockRegistrations(Boolean(data.lock_registrations))
        setShowLockConfirmModal(false)
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Gagal memperbarui status kunci data.')
      }
    } catch (err) {
      console.error('Toggle lock error:', err)
      alert('Terjadi kesalahan server saat mengubah status kunci data.')
    } finally {
      setTogglingLock(false)
    }
  }

  // Check Supabase Auth session + ADMIN_EMAILS whitelist on mount
  useEffect(() => {
    let isMounted = true

    async function checkAdminStatus() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session?.user?.email) {
          router.replace('/login?role=admin')
          return
        }

        const userEmail = session.user.email
        if (!isAdminEmail(userEmail)) {
          await supabase.auth.signOut()
          router.replace(`/login?role=admin&error=not_admin&email=${encodeURIComponent(userEmail)}`)
          return
        }

        // Validasi juga di sisi server (memverifikasi JWT + server ADMIN_EMAILS)
        const verifyRes = await fetch('/api/admin/verify', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })

        if (!verifyRes.ok) {
          await supabase.auth.signOut()
          router.replace(`/login?role=admin&error=not_admin&email=${encodeURIComponent(userEmail)}`)
          return
        }

        if (isMounted) {
          setVerified(true)
          await Promise.all([loadStats(), loadRegistrations(), loadSettings()])
        }
      } catch (err) {
        console.error('Admin verification check failed:', err)
        router.replace('/login?role=admin')
      } finally {
        if (isMounted) {
          setCheckingAuth(false)
        }
      }
    }

    checkAdminStatus()

    return () => {
      isMounted = false
    }
  }, [router])

  const handleAdminLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Error logging out admin:', err)
    } finally {
      router.replace('/login?role=admin')
    }
  }

  const handleSearch = useCallback(() => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    loadRegistrations()
  }, [search, divisionFilter, statusFilter, sortBy, sortOrder])

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const handleViewDetail = async (reg: Registration) => {
    setDetailLoading(true)
    setUpdateError('')
    setUpdateSuccess(false)
    try {
      const res = await adminFetch(`/api/admin/registrations/${reg.id}`)
      if (res.ok) {
        const data = await res.json()
        const detail = data.data || reg
        setSelectedReg(detail)
        setModalStatus(detail.status || 'pending')
        setModalNotes(detail.notes || '')
        setModalStage(detail.current_stage || 'seleksi_berkas')
      } else {
        setSelectedReg(reg)
        setModalStatus(reg.status || 'pending')
        setModalNotes(reg.notes || '')
        setModalStage(reg.current_stage || 'seleksi_berkas')
      }
    } catch (err) {
      console.error('Failed to load detail:', err)
      setSelectedReg(reg)
      setModalStatus(reg.status || 'pending')
      setModalNotes(reg.notes || '')
      setModalStage(reg.current_stage || 'seleksi_berkas')
    } finally {
      setDetailLoading(false)
    }
  }

  const handleSaveModal = async () => {
    if (!selectedReg) return
    setUpdating(true)
    setUpdateError('')
    setUpdateSuccess(false)
    try {
      const res = await adminFetch(`/api/admin/registrations/${selectedReg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: modalStatus,
          notes: modalNotes,
          current_stage: modalStage,
        }),
      })
      if (res.ok) {
        setSelectedReg((prev) =>
          prev
            ? { ...prev, status: modalStatus, notes: modalNotes, current_stage: modalStage }
            : null
        )
        setUpdateSuccess(true)
        await loadRegistrations()
        await loadStats()
      } else {
        const data = await res.json()
        setUpdateError(data.error || 'Gagal memperbarui data')
      }
    } catch {
      setUpdateError('Terjadi kesalahan server saat menyimpan')
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateStatus = (status: string, notes: string, stage?: string) => {
    setModalStatus(status)
    setModalNotes(notes)
    if (stage) setModalStage(stage)
  }

  const handleExport = async (format: 'csv' | 'xlsx') => {
    setExporting(format)
    try {
      const params = new URLSearchParams({ format })
      if (search) params.set('search', search)
      if (divisionFilter) params.set('division', divisionFilter)
      if (statusFilter) params.set('status', statusFilter)

      const res = await adminFetch(`/api/admin/export?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      })

      if (!res.ok) {
        if (res.status === 401) {
          router.replace('/login?role=admin')
          return
        }
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Gagal mengekspor data pendaftar.')
        return
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const extension = format === 'xlsx' ? 'xlsx' : 'csv'
      const today = new Date().toISOString().split('T')[0]
      a.download = `rekap-pendaftar-${today}.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export error:', err)
      alert('Terjadi kesalahan saat mengunduh data pendaftar.')
    } finally {
      setExporting(null)
    }
  }

  if (checkingAuth || !verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium">Memverifikasi hak akses panitia...</p>
        </div>
      </div>
    )
  }

  // Main Admin Dashboard
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-base text-slate-900 hidden sm:block">PKM Center Admin</span>
              </Link>
              <span className="hidden sm:block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 rounded-full">Panel Panitia</span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors shadow-sm"
              >
                <Home className="h-4 w-4" />
                Beranda
              </Link>
              <button
                type="button"
                onClick={handleAdminLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors shadow-sm"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard Admin</h1>
              <p className="text-slate-500 mt-1">Kelola data pendaftar Open Recruitment PKM Center 2025</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Global Lock Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={lockRegistrations}
                onClick={() => setShowLockConfirmModal(true)}
                disabled={togglingLock}
                className={clsx(
                  'inline-flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all shadow-sm disabled:opacity-50',
                  lockRegistrations
                    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                )}
              >
                {lockRegistrations ? (
                  <Lock className="h-4 w-4 text-red-600 flex-shrink-0" />
                ) : (
                  <Unlock className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                )}
                <span>
                  {lockRegistrations ? 'Data Dikunci (Fix)' : 'Edit Pendaftar: Dibuka'}
                </span>
                <span
                  className={clsx(
                    'relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors',
                    lockRegistrations ? 'bg-red-600' : 'bg-emerald-500'
                  )}
                >
                  <span
                    className={clsx(
                      'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
                      lockRegistrations ? 'translate-x-4.5' : 'translate-x-1'
                    )}
                  />
                </span>
              </button>

              {/* Unified Export Data Dropdown */}
              <div className="relative" ref={exportDropdownRef}>
                <button
                  type="button"
                  onClick={() => setExportDropdownOpen((prev) => !prev)}
                  disabled={exporting !== null}
                  aria-haspopup="menu"
                  aria-expanded={exportDropdownOpen}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>
                    {exporting === 'xlsx'
                      ? 'Mengekspor Excel...'
                      : exporting === 'csv'
                      ? 'Mengekspor CSV...'
                      : 'Export Data'}
                  </span>
                  <ChevronDown
                    className={clsx(
                      'h-4 w-4 transition-transform duration-200',
                      exportDropdownOpen && 'rotate-180'
                    )}
                  />
                </button>

                {exportDropdownOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-fade-in"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setExportDropdownOpen(false)
                        handleExport('xlsx')
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <div>
                        <span className="block font-semibold">Export Excel (.xlsx)</span>
                        <span className="block text-[11px] text-slate-400">Format Microsoft Excel</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setExportDropdownOpen(false)
                        handleExport('csv')
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left"
                    >
                      <FileText className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                      <div>
                        <span className="block font-semibold">Export CSV (.csv)</span>
                        <span className="block text-[11px] text-slate-400">Comma-Separated Values</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2-Tab Navigation: Data Pendaftar vs Kelola Pengurus */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-sm inline-flex flex-wrap gap-1.5" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeAdminTab === 'registrations'}
              onClick={() => setActiveAdminTab('registrations')}
              className={clsx(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                activeAdminTab === 'registrations'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <Users className="h-4 w-4" />
              Data Pendaftar
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeAdminTab === 'board'}
              onClick={() => setActiveAdminTab('board')}
              className={clsx(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                activeAdminTab === 'board'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <Shield className="h-4 w-4" />
              Kelola Pengurus (Landing Page)
            </button>
          </div>

          {activeAdminTab === 'board' ? (
            <BoardManager />
          ) : (
            <>
          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <StatCard
              title="Total Pendaftar"
              value={stats?.total || 0}
              icon={Users}
              color="bg-indigo-600"
              subtitle={`${stats?.byStatus.pending || 0} pending`}
            />
            <StatCard
              title="Pending"
              value={stats?.byStatus.pending || 0}
              icon={Hourglass}
              color="bg-amber-600"
            />
            <StatCard
              title="Reviewed"
              value={stats?.byStatus.reviewed || 0}
              icon={Clock}
              color="bg-blue-600"
            />
            <StatCard
              title="Diterima"
              value={stats?.byStatus.accepted || 0}
              icon={UserCheck}
              color="bg-emerald-600"
            />
            <StatCard
              title="Ditolak"
              value={stats?.byStatus.rejected || 0}
              icon={UserX}
              color="bg-red-600"
            />
            <StatCard
              title="Divisi Terpopuler"
              value={Object.entries(stats?.byDivision || {}).sort((a, b) => b[1] - a[1])[0]?.[0]
                ? getDivisionLabel(Object.entries(stats?.byDivision || {}).sort((a, b) => b[1] - a[1])[0][0])
                : '-'}
              valueClassName="text-sm sm:text-base font-bold text-slate-900 mt-1 leading-snug break-words"
              icon={BarChart2}
              color="bg-purple-600"
              subtitle={Object.entries(stats?.byDivision || {}).sort((a, b) => b[1] - a[1])[0] ? `${Object.entries(stats?.byDivision || {}).sort((a, b) => b[1] - a[1])[0][1]} pendaftar` : 'Belum ada data'}
            />
          </div>

          {/* Filters & Search */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama, NIM, atau email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={divisionFilter}
                  onChange={(e) => { setDivisionFilter(e.target.value); handleSearch(); }}
                  className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-white min-w-[200px]"
                >
                  <option value="">Semua Divisi</option>
                  {DIVISIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); handleSearch(); }}
                  className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-white min-w-[180px]"
                >
                  <option value="">Semua Status</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>

                <button
                  onClick={handleSearch}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Terapkan</span>
                </button>
              </div>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Memuat data pendaftar...</p>
              </div>
            ) : registrations.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">Tidak ada data pendaftar</h3>
                <p className="text-sm text-slate-500">Coba ubah filter pencarian atau tunggu pendaftar baru</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full" role="grid">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        {[
                          { key: 'created_at', label: 'Tanggal' },
                          { key: 'full_name', label: 'Nama Lengkap' },
                          { key: 'student_id', label: 'NIM' },
                          { key: 'email', label: 'Email' },
                          { key: 'division_preference', label: 'Divisi' },
                          { key: 'status', label: 'Status' },
                          { key: 'current_stage', label: 'Tahapan' },
                          { key: 'actions', label: 'Aksi', sortable: false },
                        ].map((col) => (
                          <th
                            key={col.key}
                            scope="col"
                            className={clsx(
                              'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500',
                              col.sortable !== false && 'cursor-pointer hover:text-indigo-600 select-none'
                            )}
                            onClick={() => col.sortable !== false && handleSort(col.key)}
                            style={{ width: col.key === 'actions' ? '100px' : col.key === 'status' ? '130px' : undefined }}
                          >
                            <div className="flex items-center gap-1">
                              {col.label}
                              {sortBy === col.key && (
                                <span className="text-indigo-600">
                                  {sortOrder === 'asc' ? '▲' : '▼'}
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {registrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
                            {formatDateShort(reg.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">{reg.full_name}</div>
                            <div className="text-xs text-slate-500">{reg.phone}</div>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-slate-700">{reg.student_id}</td>
                          <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{reg.email}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {getDivisionLabel(reg.division_preference)}
                              {reg.division_preferences.length > 1 && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 rounded">+{reg.division_preferences.length - 1}</span>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {(() => {
                              const s = STATUS_LABELS[reg.status] || STATUS_LABELS.pending
                              const Icon = s.icon
                              return (
                                <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', s.color)}>
                                  <Icon className="h-3.5 w-3.5" />
                                  {s.label}
                                </span>
                              )
                            })()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {(() => {
                              const stageKey = reg.current_stage || 'seleksi_berkas'
                              const stage = STAGE_LABELS[stageKey] || STAGE_LABELS.seleksi_berkas
                              return (
                                <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border', stage.color)}>
                                  {stage.shortLabel}
                                </span>
                              )
                            })()}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleViewDetail(reg)}
                              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                              aria-label={`Lihat detail ${reg.full_name}`}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="px-4 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-sm text-slate-500">
                      Menampilkan {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} data
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setPagination((p) => ({ ...p, page: p.page - 1 })); loadRegistrations(); }}
                        disabled={pagination.page === 1}
                        className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Halaman sebelumnya"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum: number
                        if (pagination.totalPages <= 5) pageNum = i + 1
                        else if (pagination.page <= 3) pageNum = i + 1
                        else if (pagination.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i
                        else pageNum = pagination.page - 2 + i
                        return (
                          <button
                            key={pageNum}
                            onClick={() => { setPagination((p) => ({ ...p, page: pageNum })); loadRegistrations(); }}
                            className={clsx(
                              'w-10 h-10 rounded-xl text-sm font-medium transition-colors',
                              pagination.page === pageNum
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-500 hover:bg-slate-100'
                            )}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                      <button
                        onClick={() => { setPagination((p) => ({ ...p, page: p.page + 1 })); loadRegistrations(); }}
                        disabled={pagination.page === pagination.totalPages}
                        className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Halaman selanjutnya"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
            </>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="detail-title">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-4 sm:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 id="detail-title" className="text-lg font-bold text-slate-900">Detail Pendaftar</h2>
                  <p className="text-xs text-slate-500">ID: {selectedReg.id.slice(0, 8)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReg(null)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                aria-label="Tutup detail"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6" style={{ maxHeight: '70vh', overflow: 'auto' }}>
              {/* Status & Quick Actions */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const s = STATUS_LABELS[selectedReg.status] || STATUS_LABELS.pending
                      const Icon = s.icon
                      return (
                        <span className={clsx('inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold', s.color)}>
                          <Icon className="h-4 w-4" />
                          {s.label}
                        </span>
                      )
                    })()}
                    {(() => {
                      const stageKey = selectedReg.current_stage || 'seleksi_berkas'
                      const stage = STAGE_LABELS[stageKey] || STAGE_LABELS.seleksi_berkas
                      return (
                        <span className={clsx('inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border', stage.color)}>
                          {stage.label}
                        </span>
                      )
                    })()}
                    <span className="text-xs text-slate-500">Daftar: {formatDate(selectedReg.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Column: Personal Info */}
                <div className="space-y-5">
                  <SectionTitle icon={FileText} title="Data Pribadi" />
                  <InfoGrid>
                    <InfoItem label="Nama Lengkap" value={selectedReg.full_name} />
                    <InfoItem label="NIM" value={selectedReg.student_id} copyable />
                    <InfoItem label="Email" value={selectedReg.email} copyable />
                    <InfoItem label="WhatsApp" value={selectedReg.phone} copyable />
                    <InfoItem label="Fakultas" value={selectedReg.faculty || '-'} />
                    <InfoItem label="Program Studi" value={selectedReg.major} />
                    <InfoItem label="Angkatan" value={selectedReg.batch} />
                    <InfoItem label="Instagram" value={`@${selectedReg.instagram}`} />
                    {selectedReg.linkedin && (
                      <InfoItem label="LinkedIn" value={selectedReg.linkedin} link />
                    )}
                    {selectedReg.portfolio && (
                      <InfoItem label="Portfolio URL" value={selectedReg.portfolio} link />
                    )}
                  </InfoGrid>
                </div>

                {/* Right Column: Division & Motivation */}
                <div className="space-y-5">
                  <SectionTitle icon={Users} title="Divisi Terpilih & Alasan" />
                  <div className="space-y-4">
                    {(() => {
                      const divs =
                        selectedReg.division_preferences?.length
                          ? selectedReg.division_preferences.slice(0, 1)
                          : [selectedReg.division_preference].filter(Boolean)
                      return divs.map((divKey) => {
                        const reason = selectedReg.division_reasons?.[divKey]
                        return (
                          <div key={divKey} className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white">
                                Divisi Terpilih
                              </span>
                              <span className="text-sm font-semibold text-slate-900">
                                {getDivisionLabel(divKey)}
                              </span>
                            </div>
                            {reason && (
                              <div className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-indigo-100 leading-relaxed">
                                <span className="font-medium text-slate-900 block mb-1">
                                  Alasan Memilih {getDivisionLabel(divKey)}:
                                </span>
                                "{reason}"
                              </div>
                            )}
                          </div>
                        )
                      })
                    })()}
                  </div>

                  <SectionTitle icon={FileText} title="Motivasi" />
                  <div className="prose prose-sm max-w-none text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">
                    {selectedReg.motivation}
                  </div>
                </div>
              </div>

              {/* Files Section */}
              <div className="pt-4 border-t border-slate-100">
                <SectionTitle icon={Upload} title="Berkas Pendukung" />
                <div className="grid sm:grid-cols-2 gap-4">
                  <FileCard
                    title="CV (Wajib)"
                    icon={FileText}
                    url={selectedReg.cv_url}
                    label="Buka CV"
                  />
                  <FileCard
                    title="Portofolio (Opsional)"
                    icon={Upload}
                    url={selectedReg.portfolio_url}
                    label="Buka Portofolio"
                  />
                </div>
              </div>

              {/* Status Update Form */}
              <div className="pt-4 border-t border-slate-100 bg-amber-50 rounded-2xl p-5 border border-amber-100">
                <h3 className="font-semibold text-amber-900 flex items-center gap-2 mb-4">
                  <Edit className="h-5 w-5" />
                  Update Status & Catatan Panitia
                </h3>

                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Status Seleksi</label>
                      <select
                        value={modalStatus}
                        onChange={(e) => {
                          const newStatus = e.target.value
                          setModalStatus(newStatus)
                          if (newStatus === 'accepted' && modalStage === 'seleksi_berkas') {
                            setModalStage('wawancara')
                          }
                        }}
                        disabled={updating}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Tahapan Seleksi Peserta</label>
                      <select
                        value={modalStage}
                        onChange={(e) => setModalStage(e.target.value)}
                        disabled={updating}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                      >
                        {STAGE_OPTIONS.map((stage) => (
                          <option key={stage.value} value={stage.value}>{stage.label}</option>
                        ))}
                      </select>
                      {modalStatus === 'accepted' && (
                        <p className="text-xs text-amber-800 mt-1.5">
                          Tip: Tahap otomatis disarankan ke Wawancara saat diterima. Anda dapat mengubahnya sebelum menyimpan.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Catatan Panitia (Opsional)</label>
                    <textarea
                      value={modalNotes}
                      onChange={(e) => setModalNotes(e.target.value)}
                      disabled={updating}
                      rows={3}
                      placeholder="Tulis catatan internal untuk pendaftar ini..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white resize-none"
                    />
                  </div>

                  {updateError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2" role="alert">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      {updateError}
                    </div>
                  )}

                  {updateSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2" role="status">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                      Perubahan status dan catatan berhasil disimpan!
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSaveModal}
                    disabled={updating}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Menyimpan perubahan...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Lock Confirmation Modal */}
      {showLockConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lock-confirm-title"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={clsx(
                  'flex h-12 w-12 items-center justify-center rounded-full flex-shrink-0',
                  lockRegistrations ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                )}
              >
                {lockRegistrations ? <Unlock className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
              </div>
              <div>
                <h3 id="lock-confirm-title" className="text-lg font-bold text-slate-900">
                  {lockRegistrations ? 'Buka Kembali Edit Pendaftar?' : 'Kunci Semua Data Pendaftar (Fix)?'}
                </h3>
                <p className="text-xs text-slate-500">Pengaturan Global Sistem</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {lockRegistrations
                ? 'Pendaftar dengan status Pending akan kembali diizinkan untuk mengedit data atau membatalkan pendaftarannya dari dashboard peserta.'
                : 'Seluruh pendaftar (termasuk yang masih berstatus Pending) tidak akan lagi dapat mengedit data maupun membatalkan pendaftarannya. Gunakan fitur ini saat masa revisi/perubahan data telah resmi ditutup.'}
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLockConfirmModal(false)}
                disabled={togglingLock}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmToggleLock}
                disabled={togglingLock}
                className={clsx(
                  'flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50',
                  lockRegistrations ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                )}
              >
                {togglingLock ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : lockRegistrations ? (
                  'Ya, Buka Akses Edit'
                ) : (
                  'Ya, Kunci Data (Fix)'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  )
}

// Helper Components
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  valueClassName,
}: {
  title: string
  value: number | string
  icon: React.ComponentType<{ className?: string }>
  color: string
  subtitle?: string
  valueClassName?: string
}) {
  const isTextLong = typeof value === 'string' && value.length > 8

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p
            className={clsx(
              valueClassName ||
                (isTextLong
                  ? 'text-sm sm:text-base font-bold text-slate-900 mt-1 leading-snug break-words'
                  : 'text-3xl font-bold text-slate-900 mt-1')
            )}
          >
            {value}
          </p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={clsx('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
      <Icon className="h-5 w-5 text-indigo-600" />
      {title}
    </h3>
  )
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>
}

function InfoItem({ label, value, copyable, link }: { label: string; value: string; copyable?: boolean; link?: boolean }) {
  return (
    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
      <span className="text-xs text-slate-500 block mb-0.5">{label}</span>
      {link ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-900 text-sm inline-flex items-center gap-1 hover:text-indigo-600 transition-colors">
          {value}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : (
        <span className="font-semibold text-slate-900 text-sm">{value}</span>
      )}
    </div>
  )
}

function FileCard({ title, icon: Icon, url, label }: { title: string; icon: React.ComponentType<{ className?: string }>; url?: string; label: string }) {
  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
          <Icon className="h-5 w-5 text-indigo-600" />
        </div>
        <span className="font-medium text-slate-900">{title}</span>
      </div>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          {label}
        </a>
      ) : (
        <div className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center text-sm text-slate-500">
          Belum diupload
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium">Memuat panel admin...</p>
          </div>
        </div>
      }
    >
      <AdminDashboard />
    </Suspense>
  )
}