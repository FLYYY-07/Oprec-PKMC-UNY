'use client'

import { 
  Shield, Users, Lightbulb, Target, BookOpen, Award, CheckCircle,
  ChevronDown, Building2, GraduationCap, Flag, Star, Heart,
  ArrowRight, Calendar, Clock, MapPin, Mail, Phone, MessageSquare,
  FlaskConical, Palette, Handshake, Cog
} from 'lucide-react'
import { clsx } from 'clsx'
import { useState } from 'react'

// Data struktur organisasi
const structure = [
  { role: 'Ketua Umum', count: 1, desc: 'Memimpin organisasi, representasi eksternal, pengambilan keputusan strategis', icon: Flag },
  { role: 'Wakil Ketua', count: 2, desc: 'Membantu ketua, koordinator divisi, pengelola program kerja harian', icon: Target },
  { role: 'Sekretaris', count: 2, desc: 'Administrasi, arsip, surat-menyurat, notulen rapat, database anggota', icon: BookOpen },
  { role: 'Bendahara', count: 2, desc: 'Manajemen keuangan, anggaran, pertanggungjawaban, fundraising', icon: Award },
  { role: 'Kepala Divisi', count: 6, desc: 'Memimpin masing-masing divisi (R&D, EduTrain, ComEng, CreMedia, PartSpons, OpsLog)', icon: Users },
  { role: 'Anggota Divisi', count: '30+', desc: 'Pelaksana program kerja di tiap divisi sesuai minat & keahlian', icon: GraduationCap },
]

// Data visi misi
const visionMission = {
  vision: 'Menjadi pusat percepatan riset, pengabdian masyarakat, dan kompetisi ilmiah terdepan di Indonesia yang melahirkan generasi peneliti muda berkarakter, berkompeten, dan berdampak.',
  missions: [
    'Menyediakan ekosistem pembelajaran riset & PKM yang terstruktur, berbasis mentoring, dan terbuka untuk semua mahasiswa.',
    'Membangun jaringan kolaborasi lintas universitas, industri, pemerintah, & masyarakat untuk mendukung proyek nyata.',
    'Mengembangkan kapabilitas anggota melalui program education, competition acceleration, & community project incubation.',
    'Mewujudkan output berkualitas: publikasi jurnal, hak kekayaan intelektual, proyek PKM lolos hibah, & juara kompetisi nasional.',
    'Menanamkan nilai profesionalisme, integritas, kolaborasi, & kecurigaan intelektual sebagai fondasi budaya organisasi.',
  ],
}

// Nilai-nilai organisasi
const values = [
  { icon: Lightbulb, title: 'Kecurigaan Intelektual', desc: 'Tidak hanya menerima status quo, kita menanyakan "mengapa" dan "bagaimana" di setiap langkah. Kritis tapi konstruktif.' },
  { icon: Target, title: 'Eksekusi Berkualitas', desc: 'Ide tanpa aksi hanyalah khayalan. Kami fokus pada deliverable nyata & timeline yang dijaga. Done is better than perfect, tapi quality matters.' },
  { icon: Users, title: 'Kolaborasi Tanpa Ego', desc: 'Kredit dibagikan, masalah diselesaikan bersama. Tim > Individu. Saling menguatkan, tidak saling menurunkan.' },
  { icon: Award, title: 'Standar Profesional', desc: 'Setiap output — proposal, paper, presentasi, desain — harus memenuhi standar kompetisi nasional. Tidak "cukup baik", tapi "terbaik yang bisa dilakukan".' },
  { icon: Heart, title: 'Empati & Kepekaan Sosial', desc: 'Riset & PKM bukan untuk ego, tapi untuk solusi nyata. Kami peduli dampak nyata bagi masyarakat & lingkungan.' },
  { icon: Star, title: 'Kelanjutan & Regenerasi', desc: 'Alumni jadi mentor, senior bimbing junior. Pengetahuan tidak hilang, tapi terus diperkaya & diwariskan ke generasi berikutnya.' },
]

// Sejarah / Timeline
const history = [
  { year: '2020', title: 'Berdiri', desc: 'Didirikan oleh 5 mahasiswa Teknik Informatika UNY yang peduli riset & ingin wadah kolaborasi.', icon: Flag },
  { year: '2021', title: 'Program Pertama', desc: 'Luncurkan Research Methodology Bootcamp batch 1 (30 peserta). Fondasi kurikulum pembelajaran.', icon: BookOpen },
  { year: '2022', title: 'Ekspansi Divisi', desc: 'Tambah 3 divisi: Creative Media, Partnership, Operations. Struktur organisasi mulai matang.', icon: Users },
  { year: '2023', title: 'Juara Nasional', desc: 'Tim PKM-P meraih Juara 1 PIMNAS, 2 tim KBMI finalis. Bukti kualitas mentoring & sistem.', icon: Star },
  { year: '2024', title: 'Skala Nasional', desc: 'Mitra 15+ universitas, hibah >Rp2M, alumni 200+. Jadi rujukan organisasi riset mahasiswa.', icon: Award },
  { year: '2025', title: 'Open Recruitment Terbesar', desc: 'Batch rekrutmen paling masif. Target 50+ anggota baru. Kamu jadi bagian sejarah.', icon: Heart },
]

// Prestasi
const achievements = [
  { label: 'Juara 1 PKM-P', value: 'Nasional', detail: 'PIMNAS 2024', icon: Star, color: 'from-amber-500 to-orange-500' },
  { label: 'Finalis KBMI', value: '5 Tim', detail: 'Tahun 2023-24', icon: Flag, color: 'from-blue-500 to-indigo-500' },
  { label: 'Publikasi Jurnal', value: '12+', detail: 'Scopus & Sinta', icon: BookOpen, color: 'from-emerald-500 to-teal-500' },
  { label: 'Hibah Diterima', value: 'Rp 2.1M+', detail: 'Dana penelitian 2024', icon: Award, color: 'from-purple-500 to-pink-500' },
  { label: 'Alumni Tersebar', value: '200+', detail: 'Top-tech, riset, startup', icon: GraduationCap, color: 'from-indigo-500 to-purple-500' },
  { label: 'Mitra Aktif', value: '15+', detail: 'Universitas & Industri', icon: Handshake, color: 'from-slate-500 to-slate-700' },
]

// Kontak
const contactInfo = [
  { icon: Mail, label: 'Email Rekrutmen', value: 'rekrutmen@pkmcenter.id', href: 'mailto:rekrutmen@pkmcenter.id' },
  { icon: Phone, label: 'WhatsApp Admin', value: '+62 812-3456-7890', href: 'https://wa.me/6281234567890' },
  { icon: MessageSquare, label: 'Instagram', value: '@pkmcenter.uny', href: 'https://instagram.com/pkmcenter.uny' },
  { icon: MapPin, label: 'Lokasi Secretariat', value: 'LPPM Building, Lt. 2, UNY', href: '#' },
]

export default function InfoOrganisasi() {
  const [activeAccordion, setActiveAccordion] = useState<string | null>('vision')

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
            <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 via-white to-indigo-50 pt-16">
              <div 
                className="absolute inset-0 opacity-5" 
                style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
                }} 
              />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-6 animate-fade-in-up">
            <Shield className="h-4 w-4" aria-hidden="true" />
            <span>Informasi Organisasi PKM Center</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Kenali Kami Lebih <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Dekat</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Visi, misi, struktur, sejarah, prestasi, dan nilai-nilai yang menggerakkan PKM Center.
            Pahami budaya kami sebelum memutuskan bergabung.
          </p>
        </div>
      </section>

      {/* Visi & Misi */}
      <section id="visi-misi" className="py-20 sm:py-28 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Visi */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-white h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <Target className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Visi PKM Center</h2>
                    <p className="text-indigo-100 text-sm">Arah jangka panjang kami</p>
                  </div>
                </div>
                <p className="text-lg text-indigo-100 leading-relaxed whitespace-pre-line">{visionMission.vision}</p>
              </div>
            </div>

            {/* Misi */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8">Misi & Tujuan</h2>
              <div className="space-y-4">
                {visionMission.missions.map((mission, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-2xl bg-white border border-slate-100 hover:shadow-lg hover:border-indigo-200 transition-all duration-300 group flex gap-4"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <span className="font-bold text-lg">{i + 1}</span>
                    </div>
                    <p className="text-slate-700 pt-1 leading-relaxed">{mission}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nilai-Nilai Organisasi */}
      <section id="nilai" className="py-20 sm:py-28 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-4">
              Nilai Inti (Core Values)
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Budaya yang <span className="text-indigo-600">Kami Bangun</span>
            </h2>
            <p className="text-lg text-slate-600">
              Enam pilar budaya yang jadi kompas setiap keputusan & tindakan anggota PKM Center.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, i) => (
              <div
                key={value.title}
                className="p-6 rounded-2xl bg-white border border-slate-100 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <value.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-slate-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Struktur Organisasi */}
      <section id="struktur" className="py-20 sm:py-28 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-4">
              Struktur Organisasi
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Susunan <span className="text-indigo-600">Pengurus & Divisi</span>
            </h2>
            <p className="text-lg text-slate-600">
              Struktur lean & fungsional: 6 divisi unggulan dibawah koordinasi Dewan Pengurus Harian.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {structure.map((item, i) => (
              <div
                key={item.role}
                className="p-6 rounded-2xl bg-white border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 flex-shrink-0">
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{item.role}</h3>
                      <span className="px-2 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-600 rounded-full">
                        {item.count} orang
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Divisi Overview */}
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-600 p-8 md:p-12 text-white">
            <div className="text-center mb-10">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">6 Divisi Unggulan</h3>
              <p className="text-indigo-100 max-w-2xl mx-auto">Setiap divisi punya otonomi penuh mengelola program kerjanya, tapi saling kolaboratif dalam proyek lintas divisi.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Research & Development', short: 'R&D', icon: FlaskConical, color: 'bg-blue-500/20', desc: 'Ide → Proposal → Publikasi' },
                { name: 'Education & Training', short: 'EduTrain', icon: GraduationCap, color: 'bg-emerald-500/20', desc: 'Kurikulum, Bootcamp, Mentoring' },
                { name: 'Community Engagement', short: 'ComEng', icon: Users, color: 'bg-amber-500/20', desc: 'PKM-M, KKN, Dampak Sosial' },
                { name: 'Creative & Media', short: 'CreMedia', icon: Palette, color: 'bg-purple-500/20', desc: 'Desain, Video, SocMed, Branding' },
                { name: 'Partnership & Sponsorship', short: 'PartSpons', icon: Handshake, color: 'bg-indigo-500/20', desc: 'Grant, MoU, Networking' },
                { name: 'Operations & Logistics', short: 'OpsLog', icon: Cog, color: 'bg-slate-500/20', desc: 'Admin, Keuangan, Acara, Infra' },
              ].map((div, i) => (
                <div key={div.name} className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors text-center">
                  <div className={clsx('flex h-11 w-11 items-center justify-center rounded-xl mx-auto mb-3', div.color)}>
                    <div.icon className="h-5 w-5 text-white" aria-hidden="true" />
                  </div>
                  <h4 className="font-semibold mb-1">{div.name}</h4>
                  <p className="text-xs text-indigo-100">{div.desc}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-white/20 rounded-full">{div.short}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sejarah / Timeline */}
      <section id="sejarah" className="py-20 sm:py-28 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-4">
              Perjalanan Kami
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Sejarah <span className="text-indigo-600">PKM Center</span>
            </h2>
            <p className="text-lg text-slate-600">
              Dari komunitas kecil 5 orang jadi organisasi riset mahasiswa skala nasional.
            </p>
          </div>

          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-indigo-500 to-purple-500" />
            <div className="space-y-12">
              {history.map((item, i) => (
                <div key={item.year} className="relative pl-20">
                  <div className="absolute left-8 top-1 flex h-12 w-12 items-center justify-center rounded-full bg-white border-4 z-10" style={{ borderColor: `var(--tw-gradient-from)` }}>
                    <span className="text-sm font-bold text-indigo-600">{item.year}</span>
                  </div>
                  <div className="p-6 rounded-2xl bg-white border border-slate-100 hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                        <item.icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <h4 className="font-semibold text-slate-900">{item.title}</h4>
                    </div>
                    <p className="text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Prestasi */}
      <section id="prestasi" className="py-20 sm:py-28 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-4">
              Prestasi & Penghargaan
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Bukti Nyata <span className="text-indigo-600">Komitmen Kami</span>
            </h2>
            <p className="text-lg text-slate-600">
              Prestasi yang diraih anggota & alumni sebagai bukti kualitas sistem bimbingan & budaya ekselensi.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((ach, i) => (
              <div
                key={ach.label}
                className="p-6 rounded-2xl bg-white border border-slate-100 hover:shadow-xl hover:border-transparent transition-all duration-300 group relative overflow-hidden"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r" style={{ background: ach.color }} />
                <div className="flex items-center gap-3 mb-4">
                  <div className={clsx('flex h-12 w-12 items-center justify-center rounded-xl', ach.color + ' text-white')}>
                    <ach.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{ach.detail}</p>
                    <p className="font-semibold text-slate-900">{ach.label}</p>
                  </div>
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent" style={{ background: ach.color }}>
                  {ach.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq-organisasi" className="py-20 sm:py-28 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Pertanyaan Umum Tentang <span className="text-indigo-600">Organisasi</span>
            </h2>
            <p className="text-lg text-slate-600">Koleksi pertanyaan yang sering ditanya calon anggota soal budaya, komitmen, & kehidupan di PKM Center.</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {orgFAQs.map((faq, i) => (
              <details
                key={i}
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden transition-all duration-300"
                open={activeAccordion === `org-${i}`}
                onToggle={() => setActiveAccordion(activeAccordion === `org-${i}` ? null : `org-${i}`)}
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                  <h3 className="font-semibold text-slate-900 pr-10">{faq.q}</h3>
                  <ChevronDown className={clsx('h-5 w-5 text-slate-400 transition-transform flex-shrink-0', 'group-open:rotate-180')} aria-hidden="true" />
                </summary>
                <div className="px-6 pb-6 pt-0 text-slate-600 leading-relaxed animate-fade-in-up">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Kontak & CTA */}
            <section id="contact" className="py-20 sm:py-28 lg:py-32 bg-indigo-600 relative overflow-hidden">
              <div 
                className="absolute inset-0 opacity-5" 
                style={{ 
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
                }} 
              />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Masih Punya Pertanyaan?
              </h2>
              <p className="text-indigo-100 text-lg mb-8">
                Tim kami siap bantu. Hubungi kami via email, WhatsApp, atau datangi sekretariat langsung.
              </p>
              <div className="space-y-4">
                {contactInfo.map((contact, i) => (
                  <a
                    key={contact.label}
                    href={contact.href}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all group"
                    target={contact.href.startsWith('http') || contact.href.startsWith('mailto') ? '_blank' : undefined}
                    rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 group-hover:bg-indigo-500 transition-colors">
                      <contact.icon className="h-5 w-5 text-white" aria-hidden="true" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-indigo-200 font-medium">{contact.label}</p>
                      <p className="text-white font-medium">{contact.value}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-indigo-200 ml-auto group-hover:text-white transition-colors" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-white/10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 mx-auto mb-6">
                <Shield className="h-8 w-8 text-white" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Siap Jadi Bagian PKM Center?</h3>
              <p className="text-indigo-100 mb-8 max-w-md mx-auto">
                Open Recruitment 2025 dibuka! Bergabunglah dengan komunitas peneliti muda terbaik dan wujudkan ide mu jadi proyek nyata.
              </p>
              <a
                href="/daftar"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base bg-white text-indigo-600 hover:bg-indigo-50 transition-all shadow-lg hover:scale-[1.02]"
              >
                Daftar Sekarang
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// FAQ Data for Organisasi
const orgFAQs = [
  {
    q: 'Berapa jam komitmen mingguan yang dibutuhkan sebagai anggota PKM Center?',
    a: 'Rata-rata 8-12 jam/minggu: 1x pertemuan rutin divisi (2-3 jam), 1x sharing session/bulan, plus waktu fleksibel untuk tugas proyek. Kami paham kuliah prioritas, jadi jadwal diatur hybrid (malam/weekend) & ada recording untuk yang bentrok.',
  },
  {
    q: 'Apakah wajib sudah punya pengalaman riset/PKM sebelumnya?',
    a: 'Tidak wajib. Kami menerima mahasiswa dari level pemula hingga lanjutan. Program Education & Training dirancang khusus buat yang belum punya background riset. Yang penting: rasa ingin tahu tinggi, komitmen belajar, & tidak takut gagal.',
  },
  {
    q: 'Bagaimana sistem bimbingan/mentoring di PKM Center?',
    a: 'Setiap anggota mendapat: (1) Senior Buddy (anggota senior di divisi yg sama) untuk daily guidance, (2) Divisi Head untuk arahan teknis, (3) Dosen Pembimbing untuk validasi akademik, (4) Alumni Mentor untuk karir & competition strategy. Review proposal mingguan, mock presentation 3x sebelum kompetisi.',
  },
  {
    q: 'Apakah ada biaya keanggotaan/bulanan?',
    a: 'Tidak ada biaya bulanan. Operasional difunding dari hibah LPPM, sponsorship industri, & dana internal. Biaya yang mungkin muncul: transport ke lokasi PKM-M/KKN (bisa diajukan reimbursement), atau kontribusi sukarela untuk merch/acara besar.',
  },
  {
    q: 'Bisa bergabung di lebih dari 1 divisi?',
    a: 'Sistem utama: 1 divisi utama (home base) + opsi cross-divisi project. Setelah onboarding 1 bulan, kamu bisa join proyek lintas divisi (misal: R&D butuh desain → minta bantuan CreMedia). Generalist track: rotasi 3 divisi dalam 1 semester buat cari fit terbaik.',
  },
  {
    q: 'Bagaimana jika saya drop out / tidak aktif di tengah jalan?',
    a: 'Kami punya sistem "graceful exit": beri tau Divisi Head & Sekretaris minimal 2 minggu sebelum, serahkan tugas & akses (Notion, Drive, dll), exit interview singkat buat evaluasi. Tidak ada sanksi, tapi sertifikat keaktifan hanya diberikan jika minimal 80% kehadiran & menyelesaikan 1 proyek.',
  },
  {
    q: 'Apakah PKM Center hanya untuk mahasiswa Teknik/Informatika?',
    a: 'Bukan! Anggota kami dari berbagai jurusan: Informatika, SI, TK, Ilmu Komputer, Elektro, Industri, Matematika, Statistika, hingga non-teknik (Pendidikan, Ekonomi, Psikologi). Riset & PKM butuh tim multidisplin: coding, desain, analisis data, writting, manajemen proyek, community engagement.',
  },
  {
    q: 'Apa bedanya PKM Center dengan UKM/Himpunan lain di kampus?',
    a: 'Fokus spesifik: riset terapan, PKM, & kompetisi ilmiah (bukan kegiatan sosial/olahraga/agama umum). Sistem mentoring terstruktur dari ide sampai publikasi. Output wajib: proposal PKM, paper, atau produk kompetisi. Jaringan alumni kuat di industri riset, tech, & academia. Kolaborasi langsung dengan LPPM & dosen pembimbing.',
  },
]