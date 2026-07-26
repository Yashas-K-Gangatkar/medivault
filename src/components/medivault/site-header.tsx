'use client'

import { useEffect, useState } from 'react'
import { useSounds } from '@/hooks/use-sounds'
import { RANK_INFO, type MedivaultUser } from '@/hooks/use-identity'

interface NavLink {
  id: string
  label: string
}

const LINKS: NavLink[] = [
  { id: 'top', label: 'Home' },
  { id: 'library', label: 'Library' },
  { id: 'cases', label: 'Cases' },
  { id: 'atlas', label: 'Atlas' },
  { id: 'progress', label: 'Progress' },
  { id: 'chat', label: 'Chat' },
  { id: 'mission', label: 'Mission' },
]

export function SiteHeader({ user, onNav }: { user: MedivaultUser | null; onNav: (id: string) => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const sounds = useSounds()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = (id: string) => {
    sounds.beep(660, 60)
    setMobileOpen(false)
    onNav(id)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)]' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => handleClick('top')} className="flex items-center gap-2 group">
          <div className="relative w-7 h-7">
            <div className="absolute inset-0 rounded-full border border-cyan-400/40" />
            <div className="absolute inset-1 rounded-full border border-[var(--color-bio)]/40" />
            <div className="absolute inset-0 flex items-center justify-center font-display font-bold text-cyan-300 text-xs">M</div>
            <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping" style={{ animationDuration: '3s' }} />
          </div>
          <span className="font-display font-bold text-fg tracking-wider text-sm group-hover:text-cyan-300 transition-colors">
            MEDIVAULT
          </span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map(l => (
            <button
              key={l.id}
              onClick={() => handleClick(l.id)}
              className="px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-fg-muted hover:text-cyan-300 transition-colors"
            >
              {l.label}
            </button>
          ))}
        </nav>

        {/* User badge */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <button
              onClick={() => handleClick('progress')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs"
            >
              <span className="font-mono text-cyan-300">{user.publicId}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: RANK_INFO[user.rank].color }}>
                {RANK_INFO[user.rank].icon}
              </span>
              <span className="font-mono text-[10px] text-[var(--color-bio)]">{user.xp} XP</span>
            </button>
          ) : (
            <div className="font-mono text-xs text-fg-muted">loading...</div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => { sounds.beep(440, 60); setMobileOpen(!mobileOpen) }}
          className="md:hidden flex flex-col gap-1 p-2"
          aria-label="menu"
        >
          <span className={`w-5 h-px bg-cyan-300 transition-transform ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <span className={`w-5 h-px bg-cyan-300 transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`w-5 h-px bg-cyan-300 transition-transform ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-md">
          {LINKS.map(l => (
            <button
              key={l.id}
              onClick={() => handleClick(l.id)}
              className="block w-full text-left px-4 py-3 text-sm font-mono uppercase tracking-widest text-fg-muted hover:text-cyan-300 border-b border-[var(--color-border)] last:border-0"
            >
              {l.label}
            </button>
          ))}
          {user && (
            <div className="px-4 py-3 text-xs font-mono">
              <div className="text-cyan-300">{user.publicId}</div>
              <div className="text-fg-muted">{user.xp} XP · {RANK_INFO[user.rank].label}</div>
            </div>
          )}
        </nav>
      )}
    </header>
  )
}
