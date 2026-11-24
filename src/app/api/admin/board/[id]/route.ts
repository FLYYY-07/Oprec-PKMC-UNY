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

function extractBoardPhotoPath(publicUrl: string | null | undefined): string | null {
  if (!publicUrl) return null
  const marker = '/storage/v1/object/public/board-photos/'
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  try {
    return decodeURIComponent(publicUrl.slice(idx + marker.length).split('?')[0])
  } catch {
    return publicUrl.slice(idx + marker.length).split('?')[0]
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json(
      { error: 'Unauthorized: Akses khusus panitia resmi PKM Center' },
      { status: 401 }
    )
  }

  try {
    const { id } = await params

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('board_members')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Data pengurus tidak ditemukan' }, { status: 404 })
      }
      throw fetchError
    }

    const formData = await request.formData()

    const name = ((formData.get('name') as string) || '').trim()
    const position = ((formData.get('position') as string) || '').trim()
    const division = ((formData.get('division') as string) || '').trim()
    const period = ((formData.get('period') as string) || '').trim()
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
      : existing.display_order || 0

    let photoUrl: string | null = existing.photo_url || null

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
        console.error('Board photo upload error (PATCH):', uploadError)
        return NextResponse.json(
          { error: 'Gagal mengunggah foto baru ke storage' },
          { status: 500 }
        )
      }

      // Hapus foto lama jika ada
      const oldPath = extractBoardPhotoPath(existing.photo_url)
      if (oldPath) {
        await supabaseAdmin.storage.from('board-photos').remove([oldPath]).catch(() => {})
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from('board-photos')
        .getPublicUrl(filePath)
      photoUrl = publicUrlData.publicUrl
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('board_members')
      .update({
        name,
        position,
        division,
        period,
        quote: quoteRaw || null,
        display_order: displayOrder,
        photo_url: photoUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      message: 'Data pengurus berhasil diperbarui',
      data: updated,
    })
  } catch (error) {
    console.error('Admin PATCH board_members error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui data pengurus' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json(
      { error: 'Unauthorized: Akses khusus panitia resmi PKM Center' },
      { status: 401 }
    )
  }

  try {
    const { id } = await params

    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('board_members')
      .select('id, photo_url')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Data pengurus tidak ditemukan' }, { status: 404 })
      }
      throw fetchError
    }

    // Hapus foto dari bucket board-photos jika ada
    const photoPath = extractBoardPhotoPath(existing.photo_url)
    if (photoPath) {
      const { error: storageError } = await supabaseAdmin.storage
        .from('board-photos')
        .remove([photoPath])
      if (storageError) {
        console.warn('Warning: gagal menghapus foto pengurus dari storage:', storageError)
      }
    }

    const { error: deleteError } = await supabaseAdmin
      .from('board_members')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    return NextResponse.json({
      success: true,
      message: 'Data pengurus berhasil dihapus',
    })
  } catch (error) {
    console.error('Admin DELETE board_members error:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus data pengurus' },
      { status: 500 }
    )
  }
}
