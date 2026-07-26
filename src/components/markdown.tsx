'use client'

import { useMemo } from 'react'

/**
 * Minimal markdown-ish renderer for MEDIVAULT content.
 * Supports: # h1, ## h2, ### h3, **bold**, `code`, - bullets, | tables |, paragraphs.
 * Not a full markdown parser — just enough for our seeded content.
 */
export function MarkdownContent({ content }: { content: string }) {
  const blocks = useMemo(() => parseBlocks(content), [content])
  return <div className="prose-medical">{blocks.map((b, i) => renderBlock(b, i))}</div>
}

type Block =
  | { type: 'h2' | 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'table'; header: string[]; rows: string[][] }

function parseBlocks(src: string): Block[] {
  const lines = src.split('\n')
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      i++
      continue
    }

    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.slice(3) })
      i++
      continue
    }
    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.slice(4) })
      i++
      continue
    }
    if (trimmed.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        items.push(lines[i].trim().slice(2))
        i++
      }
      blocks.push({ type: 'ul', items })
      continue
    }
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      // table — header | separator | rows
      const header = trimmed.split('|').slice(1, -1).map(s => s.trim())
      i++
      // skip separator row (|---|---|)
      if (i < lines.length && lines[i].trim().match(/^\|[\s-:]+\|/)) i++
      const rows: string[][] = []
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        rows.push(lines[i].trim().split('|').slice(1, -1).map(s => s.trim()))
        i++
      }
      blocks.push({ type: 'table', header, rows })
      continue
    }

    // paragraph — collect until blank or block-start
    const para: string[] = [trimmed]
    i++
    while (i < lines.length) {
      const t = lines[i].trim()
      if (!t || t.startsWith('## ') || t.startsWith('### ') || t.startsWith('- ') || (t.startsWith('|') && t.endsWith('|'))) break
      para.push(t)
      i++
    }
    blocks.push({ type: 'p', text: para.join(' ') })
  }
  return blocks
}

function renderInline(text: string): React.ReactNode {
  // handle **bold** and `code` inline
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0
  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^(.*?)\*\*([^*]+)\*\*(.*)$/s)
    const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)$/s)
    if (boldMatch && (!codeMatch || (boldMatch.index ?? 0) <= (codeMatch.index ?? 0))) {
      if (boldMatch[1]) parts.push(boldMatch[1])
      parts.push(<strong key={key++}>{boldMatch[2]}</strong>)
      remaining = boldMatch[3]
      continue
    }
    if (codeMatch) {
      if (codeMatch[1]) parts.push(codeMatch[1])
      parts.push(<code key={key++}>{codeMatch[2]}</code>)
      remaining = codeMatch[3]
      continue
    }
    parts.push(remaining)
    break
  }
  return parts
}

function renderBlock(b: Block, i: number): React.ReactNode {
  switch (b.type) {
    case 'h2':
      return <h2 key={i}>{renderInline(b.text)}</h2>
    case 'h3':
      return <h3 key={i}>{renderInline(b.text)}</h3>
    case 'p':
      return <p key={i}>{renderInline(b.text)}</p>
    case 'ul':
      return (
        <ul key={i}>
          {b.items.map((it, j) => (
            <li key={j}>{renderInline(it)}</li>
          ))}
        </ul>
      )
    case 'table':
      return (
        <table key={i}>
          <thead>
            <tr>
              {b.header.map((h, j) => (
                <th key={j}>{renderInline(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {b.rows.map((row, j) => (
              <tr key={j}>
                {row.map((cell, k) => (
                  <td key={k}>{renderInline(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )
  }
}
