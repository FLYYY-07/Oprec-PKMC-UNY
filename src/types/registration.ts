import { z } from 'zod'

export const registrationSchema = z.object({
  full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  email: z.string().email('Format email tidak valid').endsWith('@student.univ.ac.id', 'Gunakan email mahasiswa (@student.univ.ac.id)'),
  phone: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{7,9}$/, 'Nomor WhatsApp tidak valid (contoh: 08123456789)'),
  student_id: z.string().min(8, 'NIM minimal 8 digit').max(15, 'NIM maksimal 15 digit'),
  major: z.string().min(1, 'Pilih jurusan'),
  batch: z.string().min(1, 'Pilih angkatan'),
  motivation: z.string().min(100, 'Motivasi minimal 100 karakter').max(1000, 'Motivasi maksimal 1000 karakter'),
  division_preferences: z.array(z.string()).min(1, 'Pilih minimal 1 divisi').max(2, 'Maksimal 2 divisi'),
  division_reasons: z.record(z.string().min(10, 'Alasan minimal 10 karakter').max(500, 'Alasan maksimal 500 karakter')).optional(),
  instagram: z.string().regex(/^[a-zA-Z0-9_.]{3,30}$/, 'Username Instagram tidak valid (tanpa @)'),
  linkedin: z.string().url('URL LinkedIn tidak valid').optional().or(z.literal('')),
  portfolio: z.string().url('URL Portfolio tidak valid').optional().or(z.literal('')),
  cv_file: z.instanceof(File).refine((file) => file.type === 'application/pdf', 'CV harus berformat PDF').refine((file) => file.size <= 10 * 1024 * 1024, 'Ukuran CV maksimal 10MB').nullable().optional(),
  portfolio_file: z.instanceof(File).nullable().optional(),
})

export type RegistrationFormData = z.infer<typeof registrationSchema>

export const MAJORS = [
  'Teknik Informatika',
  'Sistem Informasi',
  'Teknik Komputer',
  'Ilmu Komputer',
  'Teknik Elektro',
  'Teknik Industri',
  'Matematika',
  'Statistika',
  'Lainnya',
] as const

export const BATCHES = [
  '2021', '2022', '2023', '2024', '2025', '2026',
] as const

export const DIVISIONS = [
  { value: 'research-development', label: 'Research & Development' },
  { value: 'education-training', label: 'Education & Training' },
  { value: 'community-engagement', label: 'Community Engagement' },
  { value: 'creative-media', label: 'Creative & Media' },
  { value: 'partnership-sponsorship', label: 'Partnership & Sponsorship' },
  { value: 'operations-logistics', label: 'Operations & Logistics' },
] as const