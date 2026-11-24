import { z } from 'zod'

export function countWords(text: string): number {
  if (!text) return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

export const MIN_MOTIVATION_WORDS = 250
export const MIN_DIVISION_REASON_CHARS = 50

export const UNY_FACULTIES_AND_MAJORS: Record<string, readonly string[]> = {
  'Fakultas Ilmu Pendidikan dan Psikologi (FIPP)': [
    'S1 Administrasi Pendidikan',
    'S1 Bimbingan dan Konseling',
    'S1 Kebijakan Pendidikan',
    'S1 Pendidikan Guru Pendidikan Anak Usia Dini (PGPAUD)',
    'S1 Pendidikan Guru Sekolah Dasar (PGSD)',
    'S1 Pendidikan Luar Biasa',
    'S1 Pendidikan Luar Sekolah',
    'S1 Psikologi',
    'S1 Teknologi Pendidikan',
  ],
  'Fakultas Bahasa, Seni, dan Budaya (FBSB)': [
    'S1 Pendidikan Bahasa dan Sastra Indonesia',
    'S1 Pendidikan Bahasa Daerah (Jawa)',
    'S1 Pendidikan Bahasa Inggris',
    'S1 Pendidikan Bahasa Jerman',
    'S1 Pendidikan Bahasa Prancis',
    'S1 Pendidikan Kriya',
    'S1 Pendidikan Seni Musik',
    'S1 Pendidikan Seni Rupa',
    'S1 Pendidikan Seni Tari',
    'S1 Sastra Indonesia',
    'S1 Sastra Inggris',
  ],
  'Fakultas Matematika dan Ilmu Pengetahuan Alam (FMIPA)': [
    'S1 Biologi',
    'S1 Fisika',
    'S1 Kimia',
    'S1 Matematika',
    'S1 Pendidikan Biologi',
    'S1 Pendidikan Fisika',
    'S1 Pendidikan Ilmu Pengetahuan Alam (IPA)',
    'S1 Pendidikan Kimia',
    'S1 Pendidikan Matematika',
    'S1 Statistika',
  ],
  'Fakultas Ilmu Sosial, Hukum, dan Ilmu Politik (FISHIPOL)': [
    'S1 Administrasi Publik',
    'S1 Ilmu Hukum',
    'S1 Ilmu Komunikasi',
    'S1 Ilmu Politik',
    'S1 Ilmu Sejarah',
    'S1 Pariwisata',
    'S1 Pendidikan Geografi',
    'S1 Pendidikan Ilmu Pengetahuan Sosial (IPS)',
    'S1 Pendidikan Pancasila dan Kewarganegaraan (PPKn)',
    'S1 Pendidikan Sejarah',
    'S1 Pendidikan Sosiologi',
  ],
  'Fakultas Teknik (FT)': [
    'S1 Arsitektur',
    'S1 Pendidikan Tata Boga',
    'S1 Pendidikan Tata Busana',
    'S1 Pendidikan Teknik Elektro',
    'S1 Pendidikan Teknik Elektronika',
    'S1 Pendidikan Teknik Informatika',
    'S1 Pendidikan Teknik Mekatronika',
    'S1 Pendidikan Teknik Mesin',
    'S1 Pendidikan Teknik Otomotif',
    'S1 Pendidikan Teknik Sipil dan Perencanaan',
    'S1 Teknik Elektro',
    'S1 Teknik Industri',
    'S1 Teknik Manufaktur',
    'S1 Teknik Sipil',
    'S1 Teknologi Informasi',
  ],
  'Fakultas Ilmu Keolahragaan dan Kesehatan (FIKK)': [
    'S1 Ilmu Keolahragaan',
    'S1 Pendidikan Jasmani Kesehatan dan Rekreasi (PJKR)',
    'S1 Pendidikan Kepelatihan Olahraga',
    'S1 PGSD Pendidikan Jasmani',
  ],
  'Fakultas Ekonomi dan Bisnis (FEB)': [
    'S1 Akuntansi',
    'S1 Manajemen',
    'S1 Pendidikan Administrasi Perkantoran',
    'S1 Pendidikan Akuntansi',
    'S1 Pendidikan Ekonomi',
  ],
  'Fakultas Kedokteran (FK)': [
    'S1 Kedokteran',
  ],
  'Fakultas Vokasi (FV)': [
    'D4 Administrasi Perkantoran',
    'D4 Akuntansi',
    'D4 Manajemen Pemasaran',
    'D4 Pengelolaan Usaha Rekreasi',
    'D4 Pengobatan Tradisional Indonesia',
    'D4 Promosi Kesehatan',
    'D4 Tata Boga',
    'D4 Tata Busana',
    'D4 Tata Rias dan Kecantikan',
    'D4 Teknik Elektro',
    'D4 Teknik Elektronika',
    'D4 Teknik Mesin',
    'D4 Teknik Otomotif',
    'D4 Teknik Sipil',
  ],
}

export const FACULTIES = Object.keys(UNY_FACULTIES_AND_MAJORS)

export function findFacultyByMajor(major: string | undefined | null): string {
  if (!major) return ''
  for (const [faculty, majors] of Object.entries(UNY_FACULTIES_AND_MAJORS)) {
    if (majors.includes(major)) return faculty
  }
  return ''
}

export const registrationSchema = z.object({
  full_name: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  email: z.string().email('Format email tidak valid').refine(
    (val) => val.endsWith('@student.uny.ac.id') || val.endsWith('@uny.ac.id'),
    'Gunakan email resmi UNY (@student.uny.ac.id atau @uny.ac.id)'
  ),
  phone: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{7,9}$/, 'Nomor WhatsApp tidak valid (contoh: 08123456789)'),
  student_id: z.string().min(8, 'NIM minimal 8 digit').max(15, 'NIM maksimal 15 digit'),
  faculty: z.string().min(1, 'Pilih fakultas'),
  major: z.string().min(1, 'Pilih program studi'),
  batch: z.string().min(1, 'Pilih angkatan'),
  motivation: z
    .string()
    .refine(
      (val) => countWords(val) >= MIN_MOTIVATION_WORDS,
      `Motivasi bergabung minimal ${MIN_MOTIVATION_WORDS} kata`
    ),
  division_preferences: z
    .array(z.string())
    .min(1, 'Pilih 1 divisi yang diminati')
    .max(1, 'Hanya dapat memilih maksimal 1 divisi'),
  division_reasons: z
    .record(
      z.string(),
      z
        .string()
        .refine(
          (val) => val.trim().length >= MIN_DIVISION_REASON_CHARS,
          `Alasan minimal ${MIN_DIVISION_REASON_CHARS} karakter`
        )
        .refine((val) => val.trim().length <= 1000, 'Alasan maksimal 1000 karakter')
    )
    .optional(),
  instagram: z.string().regex(/^[a-zA-Z0-9_.]{3,30}$/, 'Username Instagram tidak valid (tanpa @)'),
  linkedin: z.string().url('URL LinkedIn tidak valid').optional().or(z.literal('')),
  portfolio: z.string().url('URL Portfolio tidak valid').optional().or(z.literal('')),
  cv_file: z
    .instanceof(File)
    .refine((file) => file.type === 'application/pdf', 'CV harus berformat PDF')
    .refine((file) => file.size <= 10 * 1024 * 1024, 'Ukuran CV maksimal 10MB')
    .nullable()
    .optional(),
  portfolio_file: z.instanceof(File).nullable().optional(),
})

export type RegistrationFormData = z.infer<typeof registrationSchema>

export const BATCHES = [
  '2021', '2022', '2023', '2024', '2025', '2026',
] as const

export const DIVISIONS = [
  { value: 'tim-system', label: 'Tim System' },
  { value: 'data', label: 'Data' },
  { value: 'design', label: 'Design' },
  { value: 'public-relation', label: 'Public Relation' },
  { value: 'pengurus-inti', label: 'Pengurus Inti' },
] as const
