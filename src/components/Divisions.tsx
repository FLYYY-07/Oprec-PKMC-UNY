'use client'

import { 
  FlaskConical, 
  GraduationCap, 
  Users, 
  Palette, 
  Handshake, 
  Cog,
  Search,
  BookOpen,
  Megaphone,
  Camera,
  Briefcase,
  ClipboardList,
  Package,
  CheckCircle,
} from 'lucide-react'
import { clsx } from 'clsx'

const divisions = [
  {
    id: 'research-development',
    name: 'Research & Development',
    short: 'R&D',
    icon: FlaskConical,
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50 text-blue-600',
    description: 'Jantung riset PKM Center. Mengelola ide → proposal → eksekusi riset terapan & publikasi.',
    responsibilities: [
      'Pendampingan penulisan proposal PKM-P, PKM-RSH, PKM-KC',
      'Metodologi penelitian & analisis data',
      'Koordinasi review proposal internal',
      'Publikasi jurnal & konferensi',
    ],
    skills: ['Critical Thinking', 'Academic Writing', 'Statistics', 'R/Python', 'LaTeX'],
    projects: ['PKM-P: Sistem Deteksi Penyakit Tanaman', 'PKM-RSH: Analisis Sentimen Media Sosial'],
    lookingFor: 'Mahasiswa yang suka membaca paper, punya rasa ingin tahu tinggi, & tidak takut data.',
  },
  {
    id: 'education-training',
    name: 'Education & Training',
    short: 'EduTrain',
    icon: GraduationCap,
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 text-emerald-600',
    description: 'Mendesain & menjalankan program pembelajaran: bootcamp, workshop, sharing session, mentoring.',
    responsibilities: [
      'Kurikulum Research Methodology Bootcamp',
      'Workshop tools: Git, LaTeX, Overleaf, Canva, Figma',
      'Peer mentoring & study group',
      'Manajemen LMS & materi pembelajaran',
    ],
    skills: ['Instructional Design', 'Public Speaking', 'Facilitation', 'LMS (Moodle/Canvas)', 'Content Creation'],
    projects: ['Bootcamp Batch 1-5 (200+ alumni)', 'Workshop Series: "Dari Nol ke Paper"'],
    lookingFor: 'Yang suka mengajar, sharing knowledge, & punya kemampuan presentasi yang baik.',
  },
  {
    id: 'community-engagement',
    name: 'Community Engagement',
    short: 'ComEng',
    icon: Users,
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50 text-amber-600',
    description: 'Menghubungkan kampus dengan masyarakat nyata melalui PKM-M, KKN, & proyek berbasis desa.',
    responsibilities: [
      'Survey lokasi & needs assessment masyarakat',
      'Perencanaan & eksekusi PKM-PM / KKN',
      'Koordinasi dengan pihak desa / stakeholder',
      'Monitoring & evaluasi dampak sosial',
    ],
    skills: ['Community Mapping', 'Project Management', 'Stakeholder Communication', 'Report Writing', 'Empati'],
    projects: ['PKM-PM: Digitalisasi UMKM Desa X', 'KKN Tematik: Literasi Digital Lansia'],
    lookingFor: 'Punya kepekaan sosial, suka turun lapangan, & bisa berkomunikasi lintas budaya.',
  },
  {
    id: 'creative-media',
    name: 'Creative & Media',
    short: 'CreMedia',
    icon: Palette,
    color: 'from-purple-500 to-pink-600',
    bg: 'bg-purple-50 text-purple-600',
    description: 'Visualisasi ide riset jadi konten menarik: poster, video, website, branding, dokumentasi.',
    responsibilities: [
      'Desain poster ilmiah & infografis riset',
      'Video dokumentasi & promosi kegiatan',
      'Manajemen sosial media (IG, LinkedIn, TikTok)',
      'Branding & merchandise organisasi',
      'Website & portfolio digital',
    ],
    skills: ['Figma/Canva', 'Video Editing (CapCut/Premiere)', 'Motion Graphics', 'Copywriting', 'Social Media Strategy'],
    projects: ['Rebranding PKM Center 2024', 'Video Profil Tim Juara PIMNAS'],
    lookingFor: 'Kreatif, punya portfolio desain/video, & paham tren konten edukatif.',
  },
  {
    id: 'partnership-sponsorship',
    name: 'Partnership & Sponsorship',
    short: 'PartSpons',
    icon: Handshake,
    color: 'from-indigo-500 to-purple-600',
    bg: 'bg-indigo-50 text-indigo-600',
    description: 'Membangun relasi dengan industri, alumni, LPPM, & sponsor untuk mendanai proyek anggota.',
    responsibilities: [
      'Proposal sponsorship & grant writing',
      'Negosiasi MoU dengan mitra eksternal',
      'Acara networking & career talk',
      'Manajemen database alumni & mitra',
    ],
    skills: ['Business Communication', 'Proposal Writing', 'Negotiation', 'Networking', 'CRM Management'],
    projects: ['Hibah Industri Rp500jt untuk PKM-P', 'MoU dengan 10+ Startup & Komunitas'],
    lookingFor: 'Komunikatif, percaya diri, punya jaringan, & suka "menjual" ide ke pihak eksternal.',
  },
  {
    id: 'operations-logistics',
    name: 'Operations & Logistics',
    short: 'OpsLog',
    icon: Cog,
    color: 'from-slate-500 to-slate-700',
    bg: 'bg-slate-50 text-slate-600',
    description: 'Tulang punggung organisasi: administrasi, keuangan, acara, dokumentasi, & infrastruktur.',
    responsibilities: [
      'Administrasi & arsip dokumen resmi',
      'Manajemen keuangan & laporan pertanggungjawaban',
      'Event management (rapat, acara besar, retreat)',
      'Infrastruktur: Drive, Notion, Discord, Zoom',
      'Rekrutmen & onboarding anggota baru',
    ],
    skills: ['Admin & Filing', 'Financial Literacy', 'Event Planning', 'Notion/Drive', 'Detail-Oriented'],
    projects: ['Sistem Arsip Digital Terintegrasi', 'Manajemen Anggaran Tahunan Rp100jt+'],
    lookingFor: 'Rapi, teliti, suka sistem & prosedur, & jadi "problem solver" di balik layar.',
  },
]

export default function Divisions() {
  return (
    <section id="divisions" className="py-20 sm:py-28 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-4">
            6 Divisi Unggulan
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Temukan <span className="text-indigo-600">Peranmu</span> di Tim
          </h2>
          <p className="text-lg text-slate-600">
            Setiap divisi punya fokus unik tapi saling terhubung. Pilih yang cocok bakatmu,
            atau daftar sebagai <span className="font-medium text-indigo-600">Generalist</span> untuk rotasi.
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
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-gradient-to-r text-white" style={{ background: div.color }}>
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
                  <div className="p-3 rounded-lg bg-gradient-to-r text-white/90" style={{ background: div.color }}>
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
          <p className="text-slate-600 mb-4">Masih bingung divisi mana yang cocok?</p>
          <p className="text-slate-500 mb-6">Pilih <span className="font-medium text-indigo-600">"Generalist"</span> di form pendaftaran — kami akan bantu tempatkan kamu setelah wawancara.</p>
          <a href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25">
            Daftar Sekarang →
          </a>
        </div>
      </div>
    </section>
  )
}