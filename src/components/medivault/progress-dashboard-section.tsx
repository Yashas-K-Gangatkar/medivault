'use client'

import { useEffect, useState } from 'react'
import { SectionHeader } from './library-section'
import { RANK_INFO, getNextRank, type MedivaultUser } from '@/hooks/use-identity'

interface ProgressEntry {
  id: string
  itemType: string
  itemId: string
  status: string
  score: number | null
  weakAreas: string[] | null
  updatedAt: string
}

export function ProgressDashboardSection({ user }: { user: MedivaultUser | null }) {
  const [progress, setProgress] = useState<ProgressEntry[]>([])

  useEffect(() => {
    if (!user) return
    fetch(`/api/progress?userId=${user.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.ok) setProgress(d.progress)
      })
      .catch(() => {})
  }, [user])

  if (!user) {
    return (
      <section id="progress" className="px-4 py-20 max-w-5xl mx-auto">
        <SectionHeader eyebrow="Progress" title="Your Rank & XP" subtitle="Loading your permanent identity..." />
      </section>
    )
  }

  const rank = RANK_INFO[user.rank]
  const nextRank = getNextRank(user.rank)
  const xpInCurrentRank = user.xp - rank.minXp
  const xpForNextRank = nextRank ? nextRank.minXp - rank.minXp : 0
  const pct = nextRank ? Math.min(100, (xpInCurrentRank / xpForNextRank) * 100) : 100

  const completedCases = progress.filter(p => p.itemType === 'CASE' && (p.status === 'COMPLETED' || p.status === 'MASTERED'))
  const completedTopics = progress.filter(p => p.itemType === 'TOPIC' && p.status === 'MASTERED')
  const completedBooks = progress.filter(p => p.itemType === 'BOOK' && p.status === 'COMPLETED')

  const weakAreaCounts: Record<string, number> = {}
  progress.forEach(p => {
    if (p.score !== null && p.score < 60 && p.itemType === 'CASE') {
      weakAreaCounts[p.itemId] = (weakAreaCounts[p.itemId] || 0) + 1
    }
  })
  const weakAreas = Object.entries(weakAreaCounts).sort((a, b) => b[1] - a[1]).slice(0, 3)

  return (
    <section id="progress" className="px-4 py-20 max-w-5xl mx-auto">
      <SectionHeader
        eyebrow="Progress Dashboard"
        title="Your Rank & XP"
        subtitle="No accounts. No login. Your permanent ID lives in your browser — write down the recovery code to continue on any device."
      />

      {/* Identity card */}
      <div className="mt-10 glass-strong rounded-2xl p-6 glow-border">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-fg-muted">Your Permanent ID</div>
            <div className="font-mono text-2xl text-cyan-300 glow-cyan mt-1">{user.publicId}</div>
            <div className="text-xs text-fg-soft mt-1">Display name: {user.displayName}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase tracking-widest text-fg-muted">Recovery Code</div>
            <div className="font-mono text-sm text-[var(--color-bio)] glow-bio mt-1 tracking-wider">{user.recoveryCode}</div>
            <div className="text-[10px] text-fg-muted mt-1">Write this down · use on any device</div>
          </div>
        </div>
      </div>

      {/* Rank + XP */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-5">
          <div className="text-[10px] font-mono uppercase tracking-widest text-fg-muted mb-2">Current Rank</div>
          <div className="font-display text-2xl font-bold mb-1" style={{ color: rank.color }}>
            {rank.icon} {rank.label}
          </div>
          <div className="text-xs text-fg-soft">{user.xp.toLocaleString()} total XP</div>
        </div>

        <div className="glass rounded-xl p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-fg-muted">Next Rank</div>
            {nextRank ? (
              <div className="text-xs font-mono" style={{ color: nextRank.color }}>
                {nextRank.label} at {nextRank.minXp.toLocaleString()} XP
              </div>
            ) : (
              <div className="text-xs font-mono text-[var(--color-amber)]">◆ Maximum rank achieved</div>
            )}
          </div>
          {nextRank && (
            <>
              <div className="h-3 rounded-full bg-[var(--color-bg-soft)] overflow-hidden border border-[var(--color-border)]">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${rank.color} 0%, ${nextRank.color} 100%)`,
                    boxShadow: `0 0 12px ${nextRank.color}`,
                  }}
                />
              </div>
              <div className="text-xs text-fg-muted mt-2 font-mono">
                {xpInCurrentRank} / {xpForNextRank} XP · {(xpForNextRank - xpInCurrentRank).toLocaleString()} to next rank
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <StatTile label="Cases Solved" value={user.casesSolved} accent="cyan" />
        <StatTile label="Books Read" value={user.booksRead} accent="bio" />
        <StatTile label="Topics Mastered" value={user.topicsMastered} accent="amber" />
      </div>

      {/* Activity log */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass rounded-xl p-5">
          <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 mb-3">◆ Recent Activity</div>
          {progress.length === 0 ? (
            <div className="text-sm text-fg-muted italic">Start reading or solving cases to see activity here.</div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {progress.slice().reverse().slice(0, 8).map(p => (
                <div key={p.id} className="flex items-center justify-between text-xs gap-3 py-1.5 border-b border-[var(--color-border)] last:border-0">
                  <div className="min-w-0">
                    <div className="font-mono text-fg-soft truncate">{p.itemType.toLowerCase()} · {p.itemId}</div>
                    <div className="text-[10px] text-fg-muted">{new Date(p.updatedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.score !== null && (
                      <span className={`font-mono text-xs ${p.score >= 80 ? 'text-[var(--color-bio)]' : p.score >= 50 ? 'text-[var(--color-amber)]' : 'text-[var(--color-rose)]'}`}>
                        {p.score}
                      </span>
                    )}
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider ${
                      p.status === 'MASTERED' ? 'text-[var(--color-bio)]' : p.status === 'COMPLETED' ? 'text-cyan-300' : 'text-fg-muted'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-xl p-5">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-amber)] mb-3">⚠ Weak Areas to Review</div>
          {weakAreas.length === 0 ? (
            <div className="text-sm text-fg-muted italic">No weak areas yet — keep practicing!</div>
          ) : (
            <div className="space-y-2">
              {weakAreas.map(([slug, count]) => (
                <div key={slug} className="flex items-center justify-between text-xs">
                  <span className="font-mono text-fg-soft truncate">{slug.replace(/-/g, ' ')}</span>
                  <span className="text-[var(--color-rose)] font-mono">{count} miss{count > 1 ? 'es' : ''}</span>
                </div>
              ))}
              <div className="text-[10px] text-fg-muted mt-2 italic">
                Tip: Revisit these cases in the Case Simulator, or ask the global chat for explanations.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Total counts */}
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <SmallStat label="Cases" value={completedCases.length} />
        <SmallStat label="Topics" value={completedTopics.length} />
        <SmallStat label="Books" value={completedBooks.length} />
      </div>
    </section>
  )
}

function StatTile({ label, value, accent }: { label: string; value: number; accent: 'cyan' | 'bio' | 'amber' }) {
  const color = accent === 'cyan' ? 'var(--color-cyan)' : accent === 'bio' ? 'var(--color-bio)' : 'var(--color-amber)'
  return (
    <div className="glass rounded-xl p-4 text-center">
      <div className="font-display text-3xl font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-fg-muted mt-1">{label}</div>
    </div>
  )
}

function SmallStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-lg p-3">
      <div className="font-mono text-lg text-fg">{value}</div>
      <div className="text-[9px] font-mono uppercase tracking-widest text-fg-muted">{label}</div>
    </div>
  )
}
