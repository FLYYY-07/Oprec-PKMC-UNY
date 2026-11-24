'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Users, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import { supabase } from '@/lib/supabase'

interface BoardMember {
  id: string
  name: string
  position: string
  division: string
  period: string
  quote?: string | null
  photo_url?: string | null
  display_order: number
}

const FILTER_TABS = [
  'Semua',
  'Pengurus Inti',
  'Tim System',
  'Data',
  'Design',
  'Public Relation',
] as const

const DIVISION_BADGE_STYLES: Record<string, string> = {
  'Pengurus Inti': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Tim System': 'bg-blue-100 text-blue-800 border-blue-200',
  Data: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Design: 'bg-purple-100 text-purple-800 border-purple-200',
  'Public Relation': 'bg-amber-100 text-amber-800 border-amber-200',
}

export default function BoardSection() {
  const [members, setMembers] = useState<BoardMember[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<string>('Semua')
  const [isDesktop, setIsDesktop] = useState(true)

  const sliderRef = useRef<HTMLDivElement | null>(null)
  const isJumpingRef = useRef(false)
  const scrollSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Track viewport breakpoint (md = 768px) for adaptive loop threshold
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Fetch board members from Supabase
  useEffect(() => {
    let isMounted = true

    async function fetchBoardMembers() {
      try {
        const { data, error } = await supabase
          .from('board_members')
          .select('id, name, position, division, period, quote, photo_url, display_order')
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: true })

        if (!error && data && isMounted) {
          setMembers(data as BoardMember[])
        }
      } catch (err) {
        console.error('Failed to load board members on landing page:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchBoardMembers()

    return () => {
      isMounted = false
    }
  }, [])

  const filteredMembers =
    activeFilter === 'Semua'
      ? members
      : members.filter((m) => m.division === activeFilter)

  // Adaptive loop mode:
  // - Desktop: loop only if > 3 cards; <= 3 cards -> static centered without clones or arrows
  // - Mobile: loop if > 1 card; <= 1 card -> static centered without clones or arrows
  const isLoopEnabled = isDesktop ? filteredMembers.length > 3 : filteredMembers.length > 1
  const itemCount = filteredMembers.length

  // Measure single-set pixel width & single-card step accurately from DOM
  const getTrackMetrics = useCallback(() => {
    const el = sliderRef.current
    if (!el || !isLoopEnabled || itemCount === 0) {
      return { setWidth: 0, cardStep: 304 }
    }
    const children = el.children
    if (children.length < itemCount * 2) {
      return { setWidth: 0, cardStep: 304 }
    }
    const firstA = children[0] as HTMLElement
    const secondA = children[1] as HTMLElement | undefined
    const firstB = children[itemCount] as HTMLElement
    const setWidth = firstB.offsetLeft - firstA.offsetLeft
    const cardStep = secondA ? secondA.offsetLeft - firstA.offsetLeft : 304
    return { setWidth, cardStep }
  }, [isLoopEnabled, itemCount])

  // Silently teleport scrollLeft without visual flicker or smooth transition
  const silentJump = useCallback((targetScrollLeft: number) => {
    const el = sliderRef.current
    if (!el) return
    isJumpingRef.current = true
    const prevBehavior = el.style.scrollBehavior
    const prevSnap = el.style.scrollSnapType
    el.style.scrollBehavior = 'auto'
    el.style.scrollSnapType = 'none'
    el.scrollLeft = targetScrollLeft
    // Force reflow so the instant jump commits before restoring styles
    void el.offsetWidth
    el.style.scrollBehavior = prevBehavior
    el.style.scrollSnapType = prevSnap
    requestAnimationFrame(() => {
      isJumpingRef.current = false
    })
  }, [])

  // Keep scroll position inside the middle cloned set (Set B) seamlessly
  const normalizeLoopPosition = useCallback(() => {
    const el = sliderRef.current
    if (!el || !isLoopEnabled || isJumpingRef.current) return

    const { setWidth } = getTrackMetrics()
    if (setWidth <= 0) return

    if (el.scrollLeft < setWidth * 0.5) {
      silentJump(el.scrollLeft + setWidth)
    } else if (el.scrollLeft >= setWidth * 1.5) {
      silentJump(el.scrollLeft - setWidth)
    }
  }, [isLoopEnabled, getTrackMetrics, silentJump])

  // Reset active position back to item #1 (start of middle Set B) whenever filter or loop mode changes
  useEffect(() => {
    if (!isLoopEnabled) return
    const frameId = requestAnimationFrame(() => {
      const { setWidth } = getTrackMetrics()
      if (setWidth > 0) {
        silentJump(setWidth)
      }
    })
    return () => cancelAnimationFrame(frameId)
  }, [activeFilter, isLoopEnabled, itemCount, getTrackMetrics, silentJump])

  // Re-normalize on window resize
  useEffect(() => {
    if (!isLoopEnabled) return
    const handleResize = () => {
      const { setWidth } = getTrackMetrics()
      if (setWidth > 0) {
        silentJump(setWidth)
      }
    }
    window.addEventListener('resize', handleResize, { passive: true })
    return () => window.removeEventListener('resize', handleResize)
  }, [isLoopEnabled, getTrackMetrics, silentJump])

  // Cleanup settle timer on unmount
  useEffect(() => {
    return () => {
      if (scrollSettleTimerRef.current) {
        clearTimeout(scrollSettleTimerRef.current)
      }
    }
  }, [])

  const handleScroll = () => {
    if (!isLoopEnabled || isJumpingRef.current) return
    const el = sliderRef.current
    if (!el) return

    const { setWidth, cardStep } = getTrackMetrics()
    if (setWidth <= 0) return

    // Immediate wrap if user swipes very close to outer edges
    if (el.scrollLeft <= cardStep * 0.5) {
      silentJump(el.scrollLeft + setWidth)
      return
    }
    const maxScroll = el.scrollWidth - el.clientWidth
    if (maxScroll > 0 && el.scrollLeft >= maxScroll - cardStep * 0.5) {
      silentJump(el.scrollLeft - setWidth)
      return
    }

    // Debounced recenter into Set B after smooth scroll / touch momentum settles
    if (scrollSettleTimerRef.current) {
      clearTimeout(scrollSettleTimerRef.current)
    }
    scrollSettleTimerRef.current = setTimeout(() => {
      normalizeLoopPosition()
    }, 180)
  }

  const handleSlide = (direction: 'left' | 'right') => {
    const el = sliderRef.current
    if (!el || !isLoopEnabled) return

    const { setWidth, cardStep } = getTrackMetrics()
    if (setWidth <= 0) return

    // Ensure enough runway before smooth scrolling on rapid clicks
    if (direction === 'left' && el.scrollLeft < setWidth * 0.6) {
      silentJump(el.scrollLeft + setWidth)
    } else if (direction === 'right' && el.scrollLeft > setWidth * 1.4) {
      silentJump(el.scrollLeft - setWidth)
    }

    el.scrollBy({
      left: direction === 'left' ? -cardStep : cardStep,
      behavior: 'smooth',
    })
  }

  // Sembunyikan section dengan rapi jika masih loading atau tabel masih kosong
  if (loading || members.length === 0) {
    return null
  }

  // Only clone 3x when infinite loop mode is active; otherwise render original items only
  const displayItems = isLoopEnabled
    ? [
        ...filteredMembers.map((m) => ({ member: m, cloneKey: `prev-${m.id}` })),
        ...filteredMembers.map((m) => ({ member: m, cloneKey: `main-${m.id}` })),
        ...filteredMembers.map((m) => ({ member: m, cloneKey: `next-${m.id}` })),
      ]
    : filteredMembers.map((m) => ({ member: m, cloneKey: `single-${m.id}` }))

  return (
    <section
      id="pengurus"
      className="py-20 sm:py-28 lg:py-32 bg-slate-50 border-t border-slate-100 scroll-mt-16"
      aria-labelledby="board-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-4">
            <Users className="h-4 w-4" />
            Struktur Kepengurusan
          </span>
          <h2 id="board-heading" className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Kenali <span className="text-indigo-600">Pengurus</span> PKM Center UNY
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            Tim kolaboratif di balik pendampingan riset, inovasi, dan prestasi mahasiswa UNY menuju PIMNAS.
          </p>
        </div>

        {/* Filter Tabs & Infinite Slider Controls Bar */}
        <div
          className={clsx(
            'flex flex-col md:flex-row md:items-center gap-4 mb-8',
            isLoopEnabled ? 'md:justify-between' : 'md:justify-center'
          )}
        >
          <div
            className={clsx(
              'flex flex-wrap items-center justify-center gap-2',
              isLoopEnabled && 'md:justify-start'
            )}
            role="tablist"
            aria-label="Filter divisi pengurus"
          >
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveFilter(tab)}
                  className={clsx(
                    'px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                  )}
                >
                  {tab}
                </button>
              )
            })}
          </div>

          {/* Always-Active Infinite Arrow Buttons (hidden when static centered) */}
          {isLoopEnabled && (
            <div className="flex items-center justify-center md:justify-end gap-2">
              <button
                type="button"
                onClick={() => handleSlide('left')}
                aria-label="Geser ke kiri"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white text-slate-700 border-slate-200 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 shadow-sm transition-all duration-200"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => handleSlide('right')}
                aria-label="Geser ke kanan"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white text-slate-700 border-slate-200 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 shadow-sm transition-all duration-200"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Carousel Track OR Static Centered Layout */}
        {filteredMembers.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-3xl border border-slate-200/80 max-w-lg mx-auto">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">
              Belum ada pengurus yang ditampilkan pada divisi {activeFilter}.
            </p>
          </div>
        ) : (
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            className={clsx(
              'flex gap-6 pb-4',
              isLoopEnabled
                ? 'flex-nowrap overflow-x-auto snap-x snap-proximity scroll-smooth justify-start [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
                : 'flex-wrap justify-center'
            )}
          >
            {displayItems.map(({ member, cloneKey }) => (
              <article
                key={cloneKey}
                className={clsx(
                  'shrink-0 w-[260px] sm:w-[280px] group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col',
                  isLoopEnabled && 'snap-center'
                )}
              >
                {/* Proportional Photo */}
                <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
                  {member.photo_url ? (
                    <img
                      src={member.photo_url}
                      alt={`${member.name} - ${member.position}`}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-5xl">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                  <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 text-slate-800 backdrop-blur-sm shadow-sm">
                    {member.period}
                  </span>
                </div>

                {/* Member Info & Optional Quote */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-2.5">
                    <span
                      className={clsx(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
                        DIVISION_BADGE_STYLES[member.division] ||
                          'bg-slate-100 text-slate-700 border-slate-200'
                      )}
                    >
                      {member.division}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-indigo-600 mt-0.5">
                    {member.position}
                  </p>

                  {member.quote && member.quote.trim() !== '' && (
                    <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-start gap-2 text-xs sm:text-sm text-slate-600">
                      <Quote className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <p className="italic leading-relaxed">"{member.quote}"</p>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
