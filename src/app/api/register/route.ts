import { NextRequest, NextResponse } from 'next/server'
import { createRegistration, type RegistrationData } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract fields from FormData
    const full_name = formData.get('full_name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const student_id = formData.get('student_id') as string
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
      'major', 'batch', 'motivation', 'division_preferences', 'instagram'
    ]

    const body = {
      full_name, email, phone, student_id,
      major, batch, motivation, division_preferences, division_reasons,
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

    // Validasi email domain
    if (!email.endsWith('@student.univ.ac.id')) {
      return NextResponse.json(
        { error: 'Gunakan email mahasiswa (@student.univ.ac.id)' },
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

    if (divisionPreferences.length === 0 || divisionPreferences.length > 2) {
      return NextResponse.json(
        { error: 'Pilih 1-2 divisi' },
        { status: 400 }
      )
    }

    // Validasi division reasons
    for (const div of divisionPreferences) {
      const reason = divisionReasons[div]
      if (!reason || reason.trim().length < 10) {
        return NextResponse.json(
          { error: `Alasan untuk divisi ${div} minimal 10 karakter` },
          { status: 400 }
        )
      }
    }

    // Siapkan data untuk Supabase
    const registrationData: RegistrationData = {
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      student_id: student_id.trim(),
      major,
      batch,
      motivation: motivation.trim(),
      division_preference: divisionPreferences[0], // Keep first preference for backward compatibility
      division_preferences: divisionPreferences, // Store all preferences
      division_reasons: divisionReasons,
      instagram: instagram.trim(),
      linkedin: linkedin?.trim() || undefined,
          portfolio: portfolio?.trim() || undefined,
    }

    // Simpan ke database
    const result = await createRegistration(registrationData)

    // TODO: Handle file uploads to Supabase Storage
    // For now, we'll just return success without file storage
    // Files can be uploaded to Supabase Storage using the result.id as folder

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