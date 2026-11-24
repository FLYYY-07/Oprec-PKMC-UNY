import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isAdminAuthenticated } from '@/lib/admin'

function parseBooleanSetting(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  if (typeof value === 'object' && value !== null && 'enabled' in value) {
    return Boolean((value as { enabled: unknown }).enabled)
  }
  return Boolean(value)
}

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json(
      { error: 'Unauthorized: Akses khusus panitia resmi PKM Center' },
      { status: 401 }
    )
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .select('key, value, updated_at')
      .eq('key', 'lock_registrations')
      .maybeSingle()

    if (error) throw error

    return NextResponse.json({
      lock_registrations: data ? parseBooleanSetting(data.value) : false,
      updated_at: data?.updated_at || null,
    })
  } catch (error) {
    console.error('Admin GET settings error:', error)
    return NextResponse.json(
      { error: 'Gagal memuat pengaturan sistem' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json(
      { error: 'Unauthorized: Akses khusus panitia resmi PKM Center' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { lock_registrations } = body

    if (typeof lock_registrations !== 'boolean') {
      return NextResponse.json(
        { error: 'Nilai lock_registrations harus berupa boolean (true/false)' },
        { status: 400 }
      )
    }

    const updatedAt = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .upsert(
        {
          key: 'lock_registrations',
          value: lock_registrations,
          updated_at: updatedAt,
        },
        { onConflict: 'key' }
      )
      .select('key, value, updated_at')
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      lock_registrations: parseBooleanSetting(data.value),
      updated_at: data.updated_at,
    })
  } catch (error) {
    console.error('Admin PATCH settings error:', error)
    return NextResponse.json(
      { error: 'Gagal menyimpan pengaturan sistem' },
      { status: 500 }
    )
  }
}
