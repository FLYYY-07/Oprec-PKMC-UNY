import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, isAdminAuthenticated } from '@/lib/admin'

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json(
      { error: 'Unauthorized: Akses khusus panitia resmi PKM Center' },
      { status: 401 }
    )
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const division = searchParams.get('division') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('registrations')
      .select(
        `id, full_name, email, phone, student_id, faculty, major, batch, motivation, division_preference, division_preferences, division_reasons, instagram, linkedin, portfolio, cv_url, portfolio_url, created_at, status, notes, current_stage`,
        { count: 'exact' }
      )

    // Apply search filter
    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,student_id.ilike.%${search}%,email.ilike.%${search}%`
      )
    }

    // Apply division filter
    if (division) {
      query = query.eq('division_preference', division)
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query

    if (error) throw error

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Admin registrations error:', error)
    return NextResponse.json(
      { error: 'Gagal memuat data pendaftar' },
      { status: 500 }
    )
  }
}
