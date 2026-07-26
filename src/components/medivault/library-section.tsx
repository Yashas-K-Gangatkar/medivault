'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSounds } from '@/hooks/use-sounds'
import { MarkdownContent } from '@/components/markdown'

interface Discipline {
  id: string
  slug: string
  name: string
  description: string
  coverImage: string | null
  books: Book[]
  _count?: { topics: number; cases: number }
}

interface Book {
  id: string
  slug: string
  title: string
  author: string
  year: string
  license: string
  licenseUrl: string | null
  sourceUrl: string
  description: string
  coverImage: string | null
}

interface Topic {
  id: string
  slug: string
  title: string
  tldr: string
  overview: string
  fullExplanation: string
  deepDive: string | null
  heroImage: string | null
  tags: string[]
  relatedTopicSlugs: string[]
  book: { title: string; slug: string; license: string } | null
  discipline: { name: string; slug: string } | null
}

export function LibrarySection({ userId, onProgress }: { userId?: string; onProgress?: (itemType: string, itemId: string, status: string, score?: number) => void }) {
  const [view, setView] = useState<'disciplines' | 'discipline' | 'book' | 'topic'>('disciplines')
  const [disciplines, setDisciplines] = useState<Discipline[]>([])
  const [currentDiscipline, setCurrentDiscipline] = useState<Discipline | null>(null)
  const [currentBook, setCurrentBook] = useState<Book | null>(null)
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null)
  const [deepDiveOn, setDeepDiveOn] = useState(false)
  const [loading, setLoading] = useState(true)
  const sounds = useSounds()

  const loadDiscipline = useCallback(async (slug: string) => {
    setLoading(true)
    sounds.scan()
    const res = await fetch(`/api/library?discipline=${slug}`)
    const data = await res.json()
    if (data.ok) {
      setCurrentDiscipline(data.discipline)
      setView('discipline')
    }
    setLoading(false)
  }, [sounds])

  const loadBook = useCallback(async (slug: string) => {
    setLoading(true)
    sounds.scan()
    const res = await fetch(`/api/library?book=${slug}`)
    const data = await res.json()
    if (data.ok) {
      setCurrentBook(data.book)
      setView('book')
    }
    setLoading(false)
  }, [sounds])

  const loadTopic = useCallback(async (slug: string) => {
    setLoading(true)
    sounds.scan()
    const res = await fetch(`/api/library?topic=${slug}`)
    const data = await res.json()
    if (data.ok) {
      setCurrentTopic(data.topic)
      setDeepDiveOn(false)
      setView('topic')
    }
    setLoading(false)
  }, [sounds])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      const res = await fetch('/api/library')
      const data = await res.json()
      if (!cancelled && data.ok) setDisciplines(data.disciplines)
      if (!cancelled) setLoading(false)
    }
    run()
    return () => { cancelled = true }
  }, [])

  // record progress when topic opened
  useEffect(() => {
    if (currentTopic && userId && onProgress) {
      onProgress('TOPIC', currentTopic.slug, 'STARTED')
    }
  }, [currentTopic, userId, onProgress])

  return (
    <section id="library" className="px-4 py-20 max-w-7xl mx-auto">
      <SectionHeader
        eyebrow="The Library"
        title="Open-Source Medical Knowledge"
        subtitle="Every book here is openly licensed or in the public domain. No paywalls, no piracy — just legally free, peer-reviewed knowledge for every clinician."
      />

      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="font-mono text-cyan-300 text-sm tracking-widest animate-pulse">LOADING VAULT...</div>
        </div>
      )}

      {!loading && view === 'disciplines' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {disciplines.map((d, i) => (
            <button
              key={d.slug}
              onClick={() => {
                sounds.beep(660, 80)
                loadDiscipline(d.slug)
              }}
              className="glass scan-card rounded-2xl overflow-hidden text-left group hover:glow-border transition-all fade-in"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="aspect-[16/10] relative overflow-hidden">
                {d.coverImage && (
                  <img
                    src={d.coverImage}
                    alt={d.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-transparent" />
                <div className="absolute top-3 right-3 px-2 py-1 rounded glass text-[10px] font-mono uppercase tracking-wider text-cyan-300">
                  {d._count?.topics ?? 0} topics · {d._count?.cases ?? 0} cases
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display font-semibold text-lg text-fg mb-1 group-hover:text-cyan-300 transition-colors">{d.name}</h3>
                <p className="text-sm text-fg-muted line-clamp-2 leading-relaxed">{d.description}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-fg-muted">
                  <span className="font-mono">{d.books.length} open books</span>
                  <span>→</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {!loading && view === 'discipline' && currentDiscipline && (
        <div className="mt-10 fade-in">
          <BackButton onClick={() => { sounds.beep(440, 60); setView('disciplines'); setCurrentDiscipline(null) }} label="← All disciplines" />
          <DisciplineHeader discipline={currentDiscipline} />
          <h3 className="font-display text-sm uppercase tracking-widest text-cyan-300 mt-10 mb-4">Open Books & References</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentDiscipline.books.map((b, i) => (
              <button
                key={b.slug}
                onClick={() => loadBook(b.slug)}
                className="glass scan-card rounded-xl p-5 text-left group hover:glow-border transition-all fade-in"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="flex gap-4">
                  <div className="w-16 h-20 rounded shrink-0 overflow-hidden glass">
                    {b.coverImage && <img src={b.coverImage} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-semibold text-fg group-hover:text-cyan-300 transition-colors line-clamp-1">{b.title}</div>
                    <div className="text-xs text-fg-muted mt-0.5">{b.author}</div>
                    <div className="text-[10px] font-mono text-[var(--color-bio)] mt-1 uppercase tracking-wider">{b.license}</div>
                    <p className="text-xs text-fg-soft mt-2 line-clamp-2">{b.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {currentDiscipline.topics && currentDiscipline.topics.length > 0 && (
            <>
              <h3 className="font-display text-sm uppercase tracking-widest text-cyan-300 mt-10 mb-4">Clinical Topics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentDiscipline.topics.map((t, i) => (
                  <button
                    key={t.slug}
                    onClick={() => loadTopic(t.slug)}
                    className="glass scan-card rounded-lg p-4 text-left group hover:glow-border transition-all fade-in"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="font-display font-semibold text-fg group-hover:text-cyan-300 transition-colors">{t.title}</div>
                    <div className="text-xs text-fg-muted mt-1 line-clamp-2">{t.tldr}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {!loading && view === 'book' && currentBook && (
        <div className="mt-10 fade-in">
          <BackButton onClick={() => { sounds.beep(440, 60); setView('discipline'); setCurrentBook(null) }} label={`← Back to ${currentDiscipline?.name ?? 'discipline'}`} />
          <div className="glass rounded-2xl p-6 md:p-8 mt-4">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 aspect-[3/4] rounded-xl overflow-hidden glass shrink-0">
                {currentBook.coverImage && <img src={currentBook.coverImage} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-2xl md:text-3xl text-fg mb-2">{currentBook.title}</h2>
                <p className="text-fg-soft">by {currentBook.author}</p>
                <p className="text-xs font-mono text-fg-muted mt-1">{currentBook.year}</p>
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <span className="px-2 py-1 rounded glass text-[10px] font-mono uppercase tracking-wider text-[var(--color-bio)]">
                    ✓ {currentBook.license}
                  </span>
                  <a
                    href={currentBook.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 rounded glass text-[10px] font-mono uppercase tracking-wider text-cyan-300 hover:glow-border"
                  >
                    Source ↗
                  </a>
                  {currentBook.licenseUrl && (
                    <a
                      href={currentBook.licenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 rounded glass text-[10px] font-mono uppercase tracking-wider text-fg-muted hover:text-cyan-300"
                    >
                      License ↗
                    </a>
                  )}
                </div>
                <p className="text-sm text-fg-soft mt-4 leading-relaxed">{currentBook.description}</p>
              </div>
            </div>
            {/* Book "reader" — placeholder topics list */}
            <div className="mt-8 border-t border-[var(--color-border)] pt-6">
              <h3 className="font-display text-sm uppercase tracking-widest text-cyan-300 mb-4">Topics in this Book</h3>
              {currentBook && (currentBook as any).topics && (currentBook as any).topics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(currentBook as any).topics.map((t: any) => (
                    <button
                      key={t.slug}
                      onClick={() => loadTopic(t.slug)}
                      className="glass rounded-lg p-4 text-left hover:glow-border transition-all"
                    >
                      <div className="font-display font-semibold text-fg hover:text-cyan-300 transition-colors">{t.title}</div>
                      <div className="text-xs text-fg-muted mt-1 line-clamp-2">{t.tldr}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-fg-muted italic">
                  Topics from this reference are integrated into discipline pages above. Visit the source link to read the original text in full.
                </div>
              )}
              {userId && onProgress && (
                <button
                  onClick={() => {
                    sounds.chime()
                    onProgress('BOOK', currentBook.slug, 'COMPLETED')
                  }}
                  className="mt-6 px-5 py-2.5 rounded-lg font-display text-xs uppercase tracking-widest text-bg font-semibold"
                  style={{ background: 'linear-gradient(135deg, #00e8ff 0%, #6cff9c 100%)', boxShadow: '0 0 20px rgba(0, 232, 255, 0.3)' }}
                >
                  Mark as Read +75 XP
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {!loading && view === 'topic' && currentTopic && (
        <div className="mt-10 fade-in">
          <BackButton onClick={() => { sounds.beep(440, 60); setView(currentBook ? 'book' : 'discipline'); setCurrentTopic(null) }} label="← Back" />

          {/* Topic hero */}
          <div className="relative rounded-2xl overflow-hidden mt-4 h-56 md:h-72">
            {currentTopic.heroImage && (
              <img src={currentTopic.heroImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/40 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-end p-6">
              {currentTopic.discipline && (
                <div className="text-xs font-mono uppercase tracking-widest text-cyan-300 mb-2">
                  {currentTopic.discipline.name}
                </div>
              )}
              <h2 className="font-display text-3xl md:text-4xl font-bold text-fg">{currentTopic.title}</h2>
            </div>
          </div>

          {/* Depth controls */}
          <div className="mt-6 flex items-center justify-between flex-wrap gap-3 glass rounded-xl p-3">
            <div className="text-xs font-mono uppercase tracking-widest text-fg-muted">
              Depth Layers · 4 levels available
            </div>
            <button
              onClick={() => {
                setDeepDiveOn(!deepDiveOn)
                sounds.beep(deepDiveOn ? 440 : 880, 100)
                if (!deepDiveOn && userId && onProgress) {
                  onProgress('TOPIC', currentTopic.slug, 'MASTERED')
                  sounds.chime()
                }
              }}
              className={`px-4 py-2 rounded-lg font-display text-xs uppercase tracking-widest font-semibold transition-all ${
                deepDiveOn
                  ? 'text-bg'
                  : 'glass text-[var(--color-bio)] hover:glow-border'
              }`}
              style={deepDiveOn ? { background: 'linear-gradient(135deg, #6cff9c 0%, #00e8ff 100%)', boxShadow: '0 0 20px rgba(108, 255, 156, 0.3)' } : {}}
            >
              {deepDiveOn ? '◆ Deep Dive Active' : '◇ Go Deep'}
            </button>
          </div>

          {/* Layered content */}
          <div className="mt-6 space-y-6">
            {/* TL;DR */}
            <div className="glass rounded-xl p-5 fade-in">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300">Layer 1 · TL;DR</span>
                <span className="h-px flex-1 bg-[var(--color-border)]" />
              </div>
              <p className="text-fg leading-relaxed">{currentTopic.tldr}</p>
            </div>

            {/* Overview */}
            <div className="glass rounded-xl p-5 fade-in fade-in-delay-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300">Layer 2 · Overview</span>
                <span className="h-px flex-1 bg-[var(--color-border)]" />
              </div>
              <p className="text-fg-soft leading-relaxed">{currentTopic.overview}</p>
            </div>

            {/* Full explanation */}
            <div className="glass rounded-xl p-5 fade-in fade-in-delay-2">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300">Layer 3 · Full Explanation</span>
                <span className="h-px flex-1 bg-[var(--color-border)]" />
              </div>
              <MarkdownContent content={currentTopic.fullExplanation} />
            </div>

            {/* Deep dive — gated */}
            {deepDiveOn && currentTopic.deepDive && (
              <div className="glass-strong rounded-xl p-5 fade-in glow-border">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-bio)] glow-bio">Layer 4 · Deep Dive</span>
                  <span className="h-px flex-1 bg-[var(--color-border)]" />
                </div>
                <MarkdownContent content={currentTopic.deepDive} />
              </div>
            )}

            {/* Tags */}
            {currentTopic.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {currentTopic.tags.map((t, i) => (
                  <span key={i} className="px-3 py-1 rounded-full glass text-xs font-mono text-cyan-300">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Source reference */}
            {currentTopic.book && (
              <div className="glass rounded-xl p-4 flex items-center justify-between flex-wrap gap-2">
                <div className="text-xs text-fg-muted">
                  Source: <span className="text-fg-soft">{currentTopic.book.title}</span> · <span className="text-[var(--color-bio)] font-mono">{currentTopic.book.license}</span>
                </div>
                <a href={currentBook?.sourceUrl ?? '#'} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-300 hover:underline">
                  View original ↗
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 glass rounded-full text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-300">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
        {eyebrow}
      </div>
      <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 text-fg">{title}</h2>
      {subtitle && <p className="text-fg-soft leading-relaxed">{subtitle}</p>}
    </div>
  )
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="text-xs font-mono uppercase tracking-widest text-fg-muted hover:text-cyan-300 transition-colors">
      {label}
    </button>
  )
}

function DisciplineHeader({ discipline }: { discipline: Discipline }) {
  return (
    <div className="relative rounded-2xl overflow-hidden h-56 md:h-64 mt-4">
      {discipline.coverImage && (
        <img src={discipline.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/60 to-transparent" />
      <div className="relative z-10 h-full flex flex-col justify-end p-6">
        <h2 className="font-display text-3xl md:text-5xl font-bold text-fg mb-2">{discipline.name}</h2>
        <p className="text-fg-soft max-w-2xl">{discipline.description}</p>
      </div>
    </div>
  )
}
