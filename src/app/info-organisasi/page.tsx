import { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InfoOrganisasi from '@/components/InfoOrganisasi'

export const metadata: Metadata = {
  title: 'Info Organisasi',
  description: 'Struktur organisasi, visi misa, sejarah, prestasi, dan nilai-nilai PKM Center. Kenali kami lebih dekat sebelum bergabung.',
  openGraph: {
    title: 'Info Organisasi - PKM Center',
    description: 'Struktur organisasi, visi misi, sejarah, prestasi, dan nilai-nilai PKM Center.',
    type: 'website',
  },
}

export default function InfoOrganisasiPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <InfoOrganisasi />
      </main>
      <Footer />
    </>
  )
}