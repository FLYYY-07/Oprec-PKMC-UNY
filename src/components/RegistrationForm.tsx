'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { clsx } from 'clsx'
import { registrationSchema, type RegistrationFormData, MAJORS, BATCHES, DIVISIONS } from '@/types/registration'

export default function RegistrationForm() {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([])
  const [divisionReasons, setDivisionReasons] = useState<Record<string, string>>({})
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
      major: '',
      batch: '',
      division_preferences: [],
      division_reasons: {},
      linkedin: '',
      portfolio: '',
      cv_file: undefined,
      portfolio_file: undefined,
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  })

  // Watch only fields needed for confirmation modal to avoid full re-render on every keystroke
  const watchedFullName = watch('full_name')
  const watchedEmail = watch('email')

  const handleDivisionToggle = (divisionId: string) => {
    setSelectedDivisions(prev => {
      const isSelected = prev.includes(divisionId)
      if (isSelected) {
        return prev.filter(id => id !== divisionId)
      }
      if (prev.length >= 2) {
        return prev
      }
      return [...prev, divisionId]
    })
  }

  const handleDivisionReasonChange = (divisionId: string, reason: string) => {
    setDivisionReasons(prev => ({ ...prev, [divisionId]: reason }))
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
    setSubmitStatus('submitting')
    setErrorMessage('')

    try {
      const formData = new FormData()
      
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'division_preferences' || key === 'division_reasons') {
          formData.append(key, JSON.stringify(value))
        } else if (key === 'cv_file' || key === 'portfolio_file') {
          if (value instanceof File) {
            formData.append(key, value)
          }
        } else if (value !== null && value !== undefined && value !== '') {
          formData.append(key, String(value))
        }
      })

      const response = await fetch('/api/register', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Terjadi kesalahan saat mendaftar')
      }

      setSubmitStatus('success')
      // Reset form after success
      Object.keys(data).forEach(key => {
        if (key === 'cv_file' || key === 'portfolio_file') {
          setValue(key as keyof RegistrationFormData, undefined)
        } else {
          setValue(key as keyof RegistrationFormData, '' as any)
        }
      })
      setValue('major', '')
      setValue('batch', '')
      setValue('division_preferences', [])
      setValue('division_reasons', {})
      setSelectedDivisions([])
      setDivisionReasons({})
      setCvFile(null)
      setPortfolioFile(null)
      setCvError('')
      setPortfolioError('')
    } catch (err) {
      setSubmitStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Gagal mengirim pendaftaran. Coba lagi nanti.')
    }
  }

  const handleFormSubmit = () => {
    // Set division data before showing confirmation
    setValue('division_preferences', selectedDivisions)
    setValue('division_reasons', divisionReasons)
    if (cvFile) setValue('cv_file', cvFile)
    if (portfolioFile) setValue('portfolio_file', portfolioFile)
    setShowConfirmModal(true)
  }

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false)
    onSubmit({ ...watchedValues, full_name: watchedFullName, email: watchedEmail } as RegistrationFormData)
  }

  const hasAllDivisionReasons = selectedDivisions.every(div => divisionReasons[div] && divisionReasons[div].trim().length >= 10)

  const SelectField = ({ label, name, options, placeholder, icon: Icon, error }: {
    label: string
    name: keyof RegistrationFormData
    options: readonly string[] | readonly { value: string; label: string }[]
    placeholder: string
    icon: React.ComponentType<{ className?: string }>
    error?: string
  }) => (
    <div className="relative">
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-2">
        {label} <span className="text-red-500" aria-hidden="true">*</span>
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden="true" />
        <select
          id={name}
          {...register(name)}
          className={clsx(
            'w-full pl-10 pr-10 py-3 rounded-xl border bg-white',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            'transition-colors',
            error ? 'border-red-300 bg-red-50 text-red-900' : 'border-slate-200 hover:border-slate-300'
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt, index) => (
            <option key={index} value={typeof opt === 'string' ? opt : opt.value}>
              {typeof opt === 'string' ? opt : opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" aria-hidden="true" />
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )

  const InputField = ({ label, name, type = 'text', placeholder, icon: Icon, error, ...props }: {
    label: string
    name: keyof RegistrationFormData
    type?: string
    placeholder: string
    icon: React.ComponentType<{ className?: string }>
    error?: string
  } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="relative">
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-2">
        {label} <span className="text-red-500" aria-hidden="true">*</span>
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden="true" />
        <input
          id={name}
          type={type}
          {...register(name)}
          placeholder={placeholder}
          className={clsx(
            'w-full pl-10 pr-4 py-3 rounded-xl border bg-white',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            'transition-colors',
            error ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300' : 'border-slate-200 hover:border-slate-300'
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )

  const TextareaField = ({ label, name, placeholder, icon: Icon, error, ...props }: {
    label: string
    name: keyof RegistrationFormData
    placeholder: string
    icon: React.ComponentType<{ className?: string }>
    error?: string
  } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <div className="relative">
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-2">
        {label} <span className="text-red-500" aria-hidden="true">*</span>
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-3 h-5 w-5 text-slate-400" aria-hidden="true" />
        <textarea
          id={name}
          {...register(name)}
          placeholder={placeholder}
          rows={5}
          className={clsx(
            'w-full pl-10 pr-4 py-3 rounded-xl border bg-white resize-none',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
            'transition-colors',
            error ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300' : 'border-slate-200 hover:border-slate-300'
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </p>
      )}
      <p className="mt-1 text-xs text-slate-500 text-right">
        Minimal 100 karakter • Maksimal 1000 karakter
      </p>
    </div>
  )

  return (
    <section id="register" className="py-20 sm:py-28 lg:py-32 bg-slate-50" aria-labelledby="register-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Info Panel */}
          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600">
                  <User className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="register-heading" className="text-2xl font-bold text-slate-900">Form Pendaftaran</h2>
                  <p className="text-sm text-slate-500">Open Recruitment PKM Center 2025</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {[
                  { icon: Clock, text: 'Waktu isi: ~5-7 menit' },
                  { icon: Shield, text: 'Data aman & terenkripsi' },
                  { icon: CheckCircle2, text: 'Konfirmasi via email & WA' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <item.icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    {item.text}
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-indigo-50 p-4 border border-indigo-100">
                <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Persyaratan Dasar
                </h4>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• Mahasiswa aktif (semester 1-6)</li>
                  <li>• Memiliki NIM & email kampus valid</li>
                  <li>• Bersedia aktif minimal 1 semester</li>
                  <li>• Komitmen hadir di kegiatan rutin</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form Panel */}
          <div>
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100">
              {submitStatus === 'success' ? (
                <div className="text-center py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Pendaftaran Berhasil!</h3>
                  <p className="text-slate-600 mb-6">
                    Terima kasih telah mendaftar. Tim kami akan meninjau formulirmu dan mengirimkan
                    informasi selanjutnya ke email & WhatsApp dalam 1-2 hari kerja.
                  </p>
                  <button
                    onClick={() => setSubmitStatus('idle')}
                    className="px-6 py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
                  >
                    Daftar Lagi
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
                  {/* Status Error */}
                  {submitStatus === 'error' && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3" role="alert">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Gagal Mengirim</p>
                        <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Personal Info */}
                  <fieldset>
                    <legend className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-indigo-600" />
                      Data Pribadi
                    </legend>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <InputField
                        label="Nama Lengkap"
                        name="full_name"
                        placeholder="Sesuai KTM"
                        icon={User}
                        error={errors.full_name?.message}
                      />
                      <InputField
                        label="Email Mahasiswa"
                        name="email"
                        type="email"
                        placeholder="nama@student.univ.ac.id"
                        icon={Mail}
                        error={errors.email?.message}
                      />
                      <InputField
                        label="WhatsApp (Aktif)"
                        name="phone"
                        type="tel"
                        placeholder="081234567890"
                        icon={Phone}
                        error={errors.phone?.message}
                      />
                      <InputField
                        label="NIM"
                        name="student_id"
                        placeholder="Contoh: 2106012345"
                        icon={Award}
                        error={errors.student_id?.message}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <SelectField
                        label="Jurusan / Program Studi"
                        name="major"
                        options={MAJORS}
                        placeholder="Pilih jurusan"
                        icon={BookOpen}
                        error={errors.major?.message}
                      />
                      <SelectField
                        label="Angkatan"
                        name="batch"
                        options={BATCHES}
                        placeholder="Pilih angkatan"
                        icon={Award}
                        error={errors.batch?.message}
                      />
                    </div>
                  </fieldset>

                  {/* Motivasi & Pilihan Divisi */}
                  <fieldset>
                    <legend className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5 text-indigo-600" />
                      Motivasi & Pilihan Divisi
                    </legend>
                    <TextareaField
                      label="Motivasi Bergabung"
                      name="motivation"
                      placeholder="Ceritakan kenapa kamu ingin bergabung PKM Center, pengalaman riset/PKM/org sebelumnya, dan apa yang ingin kamu capai di sini (min 100 karakter)..."
                      icon={Target}
                      error={errors.motivation?.message}
                    />
                    
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-slate-700 mb-3">
                        Pilihan Divisi (Maksimal 2) <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <p className="text-sm text-slate-500 mb-4">Pilih 1-2 divisi yang diminati. Isi alasan untuk setiap divisi yang dipilih.</p>
                      
                      <div className="grid sm:grid-cols-2 gap-4">
                        {DIVISIONS.map((div) => {
                                                  const isSelected = selectedDivisions.includes(div.value)
                                                  const isDisabled = !isSelected && selectedDivisions.length >= 2
                                                  return (
                                                    <div
                                                      key={div.value}
                                                      className={clsx(
                                                        'relative p-4 rounded-xl border transition-all',
                                                        isSelected
                                                          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                                                          : 'border-slate-200 hover:border-slate-300 bg-white',
                                                        isDisabled && 'opacity-50 cursor-not-allowed'
                                                      )}
                                                    >
                                                      <label className="flex items-start gap-3 cursor-pointer" style={{ pointerEvents: isDisabled ? 'none' : 'auto' }}>
                                                        <input
                                                          type="checkbox"
                                                          checked={isSelected}
                                                          onChange={() => !isDisabled && handleDivisionToggle(div.value)}
                                                          className={clsx(
                                                            'mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500',
                                                            'transition-colors'
                                                          )}
                                                          disabled={isDisabled}
                                                          aria-label={div.label}
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                          <h4 className="font-medium text-slate-900 truncate">{div.label}</h4>
                                                        </div>
                                                      </label>
                              
                                                      {isSelected && (
                                                        <div className="mt-4 pt-4 border-t border-indigo-100 animate-fade-in">
                                                          <label htmlFor={`reason-${div.value}`} className="block text-xs font-medium text-slate-700 mb-1.5">
                                                            Alasan memilih {div.label} <span className="text-red-500">*</span>
                                                          </label>
                                                          <textarea
                                                            id={`reason-${div.value}`}
                                                            value={divisionReasons[div.value] || ''}
                                                            onChange={(e) => handleDivisionReasonChange(div.value, e.target.value)}
                                                            rows={3}
                                                            className={clsx(
                                                              'w-full px-3 py-2 rounded-lg border bg-white resize-none text-sm',
                                                              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                                                              'transition-colors',
                                                              errors.division_reasons?.message
                                                                ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-300'
                                                                : 'border-slate-200 hover:border-slate-300'
                                                            )}
                                                            placeholder={`Mengapa kamu cocok di ${div.label}? (min 10 karakter)...`}
                                                            aria-describedby={`reason-${div.value}-error`}
                                                          />
                                                          {errors.division_reasons && (
                                                            <p id={`reason-${div.value}-error`} className="mt-1.5 text-xs text-red-600 flex items-center gap-1" role="alert">
                                                              <AlertCircle className="h-3 w-3 flex-shrink-0" />
                                                              {typeof errors.division_reasons.message === 'string' ? errors.division_reasons.message : 'Alasan tidak valid'}
                                                            </p>
                                                          )}
                                                          <p className="mt-1 text-xs text-slate-500 text-right">Min 10 • Maks 500 karakter</p>
                                                        </div>
                                                      )}
                                                    </div>
                                                  )
                                                })}
                      </div>
                      
                      {errors.division_preferences && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1" role="alert">
                          <AlertCircle className="h-4 w-4 flex-shrink-0" />
                          {errors.division_preferences.message}
                        </p>
                      )}
                      
                      {selectedDivisions.length === 0 && !errors.division_preferences?.message && (
                        <p className="mt-2 text-sm text-slate-500 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                          Pilih minimal 1 divisi (maksimal 2)
                        </p>
                      )}
                      
                      {selectedDivisions.length > 0 && !hasAllDivisionReasons && (
                        <p className="mt-2 text-sm text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                          Isi alasan untuk setiap divisi yang dipilih (min 10 karakter)
                        </p>
                      )}
                    </div>
                  </fieldset>

                  {/* File Upload: CV & Portfolio */}
                  <fieldset>
                    <legend className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-indigo-600" />
                      CV & Portofolio
                    </legend>
                    
                    <div className="space-y-6">
                      {/* CV Upload - Required */}
                      <div className="relative">
                        <label htmlFor="cv_file" className="block text-sm font-medium text-slate-700 mb-2">
                          CV (PDF) <span className="text-red-500" aria-hidden="true">*</span>
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden="true" />
                          <input
                            id="cv_file"
                            type="file"
                            accept="application/pdf"
                            onChange={handleCvChange}
                            className={clsx(
                              'w-full pl-10 pr-4 py-3 rounded-xl border bg-white',
                              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                              'transition-colors cursor-pointer',
                              cvError ? 'border-red-300 bg-red-50 text-red-900' : 'border-slate-200 hover:border-slate-300'
                            )}
                            aria-invalid={cvError ? 'true' : 'false'}
                            aria-describedby={cvError ? 'cv-error' : undefined}
                          />
                        </div>
                        {cvFile && (
                          <div className="mt-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-indigo-600" />
                              <div>
                                <p className="text-sm font-medium text-indigo-900">{cvFile.name}</p>
                                <p className="text-xs text-indigo-700">{formatFileSize(cvFile.size)} • PDF</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCvFile(null)
                                setCvError('')
                                setValue('cv_file', undefined)
                              }}
                              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                            >
                              Hapus
                            </button>
                          </div>
                        )}
                        {cvError && (
                          <p id="cv-error" className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {cvError}
                          </p>
                        )}
                        {errors.cv_file && !cvError && (
                          <p id="cv-error" className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {errors.cv_file.message}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-500">Wajib diisi • Format PDF • Maksimal 10MB</p>
                      </div>

                      {/* Portfolio Upload - Optional */}
                      <div className="relative">
                        <label htmlFor="portfolio_file" className="block text-sm font-medium text-slate-700 mb-2">
                          Portofolio (Opsional)
                        </label>
                        <div className="relative">
                          <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden="true" />
                          <input
                            id="portfolio_file"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.zip"
                            onChange={handlePortfolioChange}
                            className={clsx(
                              'w-full pl-10 pr-4 py-3 rounded-xl border bg-white',
                              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                              'transition-colors cursor-pointer',
                              portfolioError ? 'border-red-300 bg-red-50 text-red-900' : 'border-slate-200 hover:border-slate-300'
                            )}
                            aria-invalid={portfolioError ? 'true' : 'false'}
                            aria-describedby={portfolioError ? 'portfolio-error' : undefined}
                          />
                        </div>
                        {portfolioFile && (
                          <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-emerald-600" />
                              <div>
                                <p className="text-sm font-medium text-emerald-900">{portfolioFile.name}</p>
                                <p className="text-xs text-emerald-700">{formatFileSize(portfolioFile.size)}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setPortfolioFile(null)
                                setPortfolioError('')
                                setValue('portfolio_file', undefined)
                              }}
                              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                            >
                              Hapus
                            </button>
                          </div>
                        )}
                        {portfolioError && (
                          <p id="portfolio-error" className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {portfolioError}
                          </p>
                        )}
                        {errors.portfolio_file && !portfolioError && (
                          <p id="portfolio-error" className="mt-1.5 text-sm text-red-600 flex items-center gap-1" role="alert">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {errors.portfolio_file.message}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-500">Opsional • PDF, JPG, PNG, ZIP • Maksimal 10MB</p>
                      </div>
                    </div>
                  </fieldset>

                  {/* Social Links */}
                  <fieldset>
                    <legend className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-indigo-600" />
                      Media Sosial & Link Tambahan (Opsional)
                    </legend>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <InputField
                        label="Instagram Username"
                        name="instagram"
                        placeholder="tanpa @ (contoh: budi.santoso)"
                        icon={MessageSquare}
                        error={errors.instagram?.message}
                      />
                      <InputField
                        label="LinkedIn URL"
                        name="linkedin"
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        icon={Link2}
                        error={errors.linkedin?.message}
                      />
                      <InputField
                        label="Portfolio / Website URL"
                        name="portfolio"
                        type="url"
                        placeholder="https://portfolio.com / GitHub / Drive"
                        icon={Globe}
                        error={errors.portfolio?.message}
                      />
                    </div>
                    <p className="text-sm text-slate-500 mt-2">
                      Link opsional tapi sangat membantu kami mengetahui background & kreativitasmu.
                    </p>
                  </fieldset>

                  {/* Submit */}
                  <div className="pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isSubmitting || selectedDivisions.length === 0 || !!cvError || !!portfolioError || !!errors.cv_file || !!errors.portfolio_file || !hasAllDivisionReasons}
                      className={clsx(
                        'w-full py-4 rounded-xl font-semibold text-lg transition-all',
                        'flex items-center justify-center gap-2',
                        isSubmitting || selectedDivisions.length === 0 || !!cvError || !!portfolioError
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25'
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          Kirim Pendaftaran
                          <ChevronDown className="h-5 w-5" />
                        </>
                      )}
                    </button>
                    <p className="text-center text-xs text-slate-500 mt-3">
                      Dengan mengklik tombol di atas, kamu menyetujui
                      <a href="#" className="text-indigo-600 hover:underline">Syarat & Ketentuan</a>
                      serta
                      <a href="#" className="text-indigo-600 hover:underline">Kebijakan Privasi</a>
                    </p>
                  </div>
                </form>
              )}

              {/* Confirmation Modal */}
              {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
                  <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 animate-slide-up">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                        <AlertTriangle className="h-6 w-6 text-amber-600" />
                      </div>
                      <h3 id="confirm-title" className="text-xl font-bold text-slate-900">Konfirmasi Pendaftaran</h3>
                    </div>
                    
                    <div className="space-y-4 text-sm text-slate-600 mb-6">
                      <p>Pastikan data berikut sudah benar sebelum mengirim:</p>
                      <ul className="space-y-2 pl-4 list-disc">
                        <li><span className="font-medium text-slate-900">Nama:</span> {watchedFullName}</li>
                        <li><span className="font-medium text-slate-900">Email:</span> {watchedEmail}</li>
                        <li><span className="font-medium text-slate-900">Divisi:</span> {selectedDivisions.map(d => DIVISIONS.find(div => div.value === d)?.label).join(', ') || '-'}</li>
                        <li><span className="font-medium text-slate-900">CV:</span> {cvFile ? `${cvFile.name} (${formatFileSize(cvFile.size)})` : 'Belum diupload'}</li>
                        <li><span className="font-medium text-slate-900">Portofolio:</span> {portfolioFile ? `${portfolioFile.name} (${formatFileSize(portfolioFile.size)})` : 'Tidak ada'}</li>
                      </ul>
                      <p className="text-amber-700 bg-amber-50 p-3 rounded-lg text-xs">
                        Data tidak bisa diubah setelah dikirim. Tim kami akan menghubungi kamu via email & WhatsApp dalam 1-2 hari kerja.
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
                        {isSubmitting ? 'Mengirim...' : 'Ya, Kirim Pendaftaran'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

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