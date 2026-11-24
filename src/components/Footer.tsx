'use client'

import Link from 'next/link'
import { Shield, Mail, MapPin, Phone, MessageSquare, Link2, Play, Gift, ArrowUpRight } from 'lucide-react'
import { clsx } from 'clsx'
import { useState, useEffect } from 'react'

const footerLinks = {
  program: [
    { label: 'Tim System', href: '#divisions' },
    { label: 'Data', href: '#divisions' },
    { label: 'Design', href: '#divisions' },
    { label: 'Public Relation', href: '#divisions' },
    { label: 'Pengurus Inti', href: '#divisions' },
  ],
  resources: [
    { label: 'Template Proposal', href: '#' },
    { label: 'Panduan Metodologi', href: '#' },
    { label: 'Arsip Proyek', href: '#' },
    { label: 'FAQ Rekrutmen', href: '#' },
    { label: 'Blog & Insight', href: '#' },
  ],
  about: [
    { label: 'Sejarah & Visi', href: '#about' },
    { label: 'Struktur Organisasi', href: '#' },
    { label: 'Prestasi & Penghargaan', href: '#about' },
    { label: 'Mitra & Sponsor', href: '#' },
    { label: 'Hubungi Kami', href: '#contact' },
  ],
}

const socialLinks = [
  { icon: MessageSquare, href: 'https://instagram.com/pkmcenter', label: 'Instagram' },
  { icon: Link2, href: 'https://linkedin.com/company/pkmcenter', label: 'LinkedIn' },
  { icon: Play, href: 'https://youtube.com/@pkmcenter', label: 'YouTube' },
  { icon: Gift, href: 'https://github.com/pkmcenter', label: 'GitHub' },
]

export default function Footer() {
  const [currentYear, setCurrentYear] = useState<number>(2025)

  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
  }, [])

  return (
    <footer id="contact" className="bg-slate-950 text-slate-300" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2 xl:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-white mb-4" aria-label="PKM Center Home">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <Shield className="h-6 w-6" aria-hidden="true" />
              </div>
              <span className="font-bold text-xl tracking-tight">PKM Center</span>
            </Link>
            <p className="text-slate-400 text-sm mb-6 max-w-xs">
              Platform percepatan riset, pengabdian masyarakat, & kompetisi ilmiah untuk mahasiswa Indonesia.
            </p>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-indigo-600 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Program */}
          <nav aria-label="Program">
            <h3 className="font-semibold text-white mb-4">Program & Divisi</h3>
            <ul className="space-y-3">
              {footerLinks.program.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="Resources">
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* About */}
          <nav aria-label="About">
            <h3 className="font-semibold text-white mb-4">Tentang Kami</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Kontak</h3>
            <address className="not-italic space-y-3 text-sm">
              <a href="mailto:rekrutmen@pkmcenter.id" className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors">
                <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                rekrutmen@pkmcenter.id
              </a>
              <a href="tel:+6281234567890" className="flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors">
                <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                +62 812-3456-7890
              </a>
              <div className="flex items-start gap-2 text-slate-400">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>LPPM Building, 2nd Floor<br />Jl. Kampus Utama, Kota Universitas</span>
              </div>
            </address>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {currentYear} PKM Center. Hak cipta dilindungi.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="#" className="hover:text-indigo-400 transition-colors">Privasi</Link>
              <Link href="#" className="hover:text-indigo-400 transition-colors">Syarat Ketentuan</Link>
              <Link href="#" className="hover:text-indigo-400 transition-colors">Cookie</Link>
              <Link href="#" className="hover:text-indigo-400 transition-colors">Aksesibilitas</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}