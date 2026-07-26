'use client'

import { useEffect, useState } from 'react'

/**
 * Lightweight Web Audio synth for subtle UI sounds:
 * - beep: short tone on data unlock / hover
 * - chime: ascending arpeggio on completion
 * - scan: filtered noise sweep on data load
 * All synthesized at runtime — no asset files.
 */
let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let unlocked = false

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext
      ctx = new AC()
      masterGain = ctx.createGain()
      masterGain.gain.value = 0.15
      masterGain.connect(ctx.destination)
    } catch (e) {
      console.warn('AudioContext unavailable', e)
      return null
    }
  }
  return ctx
}

export function unlockAudio() {
  const c = ensureCtx()
  if (c && c.state === 'suspended') {
    c.resume().catch(() => {})
  }
  unlocked = true
}

export function playBeep(freq = 880, durationMs = 80, volume = 0.15) {
  if (!unlocked) return
  const c = ensureCtx()
  if (!c || !masterGain) return
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, c.currentTime)
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + durationMs / 1000)
  osc.connect(gain)
  gain.connect(masterGain)
  osc.start()
  osc.stop(c.currentTime + durationMs / 1000 + 0.05)
}

export function playChime() {
  if (!unlocked) return
  const c = ensureCtx()
  if (!c || !masterGain) return
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'triangle'
    osc.frequency.value = freq
    const start = c.currentTime + i * 0.1
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(0.2, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4)
    osc.connect(gain)
    gain.connect(masterGain)
    osc.start(start)
    osc.stop(start + 0.5)
  })
}

export function playScan() {
  if (!unlocked) return
  const c = ensureCtx()
  if (!c || !masterGain) return
  const buffer = c.createBuffer(1, c.sampleRate * 0.6, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  }
  const noise = c.createBufferSource()
  noise.buffer = buffer
  const filter = c.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(800, c.currentTime)
  filter.frequency.exponentialRampToValueAtTime(4000, c.currentTime + 0.5)
  filter.Q.value = 5
  const gain = c.createGain()
  gain.gain.value = 0.12
  noise.connect(filter)
  filter.connect(gain)
  gain.connect(masterGain)
  noise.start()
  noise.stop(c.currentTime + 0.6)
}

/** React hook for using sounds in components */
export function useSounds() {
  const [enabled, setEnabled] = useState(typeof window !== 'undefined' ? unlocked : false)

  useEffect(() => {
    const onFirstInteraction = () => {
      unlockAudio()
      setEnabled(true)
      window.removeEventListener('pointerdown', onFirstInteraction)
      window.removeEventListener('keydown', onFirstInteraction)
    }
    if (!unlocked) {
      window.addEventListener('pointerdown', onFirstInteraction, { once: true })
      window.addEventListener('keydown', onFirstInteraction, { once: true })
    }
    return () => {
      window.removeEventListener('pointerdown', onFirstInteraction)
      window.removeEventListener('keydown', onFirstInteraction)
    }
  }, [])

  return {
    enabled,
    beep: playBeep,
    chime: playChime,
    scan: playScan,
  }
}
