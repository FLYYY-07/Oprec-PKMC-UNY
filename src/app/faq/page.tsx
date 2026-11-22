import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FAQ from '@/components/FAQ'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Pertanyaan yang sering diajukan seputar Open Recruitment PKM Center 2025: syarat, proses seleksi, divisi, jadwal, dan keuntungan bergabung.',
  openGraph: {
    title: 'FAQ - PKM Center Open Recruitment 2025',
    description: 'Pertanyaan yang sering diajukan seputar Open Recruitment PKM Center 2025.',
    type: 'website',
  },
}

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <FAQ />
      </main>
      <Footer />
    </>
  )
}