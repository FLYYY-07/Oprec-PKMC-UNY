import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import RegistrationForm from '@/components/RegistrationForm'

export const metadata: Metadata = {
  title: 'Form Pendaftaran',
  description: 'Daftar jadi anggota PKM Center 2025. Isi formulir pendaftaran online - cepat, aman, dan terverifikasi. Open Recruitment batch terbesar tahun ini.',
  openGraph: {
    title: 'Form Pendaftaran - PKM Center Open Recruitment 2025',
    description: 'Daftar jadi anggota PKM Center 2025. Isi formulir pendaftaran online - cepat, aman, dan terverifikasi.',
    type: 'website',
  },
}

export default function DaftarPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <RegistrationForm />
      </main>
      <Footer />
    </>
  )
}