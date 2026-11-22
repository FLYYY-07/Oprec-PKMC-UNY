'use client'

import { CheckCircle, Clock, Award, GraduationCap, Lightbulb, Rocket, Users, BookOpen, Target } from 'lucide-react'
import { clsx } from 'clsx'

const programs = [
  {
    icon: Lightbulb,
    title: 'Ideation & Proposal Writing',
    description: 'Workshop intensif mencari ide riset/PKM, validasi masalah, hingga penulisan proposal yang lolos seleksi.',
    duration: '4 Minggu',
    level: 'Pemula - Menengah',
    highlights: ['Brainstorming terstruktur', 'Template proposal terbukti', 'Review mingguan oleh mentor'],
    color: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  {
    icon: BookOpen,
    title: 'Research Methodology Bootcamp',
    description: 'Pelatihan metodologi penelitian: studi pustaka, desain eksperimen, analisis data, hingga penulisan paper.',
    duration: '6 Minggu',
    level: 'Menengah',
    highlights: ['Statistika dasar & lanjutan', 'Tools: R, Python, NVivo', 'Praktik jurnal & konferensi'],
    color: 'from-blue-500 to-indigo-500',
    iconBg: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Rocket,
    title: 'Competition Acceleration',
    description: 'Program persiapan kompetisi (PKM, Gemastik, KBMI, dll): simulasi presentasi, Q&A session, polishing slide.',
    duration: '3 Minggu',
    level: 'Menengah - Lanjutan',
    highlights: ['Mock presentation 3x', 'Feedback dari juri berpengalaman', 'Networking dengan tim lain'],
    color: 'from-purple-500 to-pink-500',
    iconBg: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Target,
    title: 'Community Project Incubation',
    description: 'Inkubasi proyek pengabdian masyarakat: perencanaan, eksekusi, monitoring, hingga laporan akuntabilitas.',
    duration: '8 Minggu',
    level: 'Semua Level',
    highlights: ['Dana seed funding tersedia', 'Mitra desa/komunitas nyata', 'Sertifikat & publikasi media'],
    color: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
]

const benefits = [
  { icon: Award, title: 'Sertifikat Resmi', desc: 'Dikeluarkan oleh LPPM & PKM Center, valid untuk SKPI & portofolio karir.' },
  { icon: Users, title: 'Jaringan Alumni', desc: 'Akses grup alumni yang bekerja di top-tech, riset, & startup.' },
  { icon: GraduationCap, title: 'Kredit SKS (Jika Berlaku)', desc: 'Beberapa program bisa dikonversi ke MBKM / PKM akademik.' },
  { icon: Clock, title: 'Fleksibel & Hybrid', desc: 'Kuliah tetap prioritas. Sesi malam/weekend + akses recording.' },
]

export default function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            Program Unggulan PKM Center
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Program Terstruktur untuk <span className="text-indigo-600">Percepat Perjalananmu</span>
          </h2>
          <p className="text-lg text-slate-600">
            Setiap program dirancang berjenjang: dari mencari ide hingga memenangkan kompetisi nasional.
            Pilih yang sesuai levelmu, atau ikuti jalur lengkapnya.
          </p>
        </div>

        {/* Program Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {programs.map((program, index) => (
            <article
              key={program.title}
              className={clsx(
                'relative p-6 rounded-2xl border bg-white',
                'hover:shadow-xl hover:border-transparent transition-all duration-300',
                'group'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Top Accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r" style={{ background: program.color }} />

              {/* Icon */}
              <div className={clsx('flex h-12 w-12 items-center justify-center rounded-xl mb-4', program.iconBg)}>
                <program.icon className="h-6 w-6" aria-hidden="true" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-slate-900 mb-2">{program.title}</h3>
              <p className="text-slate-600 text-sm mb-4 line-clamp-2">{program.description}</p>

              {/* Meta */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                  {program.duration}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-full">
                  {program.level}
                </span>
              </div>

              {/* Highlights */}
              <ul className="space-y-2 mb-6">
                {program.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    {highlight}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                className={clsx(
                  'w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                  'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600',
                  'group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600',
                  'group-hover:text-white'
                )}
              >
                Pelajari Detail →
              </button>
            </article>
          ))}
        </div>

        {/* Benefits Grid */}
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-600 p-8 md:p-12 text-white">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">Mengapa Bergabung PKM Center?</h3>
            <p className="text-indigo-100 max-w-2xl mx-auto">Lebih dari sekadar organisasi — kami adalah platform percepatan karir riset & inovasi mu.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <div key={benefit.title} className="text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                  <benefit.icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <h4 className="font-semibold text-lg mb-1">{benefit.title}</h4>
                <p className="text-indigo-100 text-sm">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}