'use client'

import { SectionHeader } from './library-section'

export function AboutMissionSection() {
  return (
    <section id="mission" className="px-4 py-20 max-w-5xl mx-auto">
      <SectionHeader
        eyebrow="Our Pledge"
        title="Open Medicine for Everyone, Forever"
        subtitle="MEDIVAULT is built on a simple belief: medical knowledge should flow freely to anyone who wants to heal."
      />

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
        <PledgeCard
          icon="🔓"
          title="No Login. Ever."
          body="You get a permanent anonymous ID the moment you arrive. No email, no password, no tracking. Your identity lives in your browser — recover it on any device with a 12-character code. Your data is yours."
        />
        <PledgeCard
          icon="📚"
          title="Only Openly Licensed Books"
          body="Every reference in our library is in the public domain (like the 1918 Gray's Anatomy, MedlinePlus, NCBI Bookshelf) or openly licensed (OpenStax CC BY 4.0, Wikibooks CC BY-SA 4.0). We link to the original source — never pirate, never reproduce copyrighted content."
        />
        <PledgeCard
          icon="💸"
          title="No Money Changes Hands"
          body="MEDIVAULT is and always will be free. No subscriptions. No premium tier. No ads. No data sale. The code is open-source. The content is open-licensed. The community is the only asset."
        />
        <PledgeCard
          icon="🌍"
          title="For Every Doctor on Earth"
          body="From a teaching hospital in Boston to a rural clinic in Bihar — if you can open a browser, you have the same library, the same cases, the same chatroom as everyone else. Geography is not a barrier to knowledge."
        />
        <PledgeCard
          icon="🤝"
          title="Teach From Mistakes"
          body="The global chat is built around one idea: when we share our diagnostic errors openly and kindly, everyone gets better. Flag a message, add a correction, pin a teaching moment — turn every miss into a lesson for the next clinician."
        />
        <PledgeCard
          icon="🔍"
          title="Depth Without End"
          body="Every topic has four layers — TL;DR, overview, full explanation, and a 1500+ word deep-dive with pathophysiology, dosing, red flags, evidence, and open-source references. Go as shallow or as deep as you need."
        />
      </div>

      {/* Open Source Pledge */}
      <div className="mt-8 glass-strong rounded-2xl p-6 md:p-8 glow-border">
        <h3 className="font-display text-xl text-cyan-300 mb-4">The Open Source Pledge</h3>
        <p className="text-fg-soft leading-relaxed mb-4">
          MEDIVAULT is committed to using only content that is legally and ethically shareable. We do not host
          copyrighted textbooks like Harrison's, Robbins, or Bates'. Instead, we link to openly licensed
          alternatives and paraphrase clinical knowledge that is in the public domain.
        </p>
        <p className="text-fg-soft leading-relaxed mb-6">
          Our sources include:
        </p>
        <ul className="space-y-2 mb-6">
          <LicenseItem name="Gray's Anatomy of the Human Body (1918 edition)" license="Public Domain" url="https://www.bartleby.com/107/" />
          <LicenseItem name="OpenStax Anatomy & Physiology 2e" license="CC BY 4.0" url="https://openstax.org/details/books/anatomy-and-physiology-2e" />
          <LicenseItem name="OpenStax Biology 2e" license="CC BY 4.0" url="https://openstax.org/details/books/biology-2e" />
          <LicenseItem name="BCCampus Open Pharmacology" license="CC BY 4.0" url="https://opentextbc.ca/pharmacology/" />
          <LicenseItem name="Wikibooks Human Physiology & Emergency Medicine" license="CC BY-SA 4.0" url="https://en.wikibooks.org/wiki/Human_Physiology" />
          <LicenseItem name="MedlinePlus Medical Encyclopedia (NLM, US Gov)" license="Public Domain" url="https://medlineplus.gov/encyclopedia.html" />
          <LicenseItem name="NCBI Bookshelf (US Gov)" license="Public Domain" url="https://www.ncbi.nlm.nih.gov/books/" />
        </ul>
        <p className="text-fg-muted text-xs italic">
          Note: We are not affiliated with these organizations. We link to their openly licensed content with gratitude.
          Always verify medical decisions with your local protocols and clinical judgment — this is an educational tool, not a clinical decision support system.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 glass rounded-xl p-5 border-l-2" style={{ borderColor: 'var(--color-amber)' }}>
        <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-amber)] mb-2">⚠ Educational Use Only</div>
        <p className="text-sm text-fg-soft leading-relaxed">
          MEDIVAULT is for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.
          Always consult qualified healthcare providers with questions about medical conditions. Never disregard professional medical advice
          because of something you read here. In an emergency, call your local emergency number.
        </p>
      </div>
    </section>
  )
}

function PledgeCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="glass scan-card rounded-xl p-5">
      <div className="text-2xl mb-3">{icon}</div>
      <h3 className="font-display font-semibold text-cyan-300 mb-2">{title}</h3>
      <p className="text-sm text-fg-soft leading-relaxed">{body}</p>
    </div>
  )
}

function LicenseItem({ name, license, url }: { name: string; license: string; url: string }) {
  return (
    <li className="flex items-center justify-between flex-wrap gap-2 text-sm border-b border-[var(--color-border)] pb-2 last:border-0">
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-fg-soft hover:text-cyan-300 transition-colors">
        {name} <span className="text-xs text-fg-muted">↗</span>
      </a>
      <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-bio)]">{license}</span>
    </li>
  )
}
