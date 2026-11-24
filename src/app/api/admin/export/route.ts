import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { supabaseAdmin, isAdminAuthenticated } from '@/lib/admin'

function escapeCsv(value: string | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function formatDivisionReasons(reasons: any): string {
  if (!reasons) return '-'
  if (typeof reasons === 'string') {
    try {
      reasons = JSON.parse(reasons)
    } catch {
      return reasons
    }
  }
  if (typeof reasons === 'object' && reasons !== null) {
    const entries = Object.entries(reasons)
    if (entries.length === 0) return '-'
    return entries
      .map(([div, reason]) => `[${div}]: ${reason}`)
      .join('\n')
  }
  return String(reasons)
}

function generateCsv(data: any[]): string {
  const headers = [
    'ID',
    'Nama Lengkap',
    'Email',
    'WhatsApp',
    'NIM',
    'Fakultas',
    'Program Studi',
    'Angkatan',
    'Motivasi',
    'Divisi Utama',
    'Semua Pilihan Divisi',
    'Alasan Pemilihan Divisi',
    'Instagram',
    'LinkedIn',
    'Portofolio URL',
    'Link Berkas CV',
    'Link Berkas Portofolio',
    'Status',
    'Catatan Panitia',
    'Tanggal Pendaftaran',
  ]

  const rows = data.map((row) => [
    row.id,
    row.full_name,
    row.email,
    row.phone,
    row.student_id,
    row.faculty || '-',
    row.major,
    row.batch,
    row.motivation?.replace(/\r?\n/g, ' ') || '',
    row.division_preference,
    Array.isArray(row.division_preferences)
      ? row.division_preferences.join('; ')
      : row.division_preference || '',
    formatDivisionReasons(row.division_reasons).replace(/\r?\n/g, ' | '),
    row.instagram,
    row.linkedin || '-',
    row.portfolio || '-',
    row.cv_url || '-',
    row.portfolio_url || '-',
    row.status || 'pending',
    row.notes || '-',
    row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : '',
  ])

  return [headers.join(','), ...rows.map((r) => r.map(escapeCsv).join(','))].join('\n')
}

function generateXlsx(data: any[]) {
  const rows = data.map((row) => ({
    'ID': String(row.id || ''),
    'Nama Lengkap': String(row.full_name || ''),
    'Email': String(row.email || ''),
    'WhatsApp': String(row.phone || ''),
    'NIM': String(row.student_id || ''),
    'Fakultas': String(row.faculty || '-'),
    'Program Studi': String(row.major || ''),
    'Angkatan': String(row.batch || ''),
    'Motivasi': String(row.motivation || ''),
    'Divisi Utama': String(row.division_preference || ''),
    'Semua Divisi': Array.isArray(row.division_preferences)
      ? row.division_preferences.join(', ')
      : String(row.division_preference || ''),
    'Alasan Divisi': formatDivisionReasons(row.division_reasons),
    'Instagram': String(row.instagram || ''),
    'LinkedIn': String(row.linkedin || '-'),
    'Portfolio URL': String(row.portfolio || '-'),
    'CV URL': String(row.cv_url || '-'),
    'Portfolio File URL': String(row.portfolio_url || '-'),
    'Status': String(row.status || 'pending'),
    'Catatan Panitia': String(row.notes || '-'),
    'Tanggal Daftar': row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : '',
  }))

  const ws = XLSX.utils.json_to_sheet(rows)

  // Pastikan kolom WhatsApp dan NIM disimpan sebagai string murni (t: 's')
  // agar angka 0 di depan nomor WhatsApp tidak hilang di Excel
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
  let whatsappCol = -1
  let nimCol = -1

  for (let C = range.s.c; C <= range.e.c; ++C) {
    const headerCell = ws[XLSX.utils.encode_cell({ r: 0, c: C })]
    if (headerCell?.v === 'WhatsApp') whatsappCol = C
    if (headerCell?.v === 'NIM') nimCol = C
  }

  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    if (whatsappCol !== -1) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: whatsappCol })
      if (ws[cellRef]) {
        ws[cellRef].t = 's'
        ws[cellRef].v = String(ws[cellRef].v ?? '')
        delete ws[cellRef].w
      }
    }
    if (nimCol !== -1) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: nimCol })
      if (ws[cellRef]) {
        ws[cellRef].t = 's'
        ws[cellRef].v = String(ws[cellRef].v ?? '')
        delete ws[cellRef].w
      }
    }
  }

  // Atur lebar kolom (wch) agar rapi saat dibuka di Microsoft Excel
  ws['!cols'] = [
    { wch: 38 }, // ID
    { wch: 28 }, // Nama Lengkap
    { wch: 32 }, // Email
    { wch: 18 }, // WhatsApp
    { wch: 16 }, // NIM
    { wch: 42 }, // Fakultas
    { wch: 36 }, // Program Studi
    { wch: 10 }, // Angkatan
    { wch: 45 }, // Motivasi
    { wch: 25 }, // Divisi Utama
    { wch: 35 }, // Semua Divisi
    { wch: 50 }, // Alasan Divisi
    { wch: 18 }, // Instagram
    { wch: 30 }, // LinkedIn
    { wch: 30 }, // Portfolio URL
    { wch: 35 }, // CV URL
    { wch: 35 }, // Portfolio File URL
    { wch: 14 }, // Status
    { wch: 30 }, // Catatan Panitia
    { wch: 22 }, // Tanggal Daftar
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap Pendaftar')

  const arrayBuffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  return arrayBuffer
}

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated(request))) {
    return NextResponse.json(
      { error: 'Unauthorized: Akses khusus panitia resmi PKM Center' },
      { status: 401 }
    )
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'csv'
    const search = searchParams.get('search') || ''
    const division = searchParams.get('division') || ''
    const status = searchParams.get('status') || ''

    let query = supabaseAdmin.from('registrations').select('*')

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,student_id.ilike.%${search}%,email.ilike.%${search}%`
      )
    }
    if (division) {
      query = query.eq('division_preference', division)
    }
    if (status) {
      query = query.eq('status', status)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) throw error

    const registrations = data || []
    const today = new Date().toISOString().split('T')[0]

    if (format === 'xlsx') {
      const arrayBuffer = generateXlsx(registrations)
      return new Response(arrayBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="rekap-pendaftar.xlsx"',
          'Cache-Control': 'no-store, max-age=0',
        },
      })
    }

    // Default CSV
    const csv = generateCsv(registrations)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="rekap-pendaftar-${today}.csv"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('Admin export error:', error)
    return NextResponse.json(
      { error: 'Gagal mengekspor data' },
      { status: 500 }
    )
  }
}
