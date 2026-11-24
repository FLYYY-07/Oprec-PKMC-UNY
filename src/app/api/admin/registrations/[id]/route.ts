import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isAdminAuthenticated } from '@/lib/admin'

export async function GET(
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

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Admin registration detail error:', error)
    return NextResponse.json(
      { error: 'Gagal memuat detail pendaftar' },
      { status: 500 }
    )
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
    const body = await request.json()
    const { status, notes, current_stage } = body

    // Validate status if provided
    const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status tidak valid. Pilihan: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate current_stage if provided
    const validStages = ['seleksi_berkas', 'wawancara', 'welcoming_onboarding']
    if (current_stage && !validStages.includes(current_stage)) {
      return NextResponse.json(
        { error: `Tahapan tidak valid. Pilihan: ${validStages.join(', ')}` },
        { status: 400 }
      )
    }

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes
    if (current_stage !== undefined) updateData.current_stage = current_stage

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Status pendaftar berhasil diperbarui',
      data,
    })
  } catch (error) {
    console.error('Admin update registration error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui status pendaftar' },
      { status: 500 }
    )
  }
}
