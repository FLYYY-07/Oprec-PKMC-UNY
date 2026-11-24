import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import About from '@/components/About'
import Divisions from '@/components/Divisions'
import BoardSection from '@/components/BoardSection'
import FAQ from '@/components/FAQ'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <About />
        <BoardSection />
        <Divisions />
        <FAQ />

        {/* Closing Call to Action Banner */}
        <section className="relative overflow-hidden py-20 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Pendaftaran Batch 2025 Terbuka</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Siap Mengukir Prestasi Bersama <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-200 via-white to-indigo-200 bg-clip-text text-transparent">
                PKM Center UNY?
              </span>
            </h2>
            
            <p className="text-lg text-indigo-100/90 max-w-2xl mx-auto mb-8">
              Bimbingan intensif dari mentor berprestasi, fasilitas riset terpadu, dan jaringan mahasiswa inovator menantimu.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-10 text-sm text-indigo-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Kuota Terbatas
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Terbuka Semua Jurusan
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 100% Gratis
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-base bg-white text-indigo-900 hover:bg-indigo-50 shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Daftar Sekarang
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/info-organisasi"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-base bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all"
              >
                Pelajari Profil Organisasi
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
