'use client'

import { useState } from 'react'
import { useSounds } from '@/hooks/use-sounds'
import { SectionHeader } from './library-section'

interface AtlasNode {
  id: string
  label: string
  type: 'discipline' | 'topic'
  x: number
  y: number
  description: string
}

interface AtlasEdge {
  from: string
  to: string
  label?: string
}

const NODES: AtlasNode[] = [
  { id: 'anatomy', label: 'Anatomy', type: 'discipline', x: 50, y: 18, description: 'The structural map of the body — every clinician begins here.' },
  { id: 'physio', label: 'Physiology', type: 'discipline', x: 22, y: 38, description: 'How the body works in health — the baseline for recognizing disease.' },
  { id: 'biochem', label: 'Biochemistry', type: 'discipline', x: 78, y: 38, description: 'The molecular logic of metabolism, signaling, and disease.' },
  { id: 'patho', label: 'Pathology', type: 'discipline', x: 22, y: 64, description: 'Where structure and function break down — the grammar of disease.' },
  { id: 'pharm', label: 'Pharmacology', type: 'discipline', x: 78, y: 64, description: 'How we intervene — drug mechanisms, kinetics, and clinical use.' },
  { id: 'cad', label: 'Coronary Artery Disease', type: 'topic', x: 10, y: 86, description: 'Atherosclerotic narrowing of coronary arteries — leading global killer.' },
  { id: 'acs', label: 'Acute Coronary Syndrome', type: 'topic', x: 32, y: 92, description: 'STEMI / NSTEMI / unstable angina — time-critical emergencies.' },
  { id: 'htn', label: 'Hypertension', type: 'topic', x: 50, y: 86, description: 'Sustained BP elevation — the leading modifiable risk factor worldwide.' },
  { id: 'stroke', label: 'Ischemic Stroke', type: 'topic', x: 68, y: 92, description: 'Sudden cerebral arterial occlusion — "time is brain."' },
  { id: 'copd', label: 'COPD', type: 'topic', x: 90, y: 86, description: 'Progressive airflow limitation from smoking — a global burden.' },
  { id: 'aki', label: 'Acute Kidney Injury', type: 'topic', x: 38, y: 78, description: 'Rapid renal function decline — pre-renal, intrinsic, or post-renal.' },
  { id: 'dka', label: 'Diabetic Ketoacidosis', type: 'topic', x: 62, y: 78, description: 'Insulin deficiency → hyperglycemia + ketosis + acidosis.' },
]

const EDGES: AtlasEdge[] = [
  { from: 'anatomy', to: 'physio' },
  { from: 'anatomy', to: 'biochem' },
  { from: 'physio', to: 'patho', label: 'disease' },
  { from: 'biochem', to: 'patho' },
  { from: 'patho', to: 'pharm', label: 'treat' },
  { from: 'physio', to: 'cad' },
  { from: 'patho', to: 'cad' },
  { from: 'cad', to: 'acs', label: 'complication' },
  { from: 'htn', to: 'cad', label: 'risk factor' },
  { from: 'htn', to: 'stroke' },
  { from: 'physio', to: 'copd' },
  { from: 'patho', to: 'copd' },
  { from: 'physio', to: 'aki' },
  { from: 'patho', to: 'aki' },
  { from: 'biochem', to: 'dka' },
  { from: 'pharm', to: 'dka', label: 'insulin' },
  { from: 'pharm', to: 'acs' },
  { from: 'pharm', to: 'htn' },
  { from: 'pharm', to: 'aki' },
  { from: 'htn', to: 'aki' },
  { from: 'cad', to: 'aki' },
  { from: 'acs', to: 'aki' },
]

export function KnowledgeAtlasSection({ onOpenTopic }: { onOpenTopic?: (slug: string) => void }) {
  const [selected, setSelected] = useState<AtlasNode | null>(null)
  const sounds = useSounds()

  const nodeById = (id: string) => NODES.find(n => n.id === id)

  // Highlight edges connected to selected node
  const connectedEdges = selected
    ? EDGES.filter(e => e.from === selected.id || e.to === selected.id)
    : []

  // Topic slug mapping
  const topicSlugs: Record<string, string> = {
    cad: 'coronary-artery-disease',
    acs: 'acute-coronary-syndrome',
    htn: 'hypertension',
    stroke: 'ischemic-stroke',
    copd: 'copd',
    aki: 'aki',
    dka: 'diabetic-ketoacidosis',
  }

  return (
    <section id="atlas" className="px-4 py-20 max-w-7xl mx-auto">
      <SectionHeader
        eyebrow="Knowledge Atlas"
        title="See How Medicine Connects"
        subtitle="No topic lives in isolation. Anatomy drives physiology. Physiology begets pathology. Pathology meets pharmacology. Click any node to see its connections and open its deep-dive."
      />

      <div className="mt-10 glass rounded-2xl p-4 md:p-6">
        <div className="relative w-full" style={{ aspectRatio: '16 / 11' }}>
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
            {/* Edges */}
            {EDGES.map((e, i) => {
              const a = nodeById(e.from)
              const b = nodeById(e.to)
              if (!a || !b) return null
              const isActive = selected && (e.from === selected.id || e.to === selected.id)
              const isDim = selected && !isActive
              return (
                <g key={i}>
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={isActive ? '#00e8ff' : '#1e2952'}
                    strokeWidth={isActive ? 0.4 : 0.2}
                    strokeOpacity={isDim ? 0.15 : 1}
                    strokeDasharray={isActive ? '0' : '1 1'}
                  />
                  {e.label && (
                    <text
                      x={(a.x + b.x) / 2}
                      y={(a.y + b.y) / 2 - 0.5}
                      textAnchor="middle"
                      fontSize="1.4"
                      fill={isActive ? '#6cff9c' : '#6b7ba8'}
                      opacity={isDim ? 0.2 : 1}
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      {e.label}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Nodes */}
            {NODES.map(n => {
              const isSelected = selected?.id === n.id
              const isConnected = selected && connectedEdges.some(e => (e.from === selected.id && e.to === n.id) || (e.to === selected.id && e.from === n.id))
              const isDim = selected && !isSelected && !isConnected
              const isTopic = n.type === 'topic'
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x}, ${n.y})`}
                  onClick={() => {
                    sounds.beep(isSelected ? 440 : 660, 80)
                    setSelected(isSelected ? null : n)
                  }}
                  className="cursor-pointer"
                  style={{ opacity: isDim ? 0.3 : 1, transition: 'opacity 0.3s' }}
                >
                  <circle
                    r={isTopic ? 2.4 : 3.2}
                    fill={isSelected ? '#00e8ff' : isTopic ? '#0f1530' : '#131a3a'}
                    stroke={isTopic ? '#6cff9c' : '#00e8ff'}
                    strokeWidth={isSelected ? 0.5 : 0.3}
                    style={{ filter: isSelected ? 'drop-shadow(0 0 4px #00e8ff)' : 'none' }}
                  />
                  {isTopic && !isSelected && (
                    <circle r={2.4} fill="none" stroke="#6cff9c" strokeWidth="0.15" opacity="0.4">
                      <animate attributeName="r" from="2.4" to="4" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.4" to="0" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <text
                    y={isTopic ? 4.5 : 5.5}
                    textAnchor="middle"
                    fontSize={isTopic ? '2' : '2.4'}
                    fill={isSelected ? '#e6f0ff' : isTopic ? '#b3c3e6' : '#00e8ff'}
                    style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 600 }}
                  >
                    {n.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Selected node info */}
        {selected ? (
          <div className="mt-4 glass-strong rounded-xl p-4 fade-in glow-border">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-300 mb-1">
                  {selected.type === 'discipline' ? 'Foundation Discipline' : 'Clinical Topic'}
                </div>
                <div className="font-display text-lg text-fg">{selected.label}</div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-xs font-mono text-fg-muted hover:text-cyan-300"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-fg-soft leading-relaxed mb-3">{selected.description}</p>

            {selected.type === 'topic' && topicSlugs[selected.id] && (
              <button
                onClick={() => {
                  sounds.beep(660, 100)
                  onOpenTopic?.(topicSlugs[selected.id])
                }}
                className="px-4 py-2 rounded-lg font-display text-xs uppercase tracking-widest font-semibold text-bg"
                style={{ background: 'linear-gradient(135deg, #00e8ff 0%, #6cff9c 100%)' }}
              >
                Open Deep-Dive →
              </button>
            )}

            {/* Connections list */}
            <div className="mt-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-fg-muted mb-2">Connections ({connectedEdges.length})</div>
              <div className="flex flex-wrap gap-2">
                {connectedEdges.map((e, i) => {
                  const otherId = e.from === selected.id ? e.to : e.from
                  const other = nodeById(otherId)
                  if (!other) return null
                  return (
                    <span key={i} className="px-2 py-1 rounded-full glass text-xs font-mono text-cyan-300">
                      {e.label ? `${e.label} → ` : ''}{other.label}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 text-center text-xs font-mono text-fg-muted uppercase tracking-widest">
            ◆ Click any node to explore connections · Pulse rings = clinical topics · Solid rings = foundation disciplines
          </div>
        )}
      </div>
    </section>
  )
}
