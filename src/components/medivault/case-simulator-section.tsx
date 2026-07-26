'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSounds } from '@/hooks/use-sounds'
import { SectionHeader } from './library-section'

interface CaseSummary {
  slug: string
  title: string
  chiefComplaint: string
  specialty: string
  difficulty: string
  organSystem: string
  briefImage: string | null
  xpReward: number
  presentation: string
}

interface CaseDetail extends CaseSummary {
  id: string
  history: string
  exam: string
  orders: Array<{ name: string; turnaround: string; result: string; interpretation: string }>
  differentials: Array<{ diagnosis: string; isCorrect: boolean; explanation: string }>
  correctDiagnosis: string
  diagnosisExplanation: string
  teachingPoints: string
  redFlags: string | null
  xpReward: number
}

type Phase = 'list' | 'presentation' | 'history' | 'exam' | 'orders' | 'differential' | 'debrief'

export function CaseSimulatorSection({ userId, onProgress }: { userId?: string; onProgress?: (itemType: string, itemId: string, status: string, score?: number) => void }) {
  const [view, setView] = useState<'list' | 'case'>('list')
  const [cases, setCases] = useState<CaseSummary[]>([])
  const [activeCase, setActiveCase] = useState<CaseDetail | null>(null)
  const [phase, setPhase] = useState<Phase>('presentation')
  const [revealedOrders, setRevealedOrders] = useState<number[]>([])
  const [selectedDx, setSelectedDx] = useState<number | null>(null)
  const [filter, setFilter] = useState<{ specialty?: string; difficulty?: string }>({})
  const [loading, setLoading] = useState(true)
  const [scoreAwarded, setScoreAwarded] = useState(0)
  const sounds = useSounds()

  const loadCase = useCallback(async (slug: string) => {
    setLoading(true)
    sounds.scan()
    const res = await fetch(`/api/cases?slug=${slug}`)
    const data = await res.json()
    if (data.ok) {
      setActiveCase(data.case)
      setPhase('presentation')
      setRevealedOrders([])
      setSelectedDx(null)
      setScoreAwarded(0)
      setView('case')
    }
    setLoading(false)
  }, [sounds])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter.specialty) params.set('specialty', filter.specialty)
      if (filter.difficulty) params.set('difficulty', filter.difficulty)
      try {
        const res = await fetch(`/api/cases?${params.toString()}`)
        const data = await res.json()
        if (!cancelled && data.ok) setCases(data.cases)
      } catch {}
      if (!cancelled) setLoading(false)
    }
    run()
    return () => { cancelled = true }
  }, [filter])

  const revealOrder = (idx: number) => {
    if (revealedOrders.includes(idx)) return
    setRevealedOrders([...revealedOrders, idx])
    sounds.beep(660, 80)
  }

  const submitDiagnosis = (idx: number) => {
    setSelectedDx(idx)
    setPhase('debrief')
    sounds.chime()
    // calculate score: 100 if first-try correct, 60 if correct but not first, 30 if wrong
    const isCorrect = activeCase?.differentials[idx]?.isCorrect
    let score = 0
    if (isCorrect) score = 100
    else score = 30
    setScoreAwarded(score)
    if (userId && onProgress && activeCase) {
      onProgress('CASE', activeCase.slug, 'COMPLETED', score)
    }
  }

  const difficultyColor: Record<string, string> = {
    EASY: 'var(--color-bio)',
    MEDIUM: 'var(--color-amber)',
    HARD: 'var(--color-rose)',
  }

  return (
    <section id="cases" className="px-4 py-20 max-w-7xl mx-auto">
      <SectionHeader
        eyebrow="Case Simulator"
        title="Practice Real Clinical Reasoning"
        subtitle="Walk through patient encounters step-by-step: presentation → history → exam → orders → differential → diagnosis. Not a quiz — a flight simulator for clinicians."
      />

      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="font-mono text-cyan-300 text-sm tracking-widest animate-pulse">INITIALIZING CASES...</div>
        </div>
      )}

      {!loading && view === 'list' && (
        <>
          {/* Filters */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {['EASY', 'MEDIUM', 'HARD'].map(d => (
              <button
                key={d}
                onClick={() => {
                  setFilter({ ...filter, difficulty: filter.difficulty === d ? undefined : d })
                  sounds.beep(440, 60)
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${
                  filter.difficulty === d ? 'text-bg font-semibold' : 'glass text-fg-muted hover:text-cyan-300'
                }`}
                style={filter.difficulty === d ? { background: difficultyColor[d], boxShadow: `0 0 16px ${difficultyColor[d]}` } : {}}
              >
                {d}
              </button>
            ))}
            <span className="mx-2 text-fg-muted">|</span>
            {['Cardiology', 'Neurology', 'Pulmonology', 'Nephrology', 'Endocrinology', 'Gastroenterology'].map(s => (
              <button
                key={s}
                onClick={() => {
                  setFilter({ ...filter, specialty: filter.specialty === s ? undefined : s })
                  sounds.beep(440, 60)
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${
                  filter.specialty === s ? 'text-bg font-semibold bg-cyan-300' : 'glass text-fg-muted hover:text-cyan-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Case grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {cases.map((c, i) => (
              <button
                key={c.slug}
                onClick={() => loadCase(c.slug)}
                className="glass scan-card rounded-xl p-5 text-left group hover:glow-border transition-all fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden glass shrink-0">
                    {c.briefImage && <img src={c.briefImage} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest"
                        style={{ background: `${difficultyColor[c.difficulty]}22`, color: difficultyColor[c.difficulty] }}
                      >
                        {c.difficulty}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300">{c.specialty}</span>
                    </div>
                    <h3 className="font-display font-semibold text-fg group-hover:text-cyan-300 transition-colors leading-tight mb-1">{c.title}</h3>
                    <p className="text-xs text-fg-muted line-clamp-2">{c.chiefComplaint}</p>
                    <div className="mt-2 text-[10px] font-mono text-[var(--color-bio)]">+{c.xpReward} XP</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {!loading && view === 'case' && activeCase && (
        <div className="mt-8 fade-in">
          <button
            onClick={() => { sounds.beep(440, 60); setView('list') }}
            className="text-xs font-mono uppercase tracking-widest text-fg-muted hover:text-cyan-300 transition-colors"
          >
            ← All cases
          </button>

          {/* Phase indicator */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            {(['presentation', 'history', 'exam', 'orders', 'differential', 'debrief'] as Phase[]).map((p, i) => (
              <div key={p} className="flex items-center">
                <div
                  className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all ${
                    phase === p ? 'text-bg font-semibold bg-cyan-300' : phasesPassed(phase, p) ? 'glass text-[var(--color-bio)]' : 'glass text-fg-muted'
                  }`}
                >
                  {i + 1}. {p}
                </div>
                {i < 5 && <div className="w-4 h-px bg-[var(--color-border)]" />}
              </div>
            ))}
          </div>

          {/* Case title */}
          <div className="mt-6 mb-4">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest"
                style={{ background: `${difficultyColor[activeCase.difficulty]}22`, color: difficultyColor[activeCase.difficulty] }}
              >
                {activeCase.difficulty}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-300">{activeCase.specialty}</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-fg-muted">{activeCase.organSystem}</span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-fg">{activeCase.title}</h2>
          </div>

          {/* Presentation */}
          {phase === 'presentation' && (
            <CasePanel title="Patient Presentation" onNext={() => { sounds.beep(660, 80); setPhase('history') }} nextLabel="Take History →">
              {activeCase.briefImage && (
                <div className="mb-4 rounded-xl overflow-hidden glass h-48">
                  <img src={activeCase.briefImage} alt="" className="w-full h-full object-cover opacity-70" />
                </div>
              )}
              <p className="text-fg-soft leading-relaxed">{activeCase.presentation}</p>
            </CasePanel>
          )}

          {/* History */}
          {phase === 'history' && (
            <CasePanel title="History" onBack={() => setPhase('presentation')} onNext={() => { sounds.beep(660, 80); setPhase('exam') }} nextLabel="Examine Patient →">
              <p className="text-fg-soft leading-relaxed whitespace-pre-line">{activeCase.history}</p>
            </CasePanel>
          )}

          {/* Exam */}
          {phase === 'exam' && (
            <CasePanel title="Physical Examination" onBack={() => setPhase('history')} onNext={() => { sounds.beep(660, 80); setPhase('orders') }} nextLabel="Order Workup →">
              <p className="text-fg-soft leading-relaxed whitespace-pre-line font-mono text-sm">{activeCase.exam}</p>
            </CasePanel>
          )}

          {/* Orders */}
          {phase === 'orders' && (
            <CasePanel title="Diagnostic Orders" onBack={() => setPhase('exam')} onNext={() => { sounds.beep(660, 80); setPhase('differential') }} nextLabel="Form Differential →">
              <p className="text-xs text-fg-muted mb-4 font-mono uppercase tracking-widest">Click each order to reveal results as they return from the lab.</p>
              <div className="space-y-2">
                {activeCase.orders.map((o, i) => (
                  <div key={i} className="glass rounded-lg overflow-hidden">
                    <button
                      onClick={() => revealOrder(i)}
                      disabled={revealedOrders.includes(i)}
                      className={`w-full text-left p-3 flex items-center justify-between gap-3 transition-colors ${revealedOrders.includes(i) ? '' : 'hover:bg-cyan-500/5'}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm text-cyan-300">{o.name}</div>
                        {revealedOrders.includes(i) && <div className="text-xs text-fg-muted mt-0.5">Turnaround: {o.turnaround}</div>}
                      </div>
                      <div className="text-xs font-mono text-fg-muted">
                        {revealedOrders.includes(i) ? '✓ Result' : '⟳ Order'}
                      </div>
                    </button>
                    {revealedOrders.includes(i) && (
                      <div className="px-3 pb-3 pt-1 border-t border-[var(--color-border)]">
                        <div className="text-xs uppercase tracking-widest text-fg-muted mt-2 mb-1">Result</div>
                        <div className="text-sm text-fg font-mono mb-2">{o.result}</div>
                        <div className="text-xs uppercase tracking-widest text-fg-muted mb-1">Interpretation</div>
                        <div className="text-sm text-[var(--color-bio)]">{o.interpretation}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {revealedOrders.length < activeCase.orders.length && (
                <p className="text-xs text-[var(--color-amber)] mt-3 font-mono">⌛ {activeCase.orders.length - revealedOrders.length} order(s) still pending review</p>
              )}
            </CasePanel>
          )}

          {/* Differential */}
          {phase === 'differential' && (
            <CasePanel title="Commit to a Diagnosis" onBack={() => setPhase('orders')}>
              <p className="text-fg-soft leading-relaxed mb-4">Based on the presentation, exam, and workup, select your leading diagnosis. You will see the debrief after committing.</p>
              <div className="space-y-2">
                {activeCase.differentials.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => submitDiagnosis(i)}
                    disabled={selectedDx !== null}
                    className={`w-full text-left p-4 rounded-lg glass transition-all ${
                      selectedDx === i
                        ? d.isCorrect
                          ? 'glow-border border-[var(--color-bio)]'
                          : 'border-[var(--color-rose)]'
                        : 'hover:glow-border'
                    } disabled:opacity-80`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 ${
                        selectedDx === i
                          ? d.isCorrect ? 'border-[var(--color-bio)] bg-[var(--color-bio)]' : 'border-[var(--color-rose)] bg-[var(--color-rose)]'
                          : 'border-cyan-400'
                      }`} />
                      <div className="text-sm text-fg">{d.diagnosis}</div>
                    </div>
                  </button>
                ))}
              </div>
              {selectedDx === null && (
                <p className="text-xs text-fg-muted mt-3 font-mono italic">No going back — commit when ready.</p>
              )}
            </CasePanel>
          )}

          {/* Debrief */}
          {phase === 'debrief' && selectedDx !== null && (
            <CasePanel title="Case Debrief" onBack={() => setPhase('differential')} onNext={() => { sounds.beep(660, 80); setView('list') }} nextLabel="Next Case →">
              {/* Score */}
              <div className="mb-6 glass-strong rounded-xl p-5 text-center">
                <div className="text-[10px] font-mono uppercase tracking-widest text-fg-muted mb-2">Your Score</div>
                <div
                  className="font-display text-5xl font-bold mb-2"
                  style={{ color: scoreAwarded >= 80 ? 'var(--color-bio)' : scoreAwarded >= 50 ? 'var(--color-amber)' : 'var(--color-rose)' }}
                >
                  {scoreAwarded}<span className="text-lg text-fg-muted">/100</span>
                </div>
                <div className="text-xs font-mono text-cyan-300">+{activeCase.xpReward} XP earned</div>
                {scoreAwarded === 100 && <div className="text-xs text-[var(--color-bio)] mt-2">◆ Perfect diagnostic reasoning</div>}
                {scoreAwarded === 30 && <div className="text-xs text-[var(--color-amber)] mt-2">◆ See teaching points below to learn from this miss</div>}
              </div>

              {/* Diagnosis reveal */}
              <div className="mb-4 glass rounded-xl p-4">
                <div className="text-[10px] font-mono uppercase tracking-widest text-fg-muted mb-1">Correct Diagnosis</div>
                <div className="font-display text-lg text-[var(--color-bio)] mb-3">{activeCase.correctDiagnosis}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-fg-muted mb-1">Explanation</div>
                <p className="text-sm text-fg-soft leading-relaxed">{activeCase.diagnosisExplanation}</p>
              </div>

              {/* Selected vs correct */}
              <div className="mb-4 glass rounded-xl p-4">
                <div className="text-[10px] font-mono uppercase tracking-widest text-fg-muted mb-2">Your Selection</div>
                <div className="text-sm text-fg mb-1">{activeCase.differentials[selectedDx].diagnosis}</div>
                <div className={`text-xs ${activeCase.differentials[selectedDx].isCorrect ? 'text-[var(--color-bio)]' : 'text-[var(--color-rose)]'}`}>
                  {activeCase.differentials[selectedDx].isCorrect ? '✓ Correct' : '✗ Not the best answer'}
                </div>
                <p className="text-xs text-fg-soft mt-2 leading-relaxed">{activeCase.differentials[selectedDx].explanation}</p>
              </div>

              {/* Teaching points */}
              <div className="mb-4 glass rounded-xl p-4 glow-border">
                <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 mb-2">◆ Teaching Points — Learn From This Case</div>
                <p className="text-sm text-fg-soft leading-relaxed whitespace-pre-line">{activeCase.teachingPoints}</p>
              </div>

              {/* Red flags */}
              {activeCase.redFlags && (
                <div className="glass rounded-xl p-4 border-l-2" style={{ borderColor: 'var(--color-rose)' }}>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-rose)] mb-2">⚠ Red Flags</div>
                  <p className="text-sm text-fg-soft leading-relaxed">{activeCase.redFlags}</p>
                </div>
              )}

              {/* Chat CTA */}
              <div className="mt-6 glass rounded-xl p-4 text-center">
                <p className="text-sm text-fg-soft mb-2">Want to discuss this case with other learners?</p>
                <button
                  onClick={() => {
                    sounds.beep(660, 80)
                    document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="px-4 py-2 rounded-lg glass text-xs font-mono uppercase tracking-widest text-cyan-300 hover:glow-border"
                >
                  Open Global Chat →
                </button>
              </div>
            </CasePanel>
          )}
        </div>
      )}
    </section>
  )
}

function phasesPassed(current: Phase, check: Phase): boolean {
  const order: Phase[] = ['presentation', 'history', 'exam', 'orders', 'differential', 'debrief']
  return order.indexOf(check) < order.indexOf(current)
}

function CasePanel({
  title,
  children,
  onBack,
  onNext,
  nextLabel,
}: {
  title: string
  children: React.ReactNode
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
}) {
  return (
    <div className="glass rounded-xl p-5 md:p-6 mt-4 fade-in">
      <div className="text-xs font-mono uppercase tracking-widest text-cyan-300 mb-4">{title}</div>
      <div>{children}</div>
      <div className="mt-6 flex items-center justify-between">
        {onBack ? (
          <button onClick={onBack} className="text-xs font-mono uppercase tracking-widest text-fg-muted hover:text-cyan-300">← Back</button>
        ) : <div />}
        {onNext && nextLabel && (
          <button
            onClick={onNext}
            className="px-4 py-2 rounded-lg font-display text-xs uppercase tracking-widest font-semibold text-bg"
            style={{ background: 'linear-gradient(135deg, #00e8ff 0%, #6cff9c 100%)' }}
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  )
}
