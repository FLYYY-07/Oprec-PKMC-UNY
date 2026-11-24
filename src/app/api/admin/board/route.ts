import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isAdminAuthenticated } from '@/lib/admin'

const VALID_BOARD_DIVISIONS = [
  'Pengurus Inti',
  'Tim System',
  'Data',
  'Design',
  'Public Relation',
]

const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_QUOTE_LENGTH = 150

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json(
      { error: 'Unauthorized: Akses khusus panitia resmi PKM Center' },
      { status: 401 }
    )
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('board_members')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error('Admin GET board_members error:', error)
    return NextResponse.json(
      { error: 'Gagal memuat daftar pengurus' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json(
      { error: 'Unauthorized: Akses khusus panitia resmi PKM Center' },
      { status: 401 }
    )
  }

  try {
    const formData = await request.formData()

    const name = ((formData.get('name') as string) || '').trim()
    const position = ((formData.get('position') as string) || '').trim()
    const division = ((formData.get('division') as string) || '').trim()
    const period = ((formData.get('period') as string) || '2025/2026').trim()
    const quoteRaw = ((formData.get('quote') as string) || '').trim()
    const displayOrderRaw = formData.get('display_order') as string | null
    const photo = formData.get('photo') as File | null

    if (!name || !position || !division || !period) {
      return NextResponse.json(
        { error: 'Nama, jabatan, divisi, dan periode wajib diisi' },
        { status: 400 }
      )
    }

    if (!VALID_BOARD_DIVISIONS.includes(division)) {
      return NextResponse.json(
        { error: `Divisi tidak valid. Pilihan: ${VALID_BOARD_DIVISIONS.join(', ')}` },
        { status: 400 }
      )
    }

    if (quoteRaw.length > MAX_QUOTE_LENGTH) {
      return NextResponse.json(
        { error: `Quotes maksimal ${MAX_QUOTE_LENGTH} karakter` },
        { status: 400 }
      )
    }

    const displayOrder = displayOrderRaw !== null && displayOrderRaw !== ''
      ? Math.max(0, parseInt(displayOrderRaw, 10) || 0)
      : 0

    let photoUrl: string | null = null

    if (photo && photo.size > 0) {
      if (!photo.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'File foto harus berupa gambar (JPG, PNG, WEBP)' },
          { status: 400 }
        )
      }
      if (photo.size > MAX_PHOTO_SIZE) {
        return NextResponse.json(
          { error: 'Ukuran foto maksimal 5MB' },
          { status: 400 }
        )
      }

      const safeFileName = photo.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const filePath = `members/${Date.now()}-${safeFileName}`
      const arrayBuffer = await photo.arrayBuffer()

      const { error: uploadError } = await supabaseAdmin.storage
        .from('board-photos')
        .upload(filePath, arrayBuffer, {
          contentType: photo.type,
          upsert: false,
        })

      if (uploadError) {
        console.error('Board photo upload error:', uploadError)
        return NextResponse.json(
          { error: 'Gagal mengunggah foto pengurus ke storage' },
          { status: 500 }
        )
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('board-photos')
        .getPublicUrl(filePath)
      photoUrl = publicUrlData.publicUrl
    }

    const { data, error } = await supabaseAdmin
      .from('board_members')
      .insert([
        {
          name,
          position,
          division,
          period,
          quote: quoteRaw || null,
          display_order: displayOrder,
          photo_url: photoUrl,
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(
      { success: true, message: 'Pengurus berhasil ditambahkan', data },
      { status: 201 }
    )
  } catch (error) {
    console.error('Admin POST board_members error:', error)
    return NextResponse.json(
      { error: 'Gagal menambahkan data pengurus' },
      { status: 500 }
    )
  }
}
