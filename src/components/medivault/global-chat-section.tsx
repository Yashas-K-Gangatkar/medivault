'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useSounds } from '@/hooks/use-sounds'
import { SectionHeader } from './library-section'
import { RANK_INFO, type MedivaultUser } from '@/hooks/use-identity'

interface ChatMessage {
  id: string
  userPublicId: string
  userRank: string
  userDisplayName: string
  content: string
  topic: string | null
  isCaseDiscussion: boolean
  caseId: string | null
  isPinned: boolean
  isFlagged: boolean
  correction: string | null
  createdAt: string
}

export function GlobalChatSection({ user }: { user: MedivaultUser | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [topic, setTopic] = useState('')
  const [isCaseDiscussion, setIsCaseDiscussion] = useState(false)
  const [since, setSince] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [correctionForId, setCorrectionForId] = useState<string | null>(null)
  const [correctionText, setCorrectionText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const sounds = useSounds()

  const poll = useCallback(async () => {
    try {
      const url = since ? `/api/chat?since=${encodeURIComponent(since)}` : '/api/chat'
      const res = await fetch(url)
      const data = await res.json()
      if (data.ok && data.messages && data.messages.length > 0) {
        setMessages(prev => {
          const existing = new Set(prev.map(m => m.id))
          const fresh = data.messages.filter((m: ChatMessage) => !existing.has(m.id))
          return [...prev, ...fresh]
        })
        setSince(data.messages[data.messages.length - 1].createdAt)
      }
    } catch (e) {
      // ignore poll errors
    }
  }, [since])

  useEffect(() => {
    // initial load
    poll()
    const interval = setInterval(poll, 4000)
    return () => clearInterval(interval)
  }, [poll])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const send = async () => {
    if (!user || !input.trim() || sending) return
    setSending(true)
    setError(null)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          content: input.trim(),
          topic: topic.trim() || null,
          isCaseDiscussion,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        // poll immediately to fetch our own message
        setTimeout(poll, 200)
        setInput('')
        sounds.beep(880, 80)
      } else {
        setError(data.error || 'Send failed')
      }
    } catch (e) {
      setError('Network error')
    } finally {
      setSending(false)
    }
  }

  const flagMessage = async (id: string) => {
    if (!user) return
    try {
      await fetch('/api/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: id, action: 'flag', userId: user.id }),
      })
      sounds.beep(440, 60)
      setTimeout(poll, 200)
    } catch {}
  }

  const pinMessage = async (id: string) => {
    if (!user) return
    try {
      await fetch('/api/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: id, action: 'pin', userId: user.id }),
      })
      sounds.beep(660, 80)
      setTimeout(poll, 200)
    } catch {}
  }

  const submitCorrection = async (id: string) => {
    if (!user || !correctionText.trim()) return
    try {
      await fetch('/api/chat', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId: id, action: 'correct', correction: correctionText.trim(), userId: user.id }),
      })
      sounds.chime()
      setCorrectionForId(null)
      setCorrectionText('')
      setTimeout(poll, 200)
    } catch {}
  }

  return (
    <section id="chat" className="px-4 py-20 max-w-5xl mx-auto">
      <SectionHeader
        eyebrow="Global Medical Chat"
        title="Teach and Learn From Each Other"
        subtitle="A shared, real-time room for every clinician on Earth. Made a mistake in a case? Post it here. See something incorrect? Add a correction. Pinned messages become shared teaching moments."
      />

      {!user ? (
        <div className="mt-10 glass rounded-xl p-8 text-center">
          <div className="font-mono text-fg-muted text-sm">Loading your identity...</div>
        </div>
      ) : (
        <div className="mt-10 glass-strong rounded-2xl overflow-hidden glow-border">
          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-bio)] pulse-bio" style={{ color: 'var(--color-bio)' }} />
              <span className="font-mono text-xs uppercase tracking-widest text-cyan-300">Global Room · LIVE</span>
            </div>
            <div className="font-mono text-xs text-fg-muted">
              You: <span className="text-cyan-300">{user.publicId}</span> · <span style={{ color: RANK_INFO[user.rank].color }}>{RANK_INFO[user.rank].label}</span>
            </div>
          </div>

          {/* Pinned teaching moments */}
          {messages.filter(m => m.isPinned).length > 0 && (
            <div className="px-5 py-3 border-b border-[var(--color-border)] bg-cyan-500/5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 mb-2">📌 Pinned Teaching Moments</div>
              <div className="space-y-1.5">
                {messages.filter(m => m.isPinned).slice(-3).map(m => (
                  <div key={m.id} className="text-xs text-fg-soft italic">
                    "{m.content}" — <span className="text-cyan-300">{m.userDisplayName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} className="max-h-[420px] overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-fg-muted text-sm mb-2">No messages yet.</div>
                <div className="text-xs text-fg-muted">Be the first to share a learning, ask a question, or discuss a case.</div>
              </div>
            ) : (
              messages.map(m => {
                const isMine = m.userPublicId === user.publicId
                const rank = RANK_INFO[m.userRank] || RANK_INFO.MEDICAL_STUDENT
                return (
                  <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] glass rounded-xl p-3 ${m.isFlagged ? 'border-l-2 border-[var(--color-amber)]' : ''}`}>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-[10px] text-fg-muted">{m.userPublicId}</span>
                        <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: rank.color }}>{rank.label}</span>
                        {m.topic && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/10 text-cyan-300">#{m.topic}</span>
                        )}
                        {m.isCaseDiscussion && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[var(--color-bio)]/10 text-[var(--color-bio)]">CASE</span>
                        )}
                      </div>
                      <div className="text-sm text-fg leading-relaxed">{m.content}</div>

                      {m.isFlagged && m.correction && (
                        <div className="mt-2 pt-2 border-t border-[var(--color-amber)]/30">
                          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-amber)] mb-1">⚠ Correction Added</div>
                          <div className="text-xs text-fg-soft italic">{m.correction}</div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-fg-muted">
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {!isMine && (
                          <>
                            <button onClick={() => flagMessage(m.id)} className="hover:text-[var(--color-amber)] transition-colors">⚠ Flag</button>
                            <button onClick={() => pinMessage(m.id)} className="hover:text-cyan-300 transition-colors">📌 Pin</button>
                            <button onClick={() => setCorrectionForId(m.id === correctionForId ? null : m.id)} className="hover:text-[var(--color-bio)] transition-colors">
                              + Correct
                            </button>
                          </>
                        )}
                      </div>

                      {correctionForId === m.id && (
                        <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
                          <textarea
                            value={correctionText}
                            onChange={e => setCorrectionText(e.target.value)}
                            placeholder="Add a kind, specific correction..."
                            className="w-full bg-[var(--color-bg-soft)] rounded p-2 text-xs text-fg border border-[var(--color-border)] focus:border-[var(--color-bio)] outline-none resize-none"
                            rows={2}
                          />
                          <div className="flex justify-end gap-2 mt-1">
                            <button onClick={() => { setCorrectionForId(null); setCorrectionText('') }} className="text-[10px] font-mono text-fg-muted hover:text-fg">Cancel</button>
                            <button
                              onClick={() => submitCorrection(m.id)}
                              className="px-2 py-1 rounded text-[10px] font-mono text-bg font-semibold"
                              style={{ background: 'var(--color-bio)' }}
                            >
                              Submit Correction
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Input */}
          <div className="border-t border-[var(--color-border)] p-4">
            {error && <div className="text-xs text-[var(--color-rose)] mb-2 font-mono">⚠ {error}</div>}
            <div className="flex gap-2 mb-2 flex-wrap items-center">
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="topic tag (e.g. cardiology, case-stemi)"
                className="px-2 py-1 bg-[var(--color-bg-soft)] rounded text-xs text-fg border border-[var(--color-border)] focus:border-cyan-400 outline-none font-mono w-48"
              />
              <label className="flex items-center gap-1.5 text-xs font-mono text-fg-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={isCaseDiscussion}
                  onChange={e => setIsCaseDiscussion(e.target.checked)}
                  className="accent-[var(--color-bio)]"
                />
                Case Discussion
              </label>
            </div>
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send()
                  }
                }}
                placeholder="Share a learning, ask a question, or discuss a case... (Enter to send, Shift+Enter for newline)"
                className="flex-1 bg-[var(--color-bg-soft)] rounded-lg p-3 text-sm text-fg border border-[var(--color-border)] focus:border-cyan-400 outline-none resize-none"
                rows={2}
                maxLength={1000}
              />
              <button
                onClick={send}
                disabled={!input.trim() || sending}
                className="px-5 rounded-lg font-display text-xs uppercase tracking-widest font-semibold text-bg disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #00e8ff 0%, #6cff9c 100%)' }}
              >
                {sending ? '...' : 'Send →'}
              </button>
            </div>
            <div className="text-[10px] font-mono text-fg-muted mt-2 italic">
              ◆ Be kind. Be specific. Cite sources when possible. Medical chat — keep it clinical.
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
