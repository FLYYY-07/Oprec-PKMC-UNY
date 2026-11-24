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
    // Get total count
    const { count: totalCount, error: totalError } = await supabaseAdmin
      .from('registrations')
      .select('*', { count: 'exact', head: true })

    if (totalError) throw totalError

    // Get status counts
    const { data: statusData, error: statusError } = await supabaseAdmin
      .from('registrations')
      .select('status')

    if (statusError) throw statusError

    const statusCounts = {
      pending: 0,
      reviewed: 0,
      accepted: 0,
      rejected: 0,
    }

    statusData?.forEach((row) => {
      const status = row.status || 'pending'
      if (status in statusCounts) {
        statusCounts[status as keyof typeof statusCounts]++
      }
    })

    // Get division distribution
    const { data: divData, error: divError } = await supabaseAdmin
      .from('registrations')
      .select('division_preference')

    if (divError) throw divError

    const divisionCounts: Record<string, number> = {}
    divData?.forEach((row) => {
      const div = row.division_preference || 'unknown'
      divisionCounts[div] = (divisionCounts[div] || 0) + 1
    })

    return NextResponse.json({
      total: totalCount || 0,
      byStatus: statusCounts,
      byDivision: divisionCounts,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Gagal memuat statistik' },
      { status: 500 }
    )
  }
}
