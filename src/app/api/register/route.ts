import { NextRequest, NextResponse } from 'next/server'
import { createRegistration, uploadFile } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/admin'
import { countWords, MIN_MOTIVATION_WORDS, MIN_DIVISION_REASON_CHARS } from '@/types/registration'

function parseBooleanSetting(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  return Boolean(value)
}

function extractStoragePath(publicUrl: string | null | undefined): string | null {
  if (!publicUrl) return null
  const marker = '/storage/v1/object/public/registrations/'
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  try {
    return decodeURIComponent(publicUrl.slice(idx + marker.length).split('?')[0])
  } catch {
    return publicUrl.slice(idx + marker.length).split('?')[0]
  }
}

async function getAuthenticatedUserEmail(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.slice(7).trim()
  if (!token) return null

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data.user?.email) return null
  return data.user.email.trim().toLowerCase()
}

async function isGlobalRegistrationLocked(): Promise<boolean> {
  try {
    const { data } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('key', 'lock_registrations')
      .maybeSingle()
    return data ? parseBooleanSetting(data.value) : false
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract fields from FormData
    const full_name = formData.get('full_name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const student_id = formData.get('student_id') as string
    const faculty = formData.get('faculty') as string
    const major = formData.get('major') as string
    const batch = formData.get('batch') as string
    const motivation = formData.get('motivation') as string
    const division_preferences = formData.get('division_preferences') as string
    const division_reasons = formData.get('division_reasons') as string
    const instagram = formData.get('instagram') as string
    const linkedin = formData.get('linkedin') as string
    const portfolio = formData.get('portfolio') as string
    const cv_file = formData.get('cv_file') as File | null
    const portfolio_file = formData.get('portfolio_file') as File | null

    // Validasi required fields
    const requiredFields = [
      'full_name', 'email', 'phone', 'student_id',
      'faculty', 'major', 'batch', 'motivation', 'division_preferences', 'instagram'
    ]

    const body = {
      full_name, email, phone, student_id,
      faculty, major, batch, motivation, division_preferences, division_reasons,
      instagram, linkedin, portfolio
    }

    for (const field of requiredFields) {
      if (!body[field as keyof typeof body] || (typeof body[field as keyof typeof body] === 'string' && body[field as keyof typeof body].trim() === '')) {
        return NextResponse.json(
          { error: `Field ${field} wajib diisi` },
          { status: 400 }
        )
      }
    }

    // Validasi email domain resmi UNY
    if (!email.endsWith('@student.uny.ac.id') && !email.endsWith('@uny.ac.id')) {
      return NextResponse.json(
        { error: 'Gunakan email resmi UNY (@student.uny.ac.id atau @uny.ac.id)' },
        { status: 400 }
      )
    }

    // Validasi CV file
    if (!cv_file || cv_file.size === 0) {
      return NextResponse.json(
        { error: 'CV wajib diupload' },
        { status: 400 }
      )
    }
    if (cv_file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'CV harus berformat PDF' },
        { status: 400 }
      )
    }
    if (cv_file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran CV maksimal 10MB' },
        { status: 400 }
      )
    }

    // Validasi portfolio file jika ada
    if (portfolio_file && portfolio_file.size > 0) {
      if (portfolio_file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Ukuran portofolio maksimal 10MB' },
          { status: 400 }
        )
      }
    }

    // Parse division data
    let divisionPreferences: string[] = []
    let divisionReasons: Record<string, string> = {}
    try {
      divisionPreferences = JSON.parse(division_preferences || '[]')
      divisionReasons = JSON.parse(division_reasons || '{}')
    } catch {
      return NextResponse.json(
        { error: 'Data divisi tidak valid' },
        { status: 400 }
      )
    }

    if (countWords(motivation) < MIN_MOTIVATION_WORDS) {
      return NextResponse.json(
        { error: `Motivasi bergabung minimal ${MIN_MOTIVATION_WORDS} kata` },
        { status: 400 }
      )
    }

    if (divisionPreferences.length !== 1) {
      return NextResponse.json(
        { error: 'Pilih tepat 1 divisi' },
        { status: 400 }
      )
    }

    // Validasi division reasons
    for (const div of divisionPreferences) {
      const reason = divisionReasons[div]
      if (!reason || reason.trim().length < MIN_DIVISION_REASON_CHARS) {
        return NextResponse.json(
          { error: `Alasan untuk divisi ${div} minimal ${MIN_DIVISION_REASON_CHARS} karakter` },
          { status: 400 }
        )
      }
    }

    // Upload CV to Supabase Storage
    const cvPath = `cv/${student_id}/${Date.now()}-${cv_file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const cvUpload = await uploadFile('registrations', cvPath, cv_file, 'application/pdf')
    if (cvUpload.error) {
      console.error('CV upload error:', cvUpload.error)
      return NextResponse.json(
        { error: 'Gagal mengupload CV. Coba lagi nanti.' },
        { status: 500 }
      )
    }

    // Upload Portfolio to Supabase Storage if provided
    let portfolioUrl: string | undefined
    if (portfolio_file && portfolio_file.size > 0) {
      const portfolioPath = `portfolio/${student_id}/${Date.now()}-${portfolio_file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const portfolioUpload = await uploadFile('registrations', portfolioPath, portfolio_file, portfolio_file.type)
      if (portfolioUpload.error) {
        console.error('Portfolio upload error:', portfolioUpload.error)
        return NextResponse.json(
          { error: 'Gagal mengupload portofolio. Coba lagi nanti.' },
          { status: 500 }
        )
      }
      portfolioUrl = portfolioUpload.url || undefined
    }

    // Siapkan data untuk Supabase
    const registrationData = {
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      student_id: student_id.trim(),
      faculty: faculty.trim(),
      major,
      batch,
      motivation: motivation.trim(),
      division_preference: divisionPreferences[0], // Keep first preference for backward compatibility
      division_preferences: divisionPreferences, // Store all preferences
      division_reasons: divisionReasons,
      instagram: instagram.trim(),
      linkedin: linkedin?.trim() || undefined,
      portfolio: portfolio?.trim() || undefined,
      cv_url: cvUpload.url || undefined,
      portfolio_url: portfolioUrl,
    }

    // Simpan ke database
    const result = await createRegistration(registrationData)

    return NextResponse.json(
      {
        success: true,
        message: 'Pendaftaran berhasil dikirim',
        data: result
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)

    // Handle Supabase unique constraint error (duplicate email/NIM)
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Email atau NIM sudah terdaftar' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Coba lagi nanti.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userEmail = await getAuthenticatedUserEmail(request)
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Sesi login tidak valid. Silakan login kembali.' },
        { status: 401 }
      )
    }

    // Lapis 1: Cek kunci global (Data Fix)
    const globalLocked = await isGlobalRegistrationLocked()
    if (globalLocked) {
      return NextResponse.json(
        { error: 'Masa perubahan data telah ditutup oleh panitia (Data Fix).' },
        { status: 403 }
      )
    }

    // Ambil data pendaftaran user saat ini
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('email', userEmail)
      .maybeSingle()

    if (fetchError) throw fetchError
    if (!existing) {
      return NextResponse.json(
        { error: 'Data pendaftaran tidak ditemukan.' },
        { status: 404 }
      )
    }

    // Lapis 2: Cek status pendaftaran (hanya pending yang boleh diedit)
    if ((existing.status || 'pending').toLowerCase() !== 'pending') {
      return NextResponse.json(
        { error: 'Data sudah dikunci karena sedang/telah ditinjau panitia.' },
        { status: 403 }
      )
    }

    const formData = await request.formData()

    const full_name = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const student_id = formData.get('student_id') as string
    const faculty = formData.get('faculty') as string
    const major = formData.get('major') as string
    const batch = formData.get('batch') as string
    const motivation = formData.get('motivation') as string
    const division_preferences = formData.get('division_preferences') as string
    const division_reasons = formData.get('division_reasons') as string
    const instagram = formData.get('instagram') as string
    const linkedin = formData.get('linkedin') as string
    const portfolio = formData.get('portfolio') as string
    const cv_file = formData.get('cv_file') as File | null
    const portfolio_file = formData.get('portfolio_file') as File | null

    const requiredFields = [
      'full_name', 'phone', 'student_id',
      'faculty', 'major', 'batch', 'motivation', 'division_preferences', 'instagram'
    ]
    const body = {
      full_name, phone, student_id, faculty, major, batch, motivation,
      division_preferences, division_reasons, instagram, linkedin, portfolio,
    }
    for (const field of requiredFields) {
      const val = body[field as keyof typeof body]
      if (!val || (typeof val === 'string' && val.trim() === '')) {
        return NextResponse.json(
          { error: `Field ${field} wajib diisi` },
          { status: 400 }
        )
      }
    }

    let divisionPreferences: string[] = []
    let divisionReasons: Record<string, string> = {}
    try {
      divisionPreferences = JSON.parse(division_preferences || '[]')
      divisionReasons = JSON.parse(division_reasons || '{}')
    } catch {
      return NextResponse.json({ error: 'Data divisi tidak valid' }, { status: 400 })
    }

    if (countWords(motivation) < MIN_MOTIVATION_WORDS) {
      return NextResponse.json(
        { error: `Motivasi bergabung minimal ${MIN_MOTIVATION_WORDS} kata` },
        { status: 400 }
      )
    }

    if (divisionPreferences.length !== 1) {
      return NextResponse.json({ error: 'Pilih tepat 1 divisi' }, { status: 400 })
    }

    for (const div of divisionPreferences) {
      const reason = divisionReasons[div]
      if (!reason || reason.trim().length < MIN_DIVISION_REASON_CHARS) {
        return NextResponse.json(
          { error: `Alasan untuk divisi ${div} minimal ${MIN_DIVISION_REASON_CHARS} karakter` },
          { status: 400 }
        )
      }
    }

    // Pertahankan file lama jika user tidak mengupload file baru
    let cvUrl: string | undefined = existing.cv_url || undefined
    let portfolioUrl: string | undefined = existing.portfolio_url || undefined

    if (cv_file && cv_file.size > 0) {
      if (cv_file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'CV harus berformat PDF' }, { status: 400 })
      }
      if (cv_file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'Ukuran CV maksimal 10MB' }, { status: 400 })
      }
      const cvPath = `cv/${student_id.trim()}/${Date.now()}-${cv_file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const cvUpload = await uploadFile('registrations', cvPath, cv_file, 'application/pdf')
      if (cvUpload.error) {
        console.error('CV upload error (edit):', cvUpload.error)
        return NextResponse.json({ error: 'Gagal mengupload CV baru.' }, { status: 500 })
      }
      const oldCvPath = extractStoragePath(existing.cv_url)
      if (oldCvPath) {
        await supabaseAdmin.storage.from('registrations').remove([oldCvPath]).catch(() => {})
      }
      cvUrl = cvUpload.url || cvUrl
    }

    if (portfolio_file && portfolio_file.size > 0) {
      if (portfolio_file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'Ukuran portofolio maksimal 10MB' }, { status: 400 })
      }
      const portfolioPath = `portfolio/${student_id.trim()}/${Date.now()}-${portfolio_file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const portfolioUpload = await uploadFile('registrations', portfolioPath, portfolio_file, portfolio_file.type)
      if (portfolioUpload.error) {
        console.error('Portfolio upload error (edit):', portfolioUpload.error)
        return NextResponse.json({ error: 'Gagal mengupload portofolio baru.' }, { status: 500 })
      }
      const oldPortfolioPath = extractStoragePath(existing.portfolio_url)
      if (oldPortfolioPath) {
        await supabaseAdmin.storage.from('registrations').remove([oldPortfolioPath]).catch(() => {})
      }
      portfolioUrl = portfolioUpload.url || portfolioUrl
    }

    const updatePayload = {
      full_name: full_name.trim(),
      phone: phone.trim(),
      student_id: student_id.trim(),
      faculty: faculty.trim(),
      major,
      batch,
      motivation: motivation.trim(),
      division_preference: divisionPreferences[0],
      division_preferences: divisionPreferences,
      division_reasons: divisionReasons,
      instagram: instagram.trim(),
      linkedin: linkedin?.trim() || null,
      portfolio: portfolio?.trim() || null,
      cv_url: cvUrl || null,
      portfolio_url: portfolioUrl || null,
      updated_at: new Date().toISOString(),
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('registrations')
      .update(updatePayload)
      .eq('id', existing.id)
      .select()
      .single()

    if (updateError) {
      if (updateError.message?.includes('duplicate key')) {
        return NextResponse.json({ error: 'NIM sudah digunakan pendaftar lain' }, { status: 409 })
      }
      throw updateError
    }

    return NextResponse.json({
      success: true,
      message: 'Data pendaftaran berhasil diperbarui',
      data: updated,
    })
  } catch (error) {
    console.error('Update registration error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui data pendaftaran. Coba lagi nanti.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userEmail = await getAuthenticatedUserEmail(request)
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Sesi login tidak valid. Silakan login kembali.' },
        { status: 401 }
      )
    }

    // Lapis 1: Cek kunci global (Data Fix)
    const globalLocked = await isGlobalRegistrationLocked()
    if (globalLocked) {
      return NextResponse.json(
        { error: 'Masa perubahan data telah ditutup oleh panitia (Data Fix).' },
        { status: 403 }
      )
    }

    // Ambil data pendaftaran user
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('registrations')
      .select('id, status, cv_url, portfolio_url')
      .eq('email', userEmail)
      .maybeSingle()

    if (fetchError) throw fetchError
    if (!existing) {
      return NextResponse.json(
        { error: 'Data pendaftaran tidak ditemukan.' },
        { status: 404 }
      )
    }

    // Lapis 2: Cek status pendaftaran
    if ((existing.status || 'pending').toLowerCase() !== 'pending') {
      return NextResponse.json(
        { error: 'Pendaftaran tidak dapat dibatalkan karena sedang/telah ditinjau panitia.' },
        { status: 403 }
      )
    }

    // Hapus file CV & Portofolio terkait di Storage jika ada
    const filesToRemove = [
      extractStoragePath(existing.cv_url),
      extractStoragePath(existing.portfolio_url),
    ].filter((p): p is string => Boolean(p))

    if (filesToRemove.length > 0) {
      const { error: storageError } = await supabaseAdmin.storage
        .from('registrations')
        .remove(filesToRemove)
      if (storageError) {
        console.warn('Warning: gagal menghapus file storage saat batal daftar:', storageError)
      }
    }

    // Hapus record dari tabel registrations
    const { error: deleteError } = await supabaseAdmin
      .from('registrations')
      .delete()
      .eq('id', existing.id)

    if (deleteError) throw deleteError

    return NextResponse.json({
      success: true,
      message: 'Pendaftaran berhasil dibatalkan.',
    })
  } catch (error) {
    console.error('Cancel registration error:', error)
    return NextResponse.json(
      { error: 'Gagal membatalkan pendaftaran. Coba lagi nanti.' },
      { status: 500 }
    )
  }
}