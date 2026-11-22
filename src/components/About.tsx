'use client'

import { Shield, Users, Lightbulb, Target, BookOpen, Award, CheckCircle } from 'lucide-react'
import { clsx } from 'clsx'

const values = [
  { icon: Lightbulb, title: 'Kecurigaan Intelektual', desc: 'Tidak hanya menerima status quo, kita menanyakan "mengapa" dan "bagaimana" di setiap langkah.' },
  { icon: Target, title: 'Eksekusi Berkualitas', desc: 'Ide tanpa aksi hanyalah khayalan. Kami fokus pada deliverable nyata & timeline yang dijaga.' },
  { icon: Users, title: 'Kolaborasi Tanpa Ego', desc: 'Kredit dibagikan, masalah diselesaikan bersama. Tim > Individu.' },
  { icon: Award, title: 'Standar Profesional', desc: 'Setiap output — proposal, paper, presentasi — harus memenuhi standar kompetisi nasional.' },
]

const achievements = [
  { label: 'Juara 1 PKM-P', value: 'Nasional', year: '2024' },
  { label: 'Finalis KBMI', value: '5 Tim', year: '2024' },
  { label: 'Publikasi Jurnal', value: '12+', year: '2023-24' },
  { label: 'Hibah Diterima', value: 'Rp 2.1M+', year: '2024' },
]

const timeline = [
  { year: '2020', title: 'Berdiri', desc: 'Didirikan oleh 5 mahasiswa Teknik Informatika yang peduli riset.' },
  { year: '2021', title: 'Program Pertama', desc: 'Luncurkan Research Methodology Bootcamp batch 1 (30 peserta).' },
  { year: '2022', title: 'Ekspansi Divisi', desc: 'Tambah 3 divisi: Creative Media, Partnership, Operations.' },
  { year: '2023', title: 'Juara Nasional', desc: 'Tim PKM-P meraih juara 1 PIMNAS, 2 tim KBMI finalis.' },
  { year: '2024', title: 'Skala Nasional', desc: 'Mitra 15+ universitas, hibah >Rp2M, alumni 200+.' },
  { year: '2025', title: 'Mu Bergabung', desc: 'Open Recruitment batch terbesar — jadi bagian dari sejarah.' },
]

export default function About() {
  return (
    <section id="about" className="py-20 sm:py-28 lg:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-4">
            Tentang Kami
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Membangun <span className="text-indigo-600">Generasi Peneliti</span> & Inovator
          </h2>
          <p className="text-lg text-slate-600">
            PKM Center adalah organisasi mahasiswa otonom di bawah naungan LPPM yang berfokus pada
            penelitian, pengabdian masyarakat, dan kompetisi ilmiah. Kami percaya setiap mahasiswa
            punya potensi jadi peneliti — mereka butuh bimbingan, struktur, dan komunitas yang tepat.
          </p>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {values.map((value, i) => (
            <div
              key={value.title}
              className="p-6 rounded-2xl bg-white border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 mb-4">
                <value.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{value.title}</h3>
              <p className="text-sm text-slate-600">{value.desc}</p>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div className="rounded-3xl bg-white border border-slate-100 p-8 md:p-12 mb-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Prestasi Terbaru</h3>
            <p className="text-slate-600">Bukti nyata komitmen anggota & mentor kami dalam tingkat nasional.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((ach, i) => (
              <div key={ach.label} className="text-center relative">
                {i < 3 && (
                  <div className="absolute top-0 right-0 hidden md:block w-[1px] h-full bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
                )}
                <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                  {ach.value}
                </div>
                <div className="font-semibold text-slate-900 mb-1">{ach.label}</div>
                <div className="text-sm text-slate-500">{ach.year}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-indigo-500 to-purple-500" />
          <div className="space-y-12">
            {timeline.map((item, i) => (
              <div key={item.year} className="relative pl-20">
                <div className="absolute left-8 top-1 flex h-12 w-12 items-center justify-center rounded-full bg-white border-4 border-indigo-500 z-10">
                  <span className="text-sm font-bold text-indigo-600">{item.year}</span>
                </div>
                <div className="p-6 rounded-2xl bg-white border border-slate-100 hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
                  <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}