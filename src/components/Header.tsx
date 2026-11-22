'use client'

import Link from 'next/link'
import { Menu, X, Shield, BookOpen, Users, Lightbulb } from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'

const navItems = [
  { href: '#features', label: 'Program' },
  { href: '#about', label: 'Tentang Kami' },
  { href: '#divisions', label: 'Divisi' },
  { href: '/login', label: 'Daftar', primary: true },
]

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => setScrolled(window.scrollY > 20), { passive: true })
  }

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-slate-900 hover:opacity-80 transition-opacity" aria-label="PKM Center Home">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600">
              <Shield className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">PKM Center</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'text-sm font-medium transition-colors relative',
                  item.primary
                    ? 'bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500'
                    : 'text-slate-600 hover:text-indigo-600 after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-indigo-500 after:transition-all hover:after:w-full'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={clsx('md:hidden overflow-hidden transition-all duration-300 ease-in-out', mobileMenuOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0')}
        >
          <div className="flex flex-col gap-4 pt-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'text-base font-medium px-2 py-2 rounded-lg transition-colors',
                  item.primary
                    ? 'bg-indigo-600 text-white text-center'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}