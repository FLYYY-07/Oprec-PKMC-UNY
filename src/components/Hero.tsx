'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, Target, Users, BookOpen, Zap } from 'lucide-react'
import { clsx } from 'clsx'

const stats = [
  { value: '50+', label: 'Proyek Selesai' },
  { value: '200+', label: 'Anggota Aktif' },
  { value: '15+', label: 'Competition Menang' },
  { value: '5', label: 'Divisi Unggulan' },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-50/50 via-white to-purple-50/50" />
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-6 animate-fade-in-up">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>Open Recruitment PKM Center 2025</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              Wujudkan Ide Mu Menjadi{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Proyek Nyata
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              Komunitas mahasiswa yang mengubah penelitian & pengabdian masyarakat jadi solusi nyata.
              Bergabung, belajar, dan berdampak bersama tim terbaik di kampus.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <Link
                href="/login"
                className={clsx(
                  'inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-base',
                  'bg-gradient-to-r from-indigo-600 to-purple-600 text-white',
                  'hover:from-indigo-700 hover:to-purple-700',
                  'shadow-lg shadow-indigo-500/25',
                  'transition-all duration-200',
                  'hover:scale-[1.02] active:scale-[0.98]'
                )}
              >
                Daftar Sekarang
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="#about"
                className={clsx(
                  'inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-base',
                  'bg-white text-slate-700 border border-slate-200',
                  'hover:bg-slate-50 hover:border-slate-300',
                  'shadow-sm transition-all duration-200'
                )}
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap items-center gap-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Users className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                <span>Didukung oleh Dosen Pembimbing & Alumni</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Target className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                <span>Fokus: Riset, PKM, & Kompetisi</span>
              </div>
            </div>
          </div>

          {/* Right: Stats & Visual */}
          <div className="relative animate-fade-in-right" style={{ animationDelay: '200ms' }}>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={clsx(
                    'p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm',
                    'hover:shadow-md hover:border-slate-200 transition-all duration-300'
                  )}
                  style={{ animationDelay: `${300 + i * 100}ms` }}
                >
                  <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Feature Cards Preview */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: BookOpen, title: 'Riset Terapan', desc: 'Pendampingan penulisan proposal PKM-P, PKM-RSH, PKM-KC' },
                { icon: Zap, title: 'Fast Track Kompetisi', desc: 'Latihan presentasi & review proposal oleh alumni juara' },
                { icon: Users, title: 'Jaringan Luas', desc: 'Koneksi ke mitra industri, LPPM, & komunitas nasional' },
                { icon: Target, title: 'Roadmap Jelas', desc: 'Program terstruktur: Ide → Proposal → Pelaksanaan → Publikasi' },
              ].map((item, i) => (
                <div
                  key={item.title}
                  className={clsx(
                    'p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm',
                    'hover:shadow-lg hover:border-indigo-200 transition-all duration-300',
                    'group'
                  )}
                  style={{ animationDelay: `${500 + i * 100}ms` }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white group-hover:scale-110 transition-transform">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm">
          <ArrowRight className="h-5 w-5 text-slate-500 rotate-90" aria-hidden="true" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-right {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; opacity: 0; }
        .animate-fade-in-right { animation: fade-in-right 0.6s ease-out forwards; opacity: 0; }
      `}</style>
    </section>
  )
}