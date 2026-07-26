'use client'

import { useEffect, useState, useCallback } from 'react'

export interface MedivaultUser {
  id: string
  publicId: string
  recoveryCode: string
  displayName: string
  rank: string
  xp: number
  casesSolved: number
  booksRead: number
  topicsMastered: number
  createdAt: string
}

const STORAGE_KEY = 'medivault.user'

export function useIdentity() {
  const [user, setUser] = useState<MedivaultUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Load or create identity on mount
  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
        if (stored) {
          const parsed = JSON.parse(stored) as MedivaultUser
          // Try to sync with server (PATCH lastSeen)
          try {
            const res = await fetch('/api/identity', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: parsed.id }),
            })
            if (res.ok) {
              const data = await res.json()
              if (data.ok && data.user && !cancelled) {
                setUser(data.user)
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user))
                setLoading(false)
                return
              }
            }
          } catch {
            // server unreachable — use local copy
          }
          if (!cancelled) {
            setUser(parsed)
            setLoading(false)
          }
          return
        }

        // No stored identity — create one
        const res = await fetch('/api/identity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create' }),
        })
        const data = await res.json()
        if (data.ok && data.user && !cancelled) {
          setUser(data.user)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user))
        }
      } catch (e) {
        console.error('identity init failed', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => {
      cancelled = true
    }
  }, [])

  const updateUser = useCallback((patch: Partial<MedivaultUser>) => {
    setUser(prev => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const recoverIdentity = useCallback(async (recoveryCode: string) => {
    const res = await fetch('/api/identity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'recover', recoveryCode }),
    })
    const data = await res.json()
    if (data.ok && data.user) {
      setUser(data.user)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user))
      } catch {}
      return { ok: true as const }
    }
    return { ok: false as const, error: data.error || 'Recovery failed' }
  }, [])

  return { user, loading, updateUser, recoverIdentity }
}

export const RANK_INFO: Record<string, { label: string; minXp: number; color: string; icon: string }> = {
  MEDICAL_STUDENT: { label: 'Medical Student', minXp: 0, color: '#6b7ba8', icon: '◆' },
  INTERN: { label: 'Intern', minXp: 500, color: '#00e8ff', icon: '◆◆' },
  RESIDENT: { label: 'Resident', minXp: 1500, color: '#00ffd1', icon: '◆◆◆' },
  ATTENDING: { label: 'Attending', minXp: 4000, color: '#6cff9c', icon: '◆◆◆◆' },
  CHIEF: { label: 'Chief', minXp: 10000, color: '#ffb84d', icon: '◆◆◆◆◆' },
}

export function getNextRank(rank: string): { label: string; minXp: number; color: string; icon: string } | null {
  const ranks = ['MEDICAL_STUDENT', 'INTERN', 'RESIDENT', 'ATTENDING', 'CHIEF']
  const idx = ranks.indexOf(rank)
  if (idx === -1 || idx === ranks.length - 1) return null
  return RANK_INFO[ranks[idx + 1]]
}
