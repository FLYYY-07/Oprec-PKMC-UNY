import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Type untuk data pendaftaran
export interface RegistrationData {
  full_name: string
  email: string
  phone: string
  student_id: string
  major: string
  batch: string
  motivation: string
  division_preference: string
  division_preferences: string[]
  division_reasons: Record<string, string>
  instagram: string
  linkedin?: string
  portfolio?: string
  created_at?: string
}

// Fungsi helper untuk insert pendaftaran
export async function createRegistration(data: RegistrationData) {
  const { data: result, error } = await supabase
    .from('registrations')
    .insert([{ ...data, created_at: new Date().toISOString() }])
    .select()
    .single()

  if (error) throw error
  return result
}