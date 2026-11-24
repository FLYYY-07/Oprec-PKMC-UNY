'use client'

import {
  Cpu,
  Database,
  Palette,
  Megaphone,
  Shield,
  Search,
  CheckCircle,
} from 'lucide-react'
import { clsx } from 'clsx'

const divisions = [
  {
    id: 'tim-system',
    name: 'Tim System',
    short: 'System',
    icon: Cpu,
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50 text-blue-600',
    description: 'Mengembangkan dan memelihara sistem informasi, website, serta infrastruktur digital PKM Center UNY.',
    responsibilities: [
      'Pengembangan & pemeliharaan website dan portal PKM Center',
      'Automasi alur pendaftaran, pendataan, dan sistem internal',
      'Integrasi API, keamanan sistem, dan manajemen server',
      'Dukungan teknis untuk seluruh kegiatan digital organisasi',
    ],
    skills: ['Web Development', 'Next.js / React', 'Backend & API', 'Git', 'Problem Solving'],
    projects: ['Portal Open Recruitment PKM Center UNY', 'Sistem Manajemen Proposal Internal'],
    lookingFor: 'Mahasiswa yang gemar membangun sistem digital, teliti dalam kode, dan siap memecahkan masalah teknis.',
  },
  {
    id: 'data',
    name: 'Data',
    short: 'Data',
    icon: Database,
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 text-emerald-600',
    description: 'Mengelola database pendaftar, analisis statistik proposal PKM, dan pelaporan berbasis data organisasi.',
    responsibilities: [
      'Pengelolaan basis data anggota, mentor, dan tim PKM UNY',
      'Pengolahan, pembersihan, dan visualisasi data capaian PKM',
      'Analisis tren pendanaan & kelolosan PIMNAS per tahun',
      'Penyusunan laporan evaluasi berbasis data untuk pengurus',
    ],
    skills: ['Excel / Spreadsheet', 'Data Analysis', 'SQL / Python', 'Visualisasi Data', 'Teliti'],
    projects: ['Dashboard Monitoring Proposal PKM UNY', 'Analisis Tren Lolos PIMNAS 5 Tahun Terakhir'],
    lookingFor: 'Mahasiswa yang rapi, kritis terhadap angka, dan suka mengolah data menjadi insight yang bermanfaat.',
  },
  {
    id: 'design',
    name: 'Design',
    short: 'Design',
    icon: Palette,
    color: 'from-purple-500 to-pink-600',
    bg: 'bg-purple-50 text-purple-600',
    description: 'Merancang identitas visual, konten kreatif, poster, infografis, dan dokumentasi media PKM Center UNY.',
    responsibilities: [
      'Desain poster, feeds, infografis, dan materi publikasi PKM',
      'Menjaga konsistensi branding visual PKM Center UNY',
      'Produksi & editing video dokumentasi serta promosi acara',
      'Kolaborasi konten kreatif bersama Public Relation',
    ],
    skills: ['Figma / Canva', 'Adobe Illustrator / Photoshop', 'Video Editing', 'Visual Branding', 'Kreativitas'],
    projects: ['Rebranding Visual PKM Center UNY', 'Kit Publikasi Road to PIMNAS'],
    lookingFor: 'Mahasiswa yang kreatif, peka terhadap estetika visual, dan senang bercerita lewat karya desain.',
  },
  {
    id: 'public-relation',
    name: 'Public Relation',
    short: 'PR',
    icon: Megaphone,
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50 text-amber-600',
    description: 'Menjadi wajah komunikasi PKM Center UNY dengan mahasiswa, fakultas, mitra eksternal, dan media sosial.',
    responsibilities: [
      'Manajemen komunikasi media sosial dan copywriting publikasi',
      'Membangun relasi dengan ormawa, dosen pembimbing, dan mitra',
      'Menjadi narahubung resmi & MC/moderator kegiatan PKM Center',
      'Strategi kampanye dan promosi program kerja organisasi',
    ],
    skills: ['Public Speaking', 'Copywriting', 'Social Media Strategy', 'Networking', 'Komunikasi'],
    projects: ['Kampanye Sosialisasi PKM Tingkat Universitas', 'Kemitraan Media & Komunitas Riset'],
    lookingFor: 'Mahasiswa yang komunikatif, percaya diri, ramah, dan mampu membangun jejaring secara profesional.',
  },
  {
    id: 'pengurus-inti',
    name: 'Pengurus Inti',
    short: 'Inti',
    icon: Shield,
    color: 'from-indigo-600 to-violet-700',
    bg: 'bg-indigo-50 text-indigo-600',
    description: 'Mengkoordinasikan arah strategis, administrasi kesekretariatan, keuangan, dan sinergi seluruh divisi.',
    responsibilities: [
      'Perencanaan strategis & pengawasan program kerja tahunan',
      'Pengelolaan administrasi surat-menyurat dan arsip resmi',
      'Manajemen keuangan, anggaran, dan laporan pertanggungjawaban',
      'Koordinasi lintas divisi serta evaluasi kinerja organisasi',
    ],
    skills: ['Leadership', 'Manajemen Organisasi', 'Administrasi', 'Pengelolaan Keuangan', 'Pengambilan Keputusan'],
    projects: ['Rapat Kerja & Evaluasi Program PKM Center', 'Tata Kelola Administrasi & Pendanaan Organisasi'],
    lookingFor: 'Mahasiswa yang visioner, bertanggung jawab, terorganisir, dan siap memimpin sinergi lintas divisi.',
  },
]

export default function Divisions() {
  return (
    <section id="divisions" className="py-20 sm:py-28 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-4">
            5 Divisi Resmi PKM Center UNY
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Temukan <span className="text-indigo-600">Peranmu</span> di Tim
          </h2>
          <p className="text-lg text-slate-600">
            Pilih 1 divisi yang paling sesuai dengan minat dan kontribusi terbaikmu di PKM Center UNY.
          </p>
        </div>

        {/* Division Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {divisions.map((div, i) => (
            <article
              key={div.id}
              className={clsx(
                'relative p-6 rounded-2xl border bg-white',
                'hover:shadow-xl hover:border-transparent transition-all duration-500',
                'group flex flex-col h-full'
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={clsx('flex h-12 w-12 items-center justify-center rounded-xl', div.bg)}>
                  <div.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <span className={clsx('text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r text-white', div.color)}>
                  {div.short}
                </span>
              </div>

              {/* Title & Desc */}
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{div.name}</h3>
              <p className="text-sm text-slate-600 mb-4 flex-1">{div.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {div.skills.slice(0, 4).map((skill, j) => (
                  <span key={j} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
                    {skill}
                  </span>
                ))}
                {div.skills.length > 4 && (
                  <span className="px-2 py-0.5 text-xs bg-indigo-100 text-indigo-600 rounded-full">
                    +{div.skills.length - 4} lagi
                  </span>
                )}
              </div>

              {/* Expandable Details */}
              <details className="group-open:mt-auto">
                <summary className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 cursor-pointer select-none">
                  <span>Lihat detail</span>
                  <Search className="h-4 w-4 transition-transform group-open:rotate-90" aria-hidden="true" />
                </summary>
                <div className="mt-4 space-y-4 text-sm border-t border-slate-100 pt-4">
                  <div>
                    <p className="font-medium text-slate-900 mb-2">Tugas Utama:</p>
                    <ul className="space-y-1">
                      {div.responsibilities.map((r, j) => (
                        <li key={j} className="flex items-start gap-2 text-slate-600">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 mb-2">Proyek Nyata:</p>
                    <ul className="space-y-1">
                      {div.projects.map((p, j) => (
                        <li key={j} className="flex items-start gap-2 text-slate-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0 mt-2" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={clsx('p-3 rounded-lg bg-gradient-to-r text-white/95', div.color)}>
                    <p className="font-medium mb-1">Kami butuh kamu yang:</p>
                    <p className="text-sm">{div.lookingFor}</p>
                  </div>
                </div>
              </details>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-slate-600 mb-6">Siap berkontribusi dan berkembang bersama PKM Center UNY?</p>
          <a href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25">
            Daftar Sekarang →
          </a>
        </div>
      </div>
    </section>
  )
}
