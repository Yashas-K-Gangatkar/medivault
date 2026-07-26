'use client'

import { useEffect, useState } from 'react'
import { useSounds } from '@/hooks/use-sounds'

interface Stats {
  disciplines: number
  books: number
  topics: number
  cases: number
  users: number
  messages: number
  totalCasesSolved: number
  totalXp: number
}

export function HeroSection({ onEnter }: { onEnter: () => void }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const sounds = useSounds()

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => {
        if (d.ok) setStats(d.stats)
      })
      .catch(() => {})
  }, [])

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-4 py-20">
      {/* Rotating holographic body */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
        <div className="relative w-[600px] h-[600px] max-w-[80vw] max-h-[80vw]">
          <img
            src="/medivault/hero-body.png"
            alt=""
            className="w-full h-full object-contain opacity-50 holo-rotate"
            style={{ filter: 'drop-shadow(0 0 40px rgba(0, 232, 255, 0.5))' }}
          />
          {/* Concentric glowing rings */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping" style={{ animationDuration: '4s' }} />
          <div className="absolute inset-8 rounded-full border border-teal-500/15 animate-ping" style={{ animationDuration: '6s' }} />
          <div className="absolute inset-16 rounded-full border border-cyan-500/10 animate-ping" style={{ animationDuration: '8s' }} />
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Top tag */}
        <div className="fade-in inline-flex items-center gap-2 px-4 py-1.5 mb-8 glass rounded-full text-xs font-mono uppercase tracking-[0.2em] text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-[var(--color-bio)] pulse-bio" style={{ color: 'var(--color-bio)' }} />
          open-source medical education
        </div>

        <h1 className="fade-in fade-in-delay-1 font-[family-name:var(--font-display)] text-5xl md:text-7xl font-bold tracking-tight mb-6">
          <span className="text-gradient-cyan">MEDIVAULT</span>
        </h1>

        <p className="fade-in fade-in-delay-2 text-lg md:text-2xl text-fg-soft max-w-3xl mx-auto mb-4 leading-relaxed">
          A futuristic library and clinical academy — for every doctor and student on Earth.
        </p>
        <p className="fade-in fade-in-delay-3 text-sm md:text-base text-fg-muted max-w-2xl mx-auto mb-10">
          Browse openly licensed medical textbooks. Dive deep into clinical topics. Solve real patient cases.
          Earn ranks. Teach and learn from a global community. <span className="text-cyan-300">No login. No paywalls. Forever free.</span>
        </p>

        <div className="fade-in fade-in-delay-4 flex flex-wrap items-center justify-center gap-4 mb-16">
          <button
            onClick={() => {
              sounds.beep(660, 100)
              onEnter()
            }}
            className="group relative px-8 py-4 rounded-lg font-display font-semibold tracking-wider text-bg uppercase text-sm overflow-hidden transition-transform hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #00e8ff 0%, #6cff9c 100%)',
              boxShadow: '0 0 30px rgba(0, 232, 255, 0.4), 0 0 60px rgba(0, 232, 255, 0.2)',
            }}
          >
            <span className="relative z-10">Enter the Vault</span>
            <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
          </button>
          <a
            href="#mission"
            onClick={() => sounds.beep(440, 80)}
            className="px-8 py-4 rounded-lg font-display font-semibold tracking-wider uppercase text-sm glass text-cyan-300 hover:glow-border transition-all"
          >
            Our Pledge
          </a>
        </div>

        {/* Live stats counter */}
        <div className="fade-in fade-in-delay-5 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          <StatCard label="Disciplines" value={stats?.disciplines ?? '—'} />
          <StatCard label="Open Books" value={stats?.books ?? '—'} />
          <StatCard label="Clinical Cases" value={stats?.cases ?? '—'} />
          <StatCard label="Cases Solved Globally" value={stats?.totalCasesSolved ?? '—'} accent="bio" />
        </div>
      </div>

      {/* Scan-line accent at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
    </section>
  )
}

function StatCard({ label, value, accent = 'cyan' }: { label: string; value: number | string; accent?: 'cyan' | 'bio' }) {
  return (
    <div className="glass rounded-xl p-4 text-center scan-card">
      <div
        className={`font-[family-name:var(--font-mono)] text-2xl md:text-3xl font-bold mb-1 ${accent === 'bio' ? 'text-[var(--color-bio)] glow-bio' : 'text-cyan-300 glow-cyan'}`}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-widest text-fg-muted font-mono">{label}</div>
    </div>
  )
}
