'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Quote,
  X,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react'
import { clsx } from 'clsx'
import { supabase } from '@/lib/supabase'

export interface BoardMember {
  id: string
  name: string
  position: string
  division: string
  period: string
  quote?: string | null
  photo_url?: string | null
  display_order: number
  created_at?: string
}

const BOARD_DIVISIONS = [
  'Pengurus Inti',
  'Tim System',
  'Data',
  'Design',
  'Public Relation',
] as const

const DIVISION_BADGE_COLORS: Record<string, string> = {
  'Pengurus Inti': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Tim System': 'bg-blue-100 text-blue-800 border-blue-200',
  Data: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Design: 'bg-purple-100 text-purple-800 border-purple-200',
  'Public Relation': 'bg-amber-100 text-amber-800 border-amber-200',
}

const MAX_QUOTE_CHARS = 150

export default function BoardManager() {
  const [members, setMembers] = useState<BoardMember[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [position, setPosition] = useState('')
  const [division, setDivision] = useState<string>('Pengurus Inti')
  const [period, setPeriod] = useState('2025/2026')
  const [quote, setQuote] = useState('')
  const [displayOrder, setDisplayOrder] = useState<string>('1')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<BoardMember | null>(null)
  const [deleting, setDeleting] = useState(false)

  const getAuthHeaders = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const headers: Record<string, string> = {}
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }
    return headers
  }

  const loadMembers = useCallback(async () => {
    setLoading(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/board', { headers })
      if (res.ok) {
        const json = await res.json()
        setMembers(json.data || [])
      }
    } catch (err) {
      console.error('Failed to load board members:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setPosition('')
    setDivision('Pengurus Inti')
    setPeriod('2025/2026')
    setQuote('')
    setDisplayOrder(String(members.length + 1))
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg('File foto harus berupa gambar (JPG, PNG, WEBP).')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file foto maksimal 5MB.')
      return
    }

    setErrorMsg('')
    setPhotoFile(file)
    const objectUrl = URL.createObjectURL(file)
    setPhotoPreview(objectUrl)
  }

  const handleStartEdit = (member: BoardMember) => {
    setEditingId(member.id)
    setName(member.name)
    setPosition(member.position)
    setDivision(member.division)
    setPeriod(member.period || '2025/2026')
    setQuote(member.quote || '')
    setDisplayOrder(String(member.display_order ?? 0))
    setPhotoFile(null)
    setPhotoPreview(member.photo_url || null)
    setErrorMsg('')
    setSuccessMsg('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!name.trim() || !position.trim() || !division || !period.trim()) {
      setErrorMsg('Nama lengkap, jabatan, divisi, dan periode wajib diisi.')
      return
    }

    if (quote.trim().length > MAX_QUOTE_CHARS) {
      setErrorMsg(`Quotes maksimal ${MAX_QUOTE_CHARS} karakter.`)
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('position', position.trim())
      formData.append('division', division)
      formData.append('period', period.trim())
      formData.append('quote', quote.trim())
      formData.append('display_order', displayOrder || '0')
      if (photoFile) {
        formData.append('photo', photoFile)
      }

      const headers = await getAuthHeaders()
      const url = editingId ? `/api/admin/board/${editingId}` : '/api/admin/board'
      const res = await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers,
        body: formData,
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrorMsg(json.error || 'Gagal menyimpan data pengurus.')
        return
      }

      setSuccessMsg(
        editingId ? 'Data pengurus berhasil diperbarui!' : 'Pengurus baru berhasil ditambahkan!'
      )
      await loadMembers()
      resetForm()
    } catch (err) {
      console.error('Submit board member error:', err)
      setErrorMsg('Terjadi kesalahan server saat menyimpan data pengurus.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`/api/admin/board/${deleteTarget.id}`, {
        method: 'DELETE',
        headers,
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrorMsg(json.error || 'Gagal menghapus data pengurus.')
        return
      }

      if (editingId === deleteTarget.id) {
        resetForm()
      }
      setDeleteTarget(null)
      setSuccessMsg('Data pengurus berhasil dihapus.')
      await loadMembers()
    } catch (err) {
      console.error('Delete board member error:', err)
      setErrorMsg('Terjadi kesalahan server saat menghapus pengurus.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Feedback Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg('')} className="text-red-500 hover:text-red-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Form Tambah / Edit Pengurus */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              {editingId ? <Edit3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Data Pengurus' : 'Tambah Pengurus Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                Pengurus yang ditambahkan akan langsung tampil di section Struktur Kepengurusan pada Landing Page (/).
              </p>
            </div>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Batal Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left: Photo Upload & Preview */}
          <div className="lg:col-span-4 space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Foto Pengurus (Rasio 4:5 / Portrait)
            </label>
            <div className="relative aspect-[4/5] w-full max-w-[240px] mx-auto lg:mx-0 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex flex-col items-center justify-center">
              {photoPreview ? (
                <>
                  <img
                    src={photoPreview}
                    alt="Preview foto pengurus"
                    className="w-full h-full object-cover object-top"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null)
                      setPhotoPreview(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                    aria-label="Hapus preview foto"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="text-center p-4 text-slate-400 space-y-2">
                  <ImageIcon className="h-10 w-10 mx-auto text-slate-300" />
                  <p className="text-xs font-medium text-slate-500">Belum ada foto dipilih</p>
                  <p className="text-[11px] text-slate-400">JPG, PNG, WEBP • Maks. 5MB</p>
                </div>
              )}
            </div>

            <div className="max-w-[240px] mx-auto lg:mx-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                className="hidden"
                id="board-photo-input"
              />
              <label
                htmlFor="board-photo-input"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 cursor-pointer transition-colors"
              >
                <Upload className="h-4 w-4" />
                {photoPreview ? 'Ganti Foto' : 'Unggah Foto'}
              </label>
            </div>
          </div>

          {/* Right: Fields */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Ahmad Fauzan"
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Jabatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Contoh: Ketua Umum / Kepala Divisi"
                  required
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Divisi <span className="text-red-500">*</span>
                </label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {BOARD_DIVISIONS.map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Periode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="2025/2026"
                    required
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Quotes / Motto Singkat (Opsional)
              </label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value.slice(0, MAX_QUOTE_CHARS))}
                rows={3}
                maxLength={MAX_QUOTE_CHARS}
                placeholder="Contoh: Inovasi lahir dari keberanian untuk terus belajar dan berkolaborasi."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
              />
              <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                <span>Akan tampil dengan gaya kutipan di bawah kartu pengurus pada Landing Page.</span>
                <span
                  className={clsx(
                    'font-semibold',
                    quote.length >= MAX_QUOTE_CHARS ? 'text-amber-600' : 'text-slate-500'
                  )}
                >
                  {quote.length} / {MAX_QUOTE_CHARS} karakter
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : editingId ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Simpan Perubahan
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Tambah Pengurus
                  </>
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Daftar Pengurus */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Daftar Pengurus Aktif ({members.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Diurutkan berdasarkan angka Urutan Tampil terkecil ke terbesar.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Memuat daftar pengurus...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-900 mb-1">Belum ada data pengurus</h3>
            <p className="text-xs text-slate-500">
              Tambahkan pengurus melalui form di atas agar tampil di Landing Page.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {members.map((member) => (
              <div
                key={member.id}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[4/4] bg-slate-100 overflow-hidden">
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={member.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-bold text-3xl">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-black/65 text-white backdrop-blur-sm">
                    Urutan #{member.display_order}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={clsx(
                        'px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
                        DIVISION_BADGE_COLORS[member.division] ||
                          'bg-slate-100 text-slate-700 border-slate-200'
                      )}
                    >
                      {member.division}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">{member.period}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{member.name}</h3>
                  <p className="text-xs text-indigo-600 font-medium mt-0.5">{member.position}</p>

                  {member.quote && member.quote.trim() !== '' && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic flex items-start gap-1.5">
                      <Quote className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-3">"{member.quote}"</span>
                    </div>
                  )}

                  <div className="mt-auto pt-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(member)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(member)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Hapus Pengurus?</h3>
                <p className="text-xs text-slate-500">Data & foto di Storage akan dihapus permanen</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Apakah Anda yakin ingin menghapus{' '}
              <span className="font-semibold text-slate-900">{deleteTarget.name}</span> ({deleteTarget.position}) dari daftar pengurus?
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  'Ya, Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
