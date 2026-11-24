import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedAdminUser } from '@/lib/admin'

export async function GET(request: NextRequest) {
  const adminUser = await getAuthenticatedAdminUser(request)
  if (!adminUser) {
    return NextResponse.json(
      { verified: false, error: 'Unauthorized: Akses khusus panitia resmi PKM Center' },
      { status: 401 }
    )
  }

  return NextResponse.json(
    { verified: true, email: adminUser.email },
    { status: 200 }
  )
}
