'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Mail,
  Phone,
  User,
  Award,
  BookOpen,
  Target,
  MessageSquare,
  Link2,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Clock,
  Shield,
  FileText,
  Upload,
  AlertTriangle,
  ExternalLink,
  ArrowLeft,
  Layers,
  Building2,
} from 'lucide-react'
import { clsx } from 'clsx'
import {
  registrationSchema,
  type RegistrationFormData,
  FACULTIES,
  UNY_FACULTIES_AND_MAJORS,
  findFacultyByMajor,
  BATCHES,
  DIVISIONS,
  countWords,
  MIN_MOTIVATION_WORDS,
  MIN_DIVISION_REASON_CHARS,
} from '@/types/registration'
import { supabase } from '@/lib/supabase'
import type { UseFormRegister } from 'react-hook-form'

// --- Extracted sub-components (defined outside RegistrationForm to keep stable references and prevent focus loss) ---

function SelectField({
  label,
  name,
  options,
  placeholder,
  icon: Icon,
  error,
  register,
  disabled = false,
  onValueChange,
}: {
  label: string
  name: keyof RegistrationFormData
  options: readonly string[] | readonly { value: string; label: string }[]
  placeholder: string
  icon: React.ComponentType<{ className?: string }>
  error?: string
  register: UseFormRegister<RegistrationFormData>
  disabled?: boolean
  onValueChange?: (value: string) => void
}) {
  const registered = register(name, {
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
      onValueChange?.(e.target.value)
    },
  })

  return (
    <div className="relative">
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} <span className="text-red-500" aria-hidden="true">*</span>
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
        <select
          id={name}
          {...registered}
          disabled={disabled}
          className={clsx(
            'w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            'transition-colors',
            disabled
              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              : error
              ? 'border-red-300 bg-red-50 text-red-900'
              : 'bg-white border-slate-200 hover:border-slate-300'
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt, index) => (
            <option key={index} value={typeof opt === 'string' ? opt : opt.value}>
              {typeof opt === 'string' ? opt : opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
          aria-hidden="true"
        />
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600 flex items-center gap-1" role="alert">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

function InputField({
  label,
  name,
  type = 'text',
  placeholder,
  icon: Icon,
  error,
  register,
  required = true,
  className,
  ...props
}: {
  label: string
  name: keyof RegistrationFormData
  type?: string
  placeholder: string
  icon: React.ComponentType<{ className?: string }>
  error?: string
  register: UseFormRegister<RegistrationFormData>
  required?: boolean
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'>) {
  return (
    <div className="relative">
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{' '}
        {required && (
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
        <input
          id={name}
          type={type}
          {...register(name)}
          placeholder={placeholder}
          className={clsx(
            'w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border bg-white',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            'transition-colors',
            error
              ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300'
              : 'border-slate-200 hover:border-slate-300',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-red-600 flex items-center gap-1" role="alert">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

export interface EditableRegistrationData {
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
}

interface RegistrationFormProps {
  initialFullName?: string
  initialEmail?: string
  editMode?: boolean
  initialData?: EditableRegistrationData | null
  onSuccess?: () => void
  onCancelEdit?: () => void
}

export default function RegistrationForm({
  initialFullName = '',
  initialEmail = '',
  editMode = false,
  initialData = null,
  onSuccess,
  onCancelEdit,
}: RegistrationFormProps = {}) {
  const validDivisionValues = new Set<string>(DIVISIONS.map((d) => d.value))
  const rawInitialDivision =
    editMode && initialData
      ? initialData.division_preferences?.[0] || initialData.division_preference || ''
      : ''
  const initialDivision = validDivisionValues.has(rawInitialDivision) ? rawInitialDivision : ''
  const initialReasons = editMode && initialData ? initialData.division_reasons || {} : {}

  const initialFaculty =
    editMode && initialData
      ? initialData.faculty || findFacultyByMajor(initialData.major)
      : ''
  const initialMajor = editMode && initialData ? initialData.major || '' : ''

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedDivision, setSelectedDivision] = useState<string>(initialDivision)
  const [divisionReasons, setDivisionReasons] = useState<Record<string, string>>(initialReasons)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvError, setCvError] = useState('')
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null)
  const [portfolioError, setPortfolioError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      full_name: editMode && initialData ? initialData.full_name : initialFullName,
      email: editMode && initialData ? initialData.email : initialEmail,
      phone: editMode && initialData ? initialData.phone : '',
      student_id: editMode && initialData ? initialData.student_id : '',
      faculty: initialFaculty,
      major: initialMajor,
      batch: editMode && initialData ? initialData.batch : '',
      motivation: editMode && initialData ? initialData.motivation : '',
      division_preferences: initialDivision ? [initialDivision] : [],
      division_reasons: initialDivision && initialReasons[initialDivision]
        ? { [initialDivision]: initialReasons[initialDivision] }
        : {},
      instagram: editMode && initialData ? initialData.instagram : '',
      linkedin: editMode && initialData ? initialData.linkedin || '' : '',
      portfolio: editMode && initialData ? initialData.portfolio || '' : '',
      cv_file: undefined,
      portfolio_file: undefined,
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  // Sync selectedDivision (single-select) to form value so Zod validation works in real-time
  useEffect(() => {
    setValue('division_preferences', selectedDivision ? [selectedDivision] : [], {
      shouldValidate: true,
    })
  }, [selectedDivision, setValue])

  // Sync only the selected division's reason to form value
  useEffect(() => {
    if (selectedDivision && divisionReasons[selectedDivision] !== undefined) {
      setValue(
        'division_reasons',
        { [selectedDivision]: divisionReasons[selectedDivision] },
        { shouldValidate: true }
      )
    } else {
      setValue('division_reasons', {}, { shouldValidate: true })
    }
  }, [selectedDivision, divisionReasons, setValue])

  // Synchronize initial user props if they load asynchronously
  useEffect(() => {
    if (!editMode && initialFullName) {
      setValue('full_name', initialFullName)
    }
  }, [editMode, initialFullName, setValue])

  useEffect(() => {
    if (!editMode && initialEmail) {
      setValue('email', initialEmail)
    }
  }, [editMode, initialEmail, setValue])

  const watchedFullName = watch('full_name')
  const watchedEmail = watch('email')
  const watchedFaculty = watch('faculty') || ''
  const availableMajors = watchedFaculty ? UNY_FACULTIES_AND_MAJORS[watchedFaculty] || [] : []
  const watchedMotivation = watch('motivation') || ''
  const motivationWordCount = countWords(watchedMotivation)
  const isMotivationValid = motivationWordCount >= MIN_MOTIVATION_WORDS

  const selectedDivisionObj = DIVISIONS.find((d) => d.value === selectedDivision)
  const currentDivisionReason = selectedDivision ? divisionReasons[selectedDivision] || '' : ''
  const hasValidDivisionReason =
    Boolean(selectedDivision) && currentDivisionReason.trim().length >= MIN_DIVISION_REASON_CHARS

  const handleSelectDivision = (divisionId: string) => {
    setSelectedDivision(divisionId)
  }

  const handleDivisionReasonChange = (divisionId: string, reason: string) => {
    setDivisionReasons((prev) => ({ ...prev, [divisionId]: reason }))
  }

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setCvError('CV harus berformat PDF')
        setCvFile(null)
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setCvError('Ukuran CV maksimal 10MB')
        setCvFile(null)
        return
      }
      setCvError('')
      setCvFile(file)
      setValue('cv_file', file)
    }
  }

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setPortfolioError('Ukuran file maksimal 10MB')
        setPortfolioFile(null)
        return
      }
      setPortfolioError('')
      setPortfolioFile(file)
      setValue('portfolio_file', file)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const onSubmit = async (data: RegistrationFormData) => {
    if (countWords(data.motivation) < MIN_MOTIVATION_WORDS) {
      setSubmitStatus('error')
      setErrorMessage(`Motivasi bergabung minimal ${MIN_MOTIVATION_WORDS} kata.`)
      return
    }

    setSubmitStatus('submitting')
    setErrorMessage('')

    try {
      const formData = new FormData()
      const singleDivisions = selectedDivision ? [selectedDivision] : []
      const singleReasons = selectedDivision
        ? { [selectedDivision]: (divisionReasons[selectedDivision] || '').trim() }
        : {}

      Object.entries(data).forEach(([key, value]) => {
        if (key === 'division_preferences') {
          formData.append(key, JSON.stringify(singleDivisions))
        } else if (key === 'division_reasons') {
          formData.append(key, JSON.stringify(singleReasons))
        } else if (key === 'cv_file' || key === 'portfolio_file') {
          if (value instanceof File) {
            formData.append(key, value)
          }
        } else if (value !== null && value !== undefined && value !== '') {
          formData.append(key, String(value))
        }
      })

      const headers: Record<string, string> = {}
      if (editMode) {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session?.access_token) {
          throw new Error('Sesi login telah berakhir. Silakan login kembali.')
        }
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch('/api/register', {
        method: editMode ? 'PATCH' : 'POST',
        headers,
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error ||
            (editMode ? 'Terjadi kesalahan saat memperbarui data' : 'Terjadi kesalahan saat mendaftar')
        )
      }

      setSubmitStatus('success')
      onSuccess?.()

      if (!editMode) {
        Object.keys(data).forEach((key) => {
          if (key === 'cv_file' || key === 'portfolio_file') {
            setValue(key as keyof RegistrationFormData, undefined)
          } else {
            setValue(key as keyof RegistrationFormData, '' as any)
          }
        })
        setValue('faculty', '')
        setValue('major', '')
        setValue('batch', '')
        setValue('division_preferences', [])
        setValue('division_reasons', {})
        setSelectedDivision('')
        setDivisionReasons({})
        setCvFile(null)
        setPortfolioFile(null)
        setCvError('')
        setPortfolioError('')
      }
    } catch (err) {
      setSubmitStatus('error')
      setErrorMessage(
        err instanceof Error
          ? err.message
          : editMode
          ? 'Gagal memperbarui data pendaftaran. Coba lagi nanti.'
          : 'Gagal mengirim pendaftaran. Coba lagi nanti.'
      )
    }
  }

  const handleFormSubmit = () => {
    setValue('division_preferences', selectedDivision ? [selectedDivision] : [])
    setValue(
      'division_reasons',
      selectedDivision ? { [selectedDivision]: divisionReasons[selectedDivision] || '' } : {}
    )
    if (cvFile) setValue('cv_file', cvFile)
    if (portfolioFile) setValue('portfolio_file', portfolioFile)
    setShowConfirmModal(true)
  }

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false)
    handleSubmit(onSubmit)()
  }

  const isSubmitDisabled =
    isSubmitting ||
    !selectedDivision ||
    !hasValidDivisionReason ||
    !isMotivationValid ||
    !!cvError ||
    !!portfolioError ||
    !!errors.cv_file ||
    !!errors.portfolio_file

  return (
    <section id="register" className="w-full" aria-labelledby="register-heading">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Horizontal Info & Basic Requirements Bar */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
          <div className="grid lg:grid-cols-12 gap-5 items-center">
            {/* Title + Quick Info */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex-shrink-0">
                    <User className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 id="register-heading" className="text-xl font-bold text-slate-900">
                      {editMode ? 'Edit Data Pendaftaran' : 'Form Pendaftaran'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                      {editMode
                        ? 'Perbarui data formulir selama status masih Pending'
                        : 'Open Recruitment PKM Center UNY 2025'}
                    </p>
                  </div>
                </div>

                {editMode && onCancelEdit && (
                  <button
                    type="button"
                    onClick={onCancelEdit}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Kembali
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { icon: Clock, text: 'Waktu isi: ~5-7 menit' },
                  { icon: Shield, text: 'Data aman & terenkripsi' },
                  { icon: CheckCircle2, text: 'Konfirmasi via email & WA' },
                ].map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-600"
                  >
                    <item.icon className="h-3.5 w-3.5 text-indigo-600" aria-hidden="true" />
                    {item.text}
                  </span>
                ))}
              </div>
            </div>

            {/* Persyaratan Dasar (Horizontal Compact Box) */}
            <div className="lg:col-span-6 rounded-2xl bg-indigo-50/70 p-4 border border-indigo-100">
              <h4 className="font-semibold text-indigo-900 text-xs sm:text-sm mb-2 flex items-center gap-1.5">
                <Target className="h-4 w-4 text-indigo-600" />
                Persyaratan Dasar
              </h4>
              <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-indigo-800">
                <li>• Mahasiswa aktif (semester 1-6)</li>
                <li>• Memiliki NIM & email kampus valid</li>
                <li>• Bersedia aktif minimal 1 semester</li>
                <li>• Komitmen hadir di kegiatan rutin</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Wide Rectangular Form Panel (2 Balanced Columns) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
          {submitStatus === 'success' ? (
            <div className="text-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {editMode ? 'Perubahan Berhasil Disimpan!' : 'Pendaftaran Berhasil!'}
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {editMode
                  ? 'Data pendaftaran Anda telah diperbarui di sistem.'
                  : 'Terima kasih telah mendaftar. Tim kami akan meninjau formulirmu dan mengirimkan informasi selanjutnya ke email & WhatsApp dalam 1-2 hari kerja.'}
              </p>
              <button
                onClick={() => setSubmitStatus('idle')}
                className="px-6 py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
              >
                {editMode ? 'Selesai' : 'Daftar Lagi'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
              {/* Status Error */}
              {submitStatus === 'error' && (
                <div
                  className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
                  role="alert"
                >
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Gagal Mengirim</p>
                    <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* 2-Column Balanced Form Grid */}
              <div className="grid lg:grid-cols-2 gap-8 items-start">
                {/* ==================== KOLOM KIRI: Data Pribadi, Sosmed, & Berkas ==================== */}
                <div className="space-y-6">
                  {/* Personal Info */}
                  <fieldset className="space-y-4">
                    <legend className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100 w-full">
                      <User className="h-4 w-4 text-indigo-600" />
                      Data Pribadi
                    </legend>
                    <div className="grid sm:grid-cols-2 gap-3.5">
                      <InputField
                        label="Nama Lengkap"
                        name="full_name"
                        placeholder="Sesuai KTM"
                        icon={User}
                        error={errors.full_name?.message}
                        register={register}
                      />
                      <InputField
                        label="Email Mahasiswa"
                        name="email"
                        type="email"
                        placeholder="nama@student.uny.ac.id"
                        icon={Mail}
                        error={errors.email?.message}
                        register={register}
                        readOnly={editMode}
                        className={
                          editMode
                            ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                            : undefined
                        }
                      />
                      <InputField
                        label="WhatsApp (Aktif)"
                        name="phone"
                        type="tel"
                        placeholder="081234567890"
                        icon={Phone}
                        error={errors.phone?.message}
                        register={register}
                      />
                      <InputField
                        label="NIM"
                        name="student_id"
                        placeholder="Contoh: 2106012345"
                        icon={Award}
                        error={errors.student_id?.message}
                        register={register}
                      />
                      <SelectField
                        label="Fakultas"
                        name="faculty"
                        options={FACULTIES}
                        placeholder="Pilih fakultas UNY"
                        icon={Building2}
                        error={errors.faculty?.message}
                        register={register}
                        onValueChange={() => {
                          setValue('major', '', { shouldValidate: false })
                        }}
                      />
                      <SelectField
                        label="Program Studi"
                        name="major"
                        options={availableMajors}
                        placeholder={
                          watchedFaculty
                            ? 'Pilih program studi'
                            : 'Pilih fakultas terlebih dahulu'
                        }
                        icon={BookOpen}
                        error={errors.major?.message}
                        register={register}
                        disabled={!watchedFaculty}
                      />
                      <div className="sm:col-span-2">
                        <SelectField
                          label="Angkatan"
                          name="batch"
                          options={BATCHES}
                          placeholder="Pilih angkatan"
                          icon={Award}
                          error={errors.batch?.message}
                          register={register}
                        />
                      </div>
                    </div>
                  </fieldset>

                  {/* File Upload: CV & Portfolio */}
                  <fieldset className="space-y-4">
                    <legend className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100 w-full">
                      <FileText className="h-4 w-4 text-indigo-600" />
                      Unggah Berkas (CV & Portofolio)
                    </legend>

                    {/* CV Upload */}
                    <div className="relative">
                      <label htmlFor="cv_file" className="block text-sm font-medium text-slate-700 mb-1.5">
                        CV (PDF) {!editMode && <span className="text-red-500" aria-hidden="true">*</span>}
                        {editMode && (
                          <span className="text-xs font-normal text-slate-500 ml-1">
                            (Opsional jika tidak diganti)
                          </span>
                        )}
                      </label>
                      {editMode && initialData?.cv_url && !cvFile && (
                        <div className="mb-2.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs text-emerald-800">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                            <span>CV lama tersimpan & dipertahankan jika tidak diubah.</span>
                          </div>
                          <a
                            href={initialData.cv_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline whitespace-nowrap"
                          >
                            Lihat CV
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                      <div className="relative">
                        <FileText
                          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                          aria-hidden="true"
                        />
                        <input
                          id="cv_file"
                          type="file"
                          accept="application/pdf"
                          onChange={handleCvChange}
                          className={clsx(
                            'w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border bg-white',
                            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                            'transition-colors cursor-pointer',
                            cvError
                              ? 'border-red-300 bg-red-50 text-red-900'
                              : 'border-slate-200 hover:border-slate-300'
                          )}
                          aria-invalid={cvError ? 'true' : 'false'}
                          aria-describedby={cvError ? 'cv-error' : undefined}
                        />
                      </div>
                      {cvFile && (
                        <div className="mt-2 p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-indigo-900 truncate">{cvFile.name}</p>
                              <p className="text-[11px] text-indigo-700">{formatFileSize(cvFile.size)} • PDF</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setCvFile(null)
                              setCvError('')
                              setValue('cv_file', undefined)
                            }}
                            className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold ml-2"
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                      {cvError && (
                        <p id="cv-error" className="mt-1 text-xs text-red-600 flex items-center gap-1" role="alert">
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                          {cvError}
                        </p>
                      )}
                      {errors.cv_file && !cvError && (
                        <p id="cv-error" className="mt-1 text-xs text-red-600 flex items-center gap-1" role="alert">
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                          {errors.cv_file.message}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-slate-500">Format PDF • Maksimal 10MB</p>
                    </div>

                    {/* Portfolio Upload */}
                    <div className="relative">
                      <label htmlFor="portfolio_file" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Portofolio (Opsional)
                      </label>
                      {editMode && initialData?.portfolio_url && !portfolioFile && (
                        <div className="mb-2.5 p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs text-indigo-800">
                            <CheckCircle2 className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                            <span>Portofolio lama tersimpan & dipertahankan jika tidak diubah.</span>
                          </div>
                          <a
                            href={initialData.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:underline whitespace-nowrap"
                          >
                            Lihat File
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                      <div className="relative">
                        <Upload
                          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                          aria-hidden="true"
                        />
                        <input
                          id="portfolio_file"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.zip"
                          onChange={handlePortfolioChange}
                          className={clsx(
                            'w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border bg-white',
                            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                            'transition-colors cursor-pointer',
                            portfolioError
                              ? 'border-red-300 bg-red-50 text-red-900'
                              : 'border-slate-200 hover:border-slate-300'
                          )}
                          aria-invalid={portfolioError ? 'true' : 'false'}
                          aria-describedby={portfolioError ? 'portfolio-error' : undefined}
                        />
                      </div>
                      {portfolioFile && (
                        <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <FileText className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-emerald-900 truncate">{portfolioFile.name}</p>
                              <p className="text-[11px] text-emerald-700">{formatFileSize(portfolioFile.size)}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setPortfolioFile(null)
                              setPortfolioError('')
                              setValue('portfolio_file', undefined)
                            }}
                            className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold ml-2"
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                      {portfolioError && (
                        <p id="portfolio-error" className="mt-1 text-xs text-red-600 flex items-center gap-1" role="alert">
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                          {portfolioError}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-slate-500">Opsional • PDF, JPG, PNG, ZIP • Maksimal 10MB</p>
                    </div>
                  </fieldset>

                  {/* Social Links */}
                  <fieldset className="space-y-3.5">
                    <legend className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100 w-full">
                      <Globe className="h-4 w-4 text-indigo-600" />
                      Media Sosial & Link Tambahan
                    </legend>
                    <div className="grid sm:grid-cols-2 gap-3.5">
                      <InputField
                        label="Instagram Username"
                        name="instagram"
                        placeholder="tanpa @ (contoh: budi.santoso)"
                        icon={MessageSquare}
                        error={errors.instagram?.message}
                        register={register}
                      />
                      <InputField
                        label="LinkedIn URL (Opsional)"
                        name="linkedin"
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        icon={Link2}
                        error={errors.linkedin?.message}
                        register={register}
                        required={false}
                      />
                    </div>
                    <InputField
                      label="Portfolio / Website URL (Opsional)"
                      name="portfolio"
                      type="url"
                      placeholder="https://portfolio.com / GitHub / Drive"
                      icon={Globe}
                      error={errors.portfolio?.message}
                      register={register}
                      required={false}
                    />
                  </fieldset>
                </div>

                {/* ==================== KOLOM KANAN: Motivasi (250 kata) & Pilihan 1 Divisi ==================== */}
                <div className="space-y-6">
                  {/* Motivasi Bergabung */}
                  <fieldset className="space-y-3">
                    <legend className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100 w-full">
                      <Target className="h-4 w-4 text-indigo-600" />
                      Motivasi Bergabung
                    </legend>

                    <div className="relative">
                      <label htmlFor="motivation" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Ceritakan Motivasi & Kontribusimu <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Target
                          className="absolute left-3 top-3 h-4 w-4 text-slate-400"
                          aria-hidden="true"
                        />
                        <textarea
                          id="motivation"
                          {...register('motivation')}
                          rows={9}
                          placeholder={`Ceritakan secara mendalam kenapa kamu ingin bergabung PKM Center UNY, pengalaman riset/PKM/organisasi sebelumnya, dan kontribusi nyata yang ingin kamu berikan (minimal ${MIN_MOTIVATION_WORDS} kata)...`}
                          className={clsx(
                            'w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border bg-white resize-y leading-relaxed',
                            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                            'transition-colors',
                            errors.motivation
                              ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300'
                              : isMotivationValid
                              ? 'border-emerald-300 focus:ring-emerald-500'
                              : 'border-slate-200 hover:border-slate-300'
                          )}
                          aria-invalid={errors.motivation ? 'true' : 'false'}
                          aria-describedby="motivation-word-counter"
                        />
                      </div>

                      {/* Real-time Word Counter Indicator */}
                      <div
                        id="motivation-word-counter"
                        className="mt-2 flex items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          {errors.motivation && (
                            <span className="text-red-600 flex items-center gap-1" role="alert">
                              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                              {errors.motivation.message}
                            </span>
                          )}
                        </div>
                        <span
                          className={clsx(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold transition-colors',
                            isMotivationValid
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : motivationWordCount > 0
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          )}
                        >
                          {isMotivationValid && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                          {motivationWordCount} / {MIN_MOTIVATION_WORDS} kata minimal
                        </span>
                      </div>
                    </div>
                  </fieldset>

                  {/* Pilihan 1 Divisi (Single-Select Radio Cards) */}
                  <fieldset className="space-y-3">
                    <legend className="text-base font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100 w-full">
                      <Layers className="h-4 w-4 text-indigo-600" />
                      Pilihan Divisi (Pilih 1 Divisi) <span className="text-red-500">*</span>
                    </legend>
                    <p className="text-xs text-slate-500">
                      Pilih 1 divisi resmi PKM Center UNY yang paling sesuai dengan minat dan keahlianmu.
                    </p>

                    <div className="grid sm:grid-cols-2 gap-2.5" role="radiogroup" aria-label="Pilihan Divisi">
                      {DIVISIONS.map((div) => {
                        const isSelected = selectedDivision === div.value
                        return (
                          <label
                            key={div.value}
                            onClick={() => handleSelectDivision(div.value)}
                            className={clsx(
                              'relative flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 select-none',
                              isSelected
                                ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200 shadow-sm'
                                : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                            )}
                          >
                            <input
                              type="radio"
                              name="division_single_choice"
                              value={div.value}
                              checked={isSelected}
                              onChange={() => handleSelectDivision(div.value)}
                              className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                            />
                            <span
                              className={clsx(
                                'text-sm font-semibold transition-colors',
                                isSelected ? 'text-indigo-900' : 'text-slate-800'
                              )}
                            >
                              {div.label}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="h-4 w-4 text-indigo-600 ml-auto flex-shrink-0" />
                            )}
                          </label>
                        )
                      })}
                    </div>

                    {errors.division_preferences && (
                      <p className="text-xs text-red-600 flex items-center gap-1" role="alert">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        {errors.division_preferences.message}
                      </p>
                    )}

                    {/* Smooth Expandable Division Reason Textarea */}
                    <div
                      className={clsx(
                        'grid transition-all duration-300 ease-out',
                        selectedDivision ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'
                      )}
                    >
                      <div className="overflow-hidden">
                        {selectedDivision && selectedDivisionObj && (
                          <div
                            key={selectedDivision}
                            className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 animate-fade-in"
                          >
                            <label
                              htmlFor={`reason-${selectedDivision}`}
                              className="block text-sm font-semibold text-indigo-950 mb-1.5"
                            >
                              Alasan Memilih Divisi {selectedDivisionObj.label}{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              id={`reason-${selectedDivision}`}
                              value={currentDivisionReason}
                              onChange={(e) =>
                                handleDivisionReasonChange(selectedDivision, e.target.value)
                              }
                              rows={4}
                              className={clsx(
                                'w-full px-3.5 py-2.5 rounded-xl border bg-white resize-none text-sm',
                                'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                                'transition-colors',
                                errors.division_reasons
                                  ? 'border-red-300 bg-red-50 text-red-900'
                                  : 'border-indigo-200 hover:border-indigo-300'
                              )}
                              placeholder={`Jelaskan mengapa kamu cocok dan tertarik bergabung di divisi ${selectedDivisionObj.label} (min. ${MIN_DIVISION_REASON_CHARS} karakter)...`}
                            />
                            <div className="mt-1.5 flex items-center justify-between text-xs">
                              {!hasValidDivisionReason ? (
                                <span className="text-amber-700 flex items-center gap-1 font-medium">
                                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                                  Minimal {MIN_DIVISION_REASON_CHARS} karakter ({currentDivisionReason.trim().length}/{MIN_DIVISION_REASON_CHARS})
                                </span>
                              ) : (
                                <span className="text-emerald-700 flex items-center gap-1 font-medium">
                                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                                  Minimal {MIN_DIVISION_REASON_CHARS} karakter terpenuhi
                                </span>
                              )}
                              <span className="text-slate-500">
                                {currentDivisionReason.trim().length} / 1000 karakter
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </fieldset>
                </div>
              </div>

              {/* Submit Footer Bar */}
              <div className="pt-5 border-t border-slate-100">
                <div className={clsx('flex gap-3', editMode ? 'flex-col sm:flex-row' : '')}>
                  {editMode && onCancelEdit && (
                    <button
                      type="button"
                      onClick={onCancelEdit}
                      disabled={isSubmitting}
                      className="sm:w-1/4 py-3.5 rounded-xl font-semibold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                      Batal
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className={clsx(
                      editMode ? 'sm:flex-1' : 'w-full',
                      'py-3.5 rounded-xl font-semibold text-base transition-all',
                      'flex items-center justify-center gap-2',
                      isSubmitDisabled
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25'
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        {editMode ? 'Menyimpan...' : 'Mengirim...'}
                      </>
                    ) : (
                      <>
                        {editMode ? 'Simpan Perubahan Data' : 'Kirim Pendaftaran'}
                        <ChevronDown className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
                {!isMotivationValid && (
                  <p className="text-center text-xs text-amber-600 mt-2.5 font-medium">
                    Lengkapi Motivasi Bergabung hingga minimal {MIN_MOTIVATION_WORDS} kata ({motivationWordCount}/{MIN_MOTIVATION_WORDS}) untuk mengaktifkan tombol kirim.
                  </p>
                )}
                <p className="text-center text-xs text-slate-500 mt-2">
                  Dengan mengklik tombol di atas, kamu menyetujui{' '}
                  <a href="#" className="text-indigo-600 hover:underline">
                    Syarat & Ketentuan
                  </a>{' '}
                  serta{' '}
                  <a href="#" className="text-indigo-600 hover:underline">
                    Kebijakan Privasi
                  </a>
                </p>
              </div>
            </form>
          )}

          {/* Confirmation Modal */}
          {showConfirmModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
            >
              <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 animate-slide-up">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                    <AlertTriangle className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 id="confirm-title" className="text-xl font-bold text-slate-900">
                    {editMode ? 'Konfirmasi Perubahan Data' : 'Konfirmasi Pendaftaran'}
                  </h3>
                </div>

                <div className="space-y-4 text-sm text-slate-600 mb-6">
                  <p>
                    Pastikan data berikut sudah benar sebelum{' '}
                    {editMode ? 'menyimpan perubahan' : 'mengirim'}:
                  </p>
                  <ul className="space-y-2 pl-4 list-disc">
                    <li>
                      <span className="font-medium text-slate-900">Nama:</span> {watchedFullName}
                    </li>
                    <li>
                      <span className="font-medium text-slate-900">Email:</span> {watchedEmail}
                    </li>
                    <li>
                      <span className="font-medium text-slate-900">Divisi Terpilih:</span>{' '}
                      {selectedDivisionObj?.label || '-'}
                    </li>
                    <li>
                      <span className="font-medium text-slate-900">Motivasi:</span>{' '}
                      {motivationWordCount} kata
                    </li>
                    <li>
                      <span className="font-medium text-slate-900">CV:</span>{' '}
                      {cvFile
                        ? `${cvFile.name} (${formatFileSize(cvFile.size)})`
                        : editMode && initialData?.cv_url
                        ? 'Tetap menggunakan CV sebelumnya'
                        : 'Belum diupload'}
                    </li>
                    <li>
                      <span className="font-medium text-slate-900">Portofolio:</span>{' '}
                      {portfolioFile
                        ? `${portfolioFile.name} (${formatFileSize(portfolioFile.size)})`
                        : editMode && initialData?.portfolio_url
                        ? 'Tetap menggunakan Portofolio sebelumnya'
                        : 'Tidak ada'}
                    </li>
                  </ul>
                  <p className="text-amber-700 bg-amber-50 p-3 rounded-lg text-xs">
                    {editMode
                      ? 'Perubahan data akan langsung tersimpan. Data akan dikunci otomatis setelah berkas mulai ditinjau panitia atau masa edit ditutup.'
                      : 'Pastikan seluruh data sudah sesuai. Tim kami akan meninjau berkasmu dan menghubungi via email & WhatsApp.'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-3 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleConfirmSubmit}
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? editMode
                        ? 'Menyimpan...'
                        : 'Mengirim...'
                      : editMode
                      ? 'Ya, Simpan Perubahan'
                      : 'Ya, Kirim Pendaftaran'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
