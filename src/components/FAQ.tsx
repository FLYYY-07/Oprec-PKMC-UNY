'use client'

import { 
  ChevronDown, Search, Mail, MessageSquare, Clock, Shield,
  CheckCircle, ArrowRight, Sparkles, BookOpen, Users, Target,
  GraduationCap, Award, Lightbulb, Heart, Flag
} from 'lucide-react'
import { clsx } from 'clsx'
import { useState } from 'react'
import Link from 'next/link'

// FAQ Categories
const faqCategories = [
  { id: 'general', label: 'Umum', icon: BookOpen, count: 6 },
  { id: 'registration', label: 'Pendaftaran', icon: MessageSquare, count: 5 },
  { id: 'selection', label: 'Seleksi', icon: Target, count: 5 },
  { id: 'division', label: 'Divisi & Peran', icon: Users, count: 4 },
  { id: 'commitment', label: 'Komitmen & Manfaat', icon: Award, count: 5 },
  { id: 'technical', label: 'Teknis & Lainnya', icon: Lightbulb, count: 4 },
] as const

// FAQ Data
const faqData = {
  general: [
    {
      q: 'Apa itu PKM Center?',
      a: 'PKM Center adalah organisasi mahasiswa otonom di bawah naungan LPPM yang berfokus pada penelitian (Research), pengabdian masyarakat (PKM), dan kompetisi ilmiah (Kompetisi). Kami menyediakan ekosistem lengkap: mentoring terstruktur, program education, akses hibah, jaringan alumni, dan fasilitas untuk mempercepat perjalanan riset & inovasi mahasiswa.',
    },
    {
      q: 'Siapa yang bisa bergabung PKM Center?',
      a: 'Mahasiswa aktif UNY (semester 1-6) dari semua jurusan/fakultas. Tidak terbatas pada jurusan teknik — kami butuh keberagaman: coding, desain, analisis data, penulisan ilmiah, manajemen proyek, community engagement, komunikasi, dll. Yang penting: rasa ingin tahu, komitmen, dan niat tulus berkontribusi.',
    },
    {
      q: 'Berapa total anggota PKM Center saat ini?',
      a: 'Saat ini 200+ anggota aktif terdaftar tersebar di 6 divisi. Open Recruitment 2025 menargetkan 50+ anggota baru untuk memperluas dampak dan regenerasi kepemimpinan.',
    },
    {
      q: 'Apakah PKM Center resmi diakui kampus?',
      a: 'Ya. PKM Center adalah organisasi mahasiswa otonom yang terdaftar dan dibina oleh LPPM (Lembaga Penelitian dan Pengabdian Masyarakat) UNY. Semua program kerja terkoordinasi dengan LPPM dan dosen pembimbing.',
    },
    {
      q: 'Dimana lokasi sekretariat PKM Center?',
      a: 'Sekretariat berada di Gedung LPPM Lantai 2, Kampus Utama UNY. Bisa datang langsung saat jam kerja (Senin-Jumat, 09:00-16:00) atau hubungi admin via WA untuk janji temu.',
    },
    {
      q: 'Bagaimana cara menghubungi tim rekrutmen?',
      a: 'Email: rekrutmen@pkmcenter.id | WhatsApp: +62 812-3456-7890 | Instagram: @pkmcenter.uny (DM). Biasanya balas dalam 1-2 hari kerja.',
    },
  ],
  registration: [
    {
      q: 'Kapan periode pendaftaran Open Recruitment 2025?',
      a: 'Pendaftaran dibuka: 1 Januari 2025 | Ditutup: 31 Januari 2025 pukul 23:59 WIB. Pengumuman lolos administrasi: 5 Februari 2025. Wawancara: 10-15 Februari 2025. Pengumuman akhir: 20 Februari 2025. Onboarding: 1 Maret 2025.',
    },
    {
      q: 'Apa syarat pendaftaran minimal?',
      a: '(1) Mahasiswa aktif UNY semester 1-6, (2) Memiliki NIM & email mahasiswa (@student.univ.ac.id) valid, (3) Bersedia aktif minimal 1 semester (2 semester lebih diutamakan), (4) Komitmen hadir di kegiatan rutin divisi & organisasi, (5) Mengisi form pendaftaran lengkap termasuk motivasi min. 100 karakter.',
    },
    {
      q: 'Apakah boleh mendaftar ke lebih dari 1 divisi?',
      a: 'Di form pendaftaran, kamu hanya memilih 1 divisi preferensi utama. Namun, ada opsi "Generalist" untuk yang ingin rotasi 3 divisi dalam 1 semester. Setelah onboarding, kamu bisa join proyek lintas divisi (cross-divisi collaboration).',
    },
    {
      q: 'Bagaimana jika email/NIM sudah terdaftar (duplicate)?',
      a: 'Sistem akan menolak pendaftaran duplikat. Jika kamu salah isi data dan ingin daftar ulang, hubungi admin via WhatsApp (+62 812-3456-7890) untuk menghapus data lama terlebih dahulu.',
    },
    {
      q: 'Apakah bisa mendaftar sebagai tim/kelompok?',
      a: 'Pendaftaran bersifat individual. Setiap orang di evaluasi sendiri. Namun, jika kamu sudah punya teman yang ingin bergabung bareng, silakan daftar masing-masing dan cantumkan nama teman di kolom motivasi — kami akan pertimbangkan untuk ditempatkan divisi yang sama jika keduanya lolos.',
    },
  ],
  selection: [
    {
      q: 'Bagaimana tahapan seleksi Open Recruitment 2025?',
      a: '4 Tahap: (1) Administrasi & Validasi Data (otomatis sistem), (2) Penilaian Motivasi & Essay (tim rekrutmen), (3) Wawancara Kompetensi & Kecocokan Budaya (Divisi Head + HRD), (4) Pengumuman & Onboarding. Tidak ada tes tertulis/akademik — kami menilai potensi, mindset, dan komitmen.',
    },
    {
      q: 'Apa yang dinilai di essay motivasi?',
      a: 'Kami cari: (1) Kenapa PKM Center? (bukan copy-paste), (2) Pengalaman relevan: org, riset, PKM, kompetisi, proyek, porto (boleh "belum punya tapi mau belajar"), (3) Apa yang ingin dicapai di sini (spesifik, realistis), (4) Nilai yang dibawa: kolaboratif, kritis, eksekusi, empati. Minimal 100 karakter, maksimal 1000.',
    },
    {
      q: 'Seperti apa wawancaranya?',
      a: 'Durasi 20-30 menit, online (Zoom/Google Meet) atau offline di sekretariat. Panel: 1 Divisi Head + 1 HRD. Format: perkenalan (2 menit), diskusi motivasi & essay (10 menit), case study/mini task ringan (5 menit), tanya jawab bebas (5 menit). Dress code: casual rapi. Persiapan: baca web PKM Center, pahami divisi yg dilamar, siap ceritakan pengalaman nyata.',
    },
    {
      q: 'Kapan hasil seleksi diumumkan?',
      a: 'Pengumuman lolos administrasi: 5 Februari 2025 (via email & WA). Pengumuman hasil wawancara & keputusan final: 20 Februari 2025. Semua keputusan final — tidak ada banding. Yang tidak lolos mendapat feedback singkat via email untuk evaluasi diri.',
    },
    {
      q: 'Apakah ada kuota per divisi?',
      a: 'Ya, kuota per divisi: R&D (10), EduTrain (8), ComEng (8), CreMedia (8), PartSpons (6), OpsLog (6), Generalist (10). Total ~50. Kuota bisa berubah berdasarkan kebutuhan proyek. Jika divisi penuh, kandidat kuat bisa ditawarkan divisi alternatif atau Generalist.',
    },
  ],
  division: [
    {
      q: 'Bagaimana cara memilih divisi yang cocok?',
      a: 'Baca detail 6 divisi di halaman Info Organisasi / Divisi. Pertimbangkan: (1) Minat & kekuatan saat ini, (2) Skill yang ingin dikembangkan, (3) Jenis proyek yang menarik (riset murni, pengabdian lapangan, desain/video, sponsorship, event, admin). Masih bingung? Pilih "Generalist" — kami bantu tempatkan setelah wawancara.',
    },
    {
      q: 'Apakah bisa pindah divisi di tengah masa jabatan?',
      a: 'Bisa, dengan syarat: (1) Sudah minimal 1 bulan di divisi asal, (2) Approval Divisi Head asal & Divisi Head tujuan, (3) Alasan jelas (misal: ternyata minat di video editing > riset data). Proses pindah via HRD. Generalist track: rotasi otomatis tiap 1 bulan tanpa perlu approval.',
    },
    {
      q: 'Apa bedanya divisi R&D dan EduTrain?',
      a: 'R&D: fokus eksekusi riset — ide, proposal, metodologi, analisis data, publikasi. Output: proposal PKM, paper, IPR. EduTrain: fokus pembelajaran — kurikulum, bootcamp, workshop, mentoring, LMS. Output: materi ajar, modul, sistem bimbingan. R&D "buat riset", EduTrain "ajar riset". Banyak kolaborasi: R&D butuh modul dari EduTrain, EduTrain butuh case study dari R&D.',
    },
    {
      q: 'Divisi apa yang paling butuh orang baru?',
      a: 'Semua divisi butuh regenerasi. Tapi historis: R&D & ComEng paling banyak proyek & butuh tenaga eksekusi. CreMedia & PartSpons butuh portofolio/koneksi spesifik. OpsLog butuh detail-oriented. EduTrain butuh yang suka ngajar/sharing. Pilih berdasarkan fit, bukan "yang gampang".',
    },
  ],
  commitment: [
    {
      q: 'Berapa jam komitmen mingguan rata-rata?',
      a: '8-12 jam/minggu: 1x pertemuan rutin divisi (2-3 jam, malam/weekend), 1x sharing session/bulan (2 jam), tugas proyek fleksibel (3-5 jam), rapat bulanan organisasi (1 jam). Ada recording & catatan untuk yang bentrok jadwal kuliah. Masa ujian: beban dikurangi 50%.',
    },
    {
      q: 'Apakah wajib hadir di semua kegiatan?',
      a: 'Target kehadiran minimal 80% pertemuan divisi & wajib hadir rapat bulanan & acara besar (Retreat, PKM Expo, dsb). Sistem absensi digital. Izin: isi form izin minimal H-1 (sakit, kuliah bentrok, urgen). Tanpa izin >3x beruntun = peringatan. Sertifikat keaktifan hanya untuk ≥80% kehadiran + selesai 1 proyek.',
    },
    {
      q: 'Apa manfaat bergabung PKM Center?',
      a: '(1) Skill hard: riset, akademik writing, statistik, tools (R/Python/LaTeX/Figma/Video), project management. (2) Skill soft: presentasi, negosiasi, leadership, networking, time management. (3) Output nyata: sertifikat LPPM, proposal PKM lolos, publikasi jurnal, juara kompetisi, portofolio proyek. (4) Jaringan: alumni 200+ (top-tech, riset, startup), dosen pembimbing, mitra industri, 15+ univ. (5) Akses hibah, seed funding, fasilitas lab, ruang coworking.',
    },
    {
      q: 'Apakah ada biaya keanggotaan?',
      a: 'Tidak ada biaya bulanan/tahunan. Operasional difasilitasi hibah LPPM, sponsorship, & dana internal. Biaya yang mungkin: transport ke lokasi PKM-M/KKN (bisa reimburse), kontribusi sukarela merch/acara besar (hoodie, retreat), printing proposal (bisa digital). Transparansi keuangan: laporan bulanan di Notion anggota.',
    },
    {
      q: 'Apakah kegiatan PKM Center bentrok dengan kuliah/kerja part-time?',
      a: 'Kami desain jadwal hybrid: pertemuan divisi malam (19:00-21:00) atau weekend. Recording tersedia. Masa UTS/UAS: kegiatan dikurangi/berhenti 2 minggu. Banyak anggota yang kerja part-time/freelance — time management jadi skill yang dilatih. Jika benar-benar bentrok parah, diskusikan dengan Divisi Head untuk penyesuaian tugas.',
    },
  ],
  technical: [
    {
      q: 'Bagaimana cara mengakses materi & resources PKM Center?',
      a: 'Setelah onboarding, dapat akses: Notion Workspace (materi, template, SOP, arsip), Google Drive (dataset, referensi, branding kit), Discord Server (komunikasi harian, voice channel, announcement), GitHub Organization (code, template LaTeX, tools). Semua link dikirim via email & WA grup batch.',
    },
    {
      q: 'Apakah PKM Center menyediakan dana untuk proyek anggota?',
      a: 'Ya. Skema: (1) Seed Funding Internal: Rp 500rb-2jt/proyek (pitch ke DPH), (2) Hibah LPPM PKM: Rp 5-10jt (bantuan penulisan proposal oleh R&D), (3) Sponsorship Industri: variabel (via PartSpons), (4) Dana Kompetisi: biaya transport/akomodasi finalis KBMI/Gemastik (bantuan OpsLog). Semua proposal dana lewat review keuangan & DPH.',
    },
    {
      q: 'Bagaimana sistem sertifikat & penghargaan?',
      a: 'Sertifikat diberikan untuk: (1) Keaktifan ≥80% + 1 proyek selesai (per semester), (2) Juara kompetisi (nasional/internasional), (3) Publikasi jurnal (Scopus/Sinta), (4) Panitia acara besar, (5) Kepengurusan DPH/Divisi Head. Semua sertifikat digital (QR verified) & cetak, dikeluarkan LPPM & PKM Center. Valid untuk SKPI & portofolio karir.',
    },
    {
      q: 'Apakah alumni tetap terhubung setelah lulus/keluar?',
      a: 'Ya, sistem alumni kuat: (1) Grup alumni WhatsApp/LinkedIn (200+), (2) Alumni jadi mentor junior (buddy system), (3) Alumni sharing session bulanan (karir, riset, startup), (4) Alumni referral kerja/studi lanjut, (5) Reunion tahunan (Homecoming). Banyak alumni jadi dosen, researcher, founder startup, engineer di big tech — jaringan sangat berharga.',
    },
  ],
}

type FAQCategory = keyof typeof faqData

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>('general')
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Build accordion key
  const getAccordionKey = (category: FAQCategory, index: number) => `${category}-${index}`

  // Filter FAQs based on search
  const filteredFAQs = faqData[activeCategory].filter((faq) =>
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <section id="faq" className="py-20 sm:py-28 lg:py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Pertanyaan yang Sering <span className="text-indigo-600">Diajukan</span>
          </h2>
          <p className="text-lg text-slate-600">
            Semua yang perlu kamu tahu sebelum & sesudah mendaftar PKM Center Open Recruitment 2025.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-10 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-4" role="tablist" aria-label="Kategori FAQ">
            {faqCategories.map((cat) => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={activeCategory === cat.id}
                aria-controls={`panel-${cat.id}`}
                id={`tab-${cat.id}`}
                onClick={() => {
                  setActiveCategory(cat.id)
                  setActiveAccordion(null)
                  setSearchQuery('')
                }}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200',
                  activeCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-100'
                )}
              >
                <cat.icon className="h-4 w-4" aria-hidden="true" />
                {cat.label}
                <span className={clsx(
                  'px-2 py-0.5 text-xs font-medium rounded-full',
                  activeCategory === cat.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500'
                )}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              placeholder="Cari pertanyaan... (misal: wawancara, biaya, divisi)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder:text-slate-400"
              aria-label="Cari FAQ"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Hapus pencarian"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* FAQ Accordions */}
        <div id={`panel-${activeCategory}`} role="tabpanel" aria-labelledby={`tab-${activeCategory}`} className="max-w-3xl mx-auto space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" aria-hidden="true" />
              <p className="text-slate-500">Tidak ada pertanyaan yang cocok dengan pencarian "<span className="font-medium text-slate-700">{searchQuery}</span>"</p>
              <p className="text-sm text-slate-400 mt-1">Coba kata kunci lain atau pilih kategori berbeda.</p>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => {
              const originalIndex = faqData[activeCategory].findIndex(f => f.q === faq.q)
              const key = getAccordionKey(activeCategory, originalIndex)
              const isOpen = activeAccordion === key

              return (
                <details
                  key={key}
                  className={clsx(
                    'group bg-white rounded-2xl border overflow-hidden transition-all duration-300',
                    isOpen ? 'border-indigo-200 shadow-lg' : 'border-slate-100 hover:border-slate-200'
                  )}
                  open={isOpen}
                  onToggle={() => setActiveAccordion(isOpen ? null : key)}
                >
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none select-none">
                    <h3 className="font-semibold text-slate-900 pr-10 text-balance">{faq.q}</h3>
                    <ChevronDown className={clsx('h-5 w-5 text-slate-400 transition-transform flex-shrink-0', 'group-open:rotate-180')} aria-hidden="true" />
                  </summary>
                  <div className="px-6 pb-6 pt-0 text-slate-600 leading-relaxed animate-fade-in-up">
                    {faq.a}
                  </div>
                </details>
              )
            })
          )}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 p-4 rounded-2xl bg-indigo-50 border border-indigo-100 mb-6">
            <Mail className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            <div className="text-left">
              <p className="font-medium text-indigo-900">Masih ada pertanyaan?</p>
              <p className="text-sm text-indigo-700">Tim rekrutmen siap bantu. Email: <a href="mailto:rekrutmen@pkmcenter.id" className="underline hover:text-indigo-600">rekrutmen@pkmcenter.id</a> | WA: <a href="https://wa.me/6281234567890" className="underline hover:text-indigo-600">+62 812-3456-7890</a></p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/daftar"
              className="px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25 hover:scale-[1.02]"
            >
              Daftar Sekarang
              <ArrowRight className="h-5 w-5 ml-2 inline" aria-hidden="true" />
            </Link>
            <Link
              href="/info-organisasi"
              className="px-8 py-4 rounded-xl font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              Baca Info Organisasi
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}