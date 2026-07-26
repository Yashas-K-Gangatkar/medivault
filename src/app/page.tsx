'use client'

import { useCallback, useState } from 'react'
import { useIdentity } from '@/hooks/use-identity'
import { SiteHeader } from '@/components/medivault/site-header'
import { HeroSection } from '@/components/medivault/hero-section'
import { LibrarySection } from '@/components/medivault/library-section'
import { CaseSimulatorSection } from '@/components/medivault/case-simulator-section'
import { KnowledgeAtlasSection } from '@/components/medivault/knowledge-atlas-section'
import { ProgressDashboardSection } from '@/components/medivault/progress-dashboard-section'
import { GlobalChatSection } from '@/components/medivault/global-chat-section'
import { AboutMissionSection } from '@/components/medivault/about-mission-section'

export default function Home() {
  const { user, loading, updateUser } = useIdentity()
  const [topicSlug, setTopicSlug] = useState<string | null>(null)

  const handleNav = useCallback((id: string) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const handleProgress = useCallback(
    async (itemType: string, itemId: string, status: string, score?: number) => {
      if (!user) return
      try {
        const res = await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, itemType, itemId, status, score }),
        })
        const data = await res.json()
        if (data.ok && data.user) {
          updateUser({
            rank: data.user.rank,
            xp: data.user.xp,
            casesSolved: data.user.casesSolved,
            booksRead: data.user.booksRead,
            topicsMastered: data.user.topicsMastered,
          })
        }
      } catch (e) {
        console.error('progress report failed', e)
      }
    },
    [user, updateUser]
  )

  // Open a topic from the atlas — scroll to library and trigger open
  const handleOpenTopic = useCallback((slug: string) => {
    setTopicSlug(slug)
    document.getElementById('library')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader user={user} onNav={handleNav} />

      <main className="flex-1 pt-14">
        <HeroSection onEnter={() => handleNav('library')} />

        <LibrarySection userId={user?.id} onProgress={handleProgress} />

        <CaseSimulatorSection userId={user?.id} onProgress={handleProgress} />

        <KnowledgeAtlasSection onOpenTopic={handleOpenTopic} />

        <ProgressDashboardSection user={user} />

        <GlobalChatSection user={user} />

        <AboutMissionSection />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-bg-soft)]/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="font-display font-bold text-fg mb-2">MEDIVAULT</div>
              <p className="text-xs text-fg-muted leading-relaxed">
                Open-source medical education for every doctor on Earth.
                Built with freely licensed knowledge and a permanent anonymous identity.
              </p>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 mb-2">Navigate</div>
              <div className="space-y-1 text-xs text-fg-muted">
                <button onClick={() => handleNav('library')} className="block hover:text-cyan-300">Library</button>
                <button onClick={() => handleNav('cases')} className="block hover:text-cyan-300">Case Simulator</button>
                <button onClick={() => handleNav('atlas')} className="block hover:text-cyan-300">Knowledge Atlas</button>
                <button onClick={() => handleNav('progress')} className="block hover:text-cyan-300">Your Progress</button>
                <button onClick={() => handleNav('chat')} className="block hover:text-cyan-300">Global Chat</button>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 mb-2">Our Pledge</div>
              <p className="text-xs text-fg-muted leading-relaxed">
                No login · No paywalls · No tracking · Only openly licensed content ·
                Forever free for every clinician, everywhere.
              </p>
            </div>
          </div>
          <div className="pt-6 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3">
            <div className="text-[10px] font-mono text-fg-muted">
              © 2026 MEDIVAULT Open Initiative · Educational use only · Not a substitute for clinical judgment
            </div>
            <div className="text-[10px] font-mono text-fg-muted">
              Content under Public Domain / CC BY / CC BY-SA · See <button onClick={() => handleNav('mission')} className="text-cyan-300 hover:underline">Mission</button> for sources
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
