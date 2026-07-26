import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/chat?since=<ISO>&limit=50  — fetch messages after timestamp
export async function GET(req: NextRequest) {
  try {
    const sinceParam = req.nextUrl.searchParams.get('since')
    const limit = Math.min(Number(req.nextUrl.searchParams.get('limit') || '50'), 100)
    const since = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 1000 * 60 * 60 * 24) // last 24h default

    const messages = await db.chatMessage.findMany({
      where: { createdAt: { gt: since } },
      orderBy: { createdAt: 'asc' },
      take: limit,
    })
    return NextResponse.json({ ok: true, messages })
  } catch (e) {
    console.error('chat GET error', e)
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}

// POST /api/chat — submit a message
// Body: { userId, content, topic?, isCaseDiscussion?, caseId? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, content, topic, isCaseDiscussion, caseId } = body || {}
    if (!userId || !content) {
      return NextResponse.json({ ok: false, error: 'userId and content required' }, { status: 400 })
    }
    const trimmed = String(content).trim().slice(0, 1000)
    if (!trimmed) {
      return NextResponse.json({ ok: false, error: 'Empty message' }, { status: 400 })
    }

    const user = await db.anonUser.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })

    const msg = await db.chatMessage.create({
      data: {
        userId: user.id,
        userPublicId: user.publicId,
        userRank: user.rank,
        userDisplayName: user.displayName,
        content: trimmed,
        topic: topic ? String(topic).slice(0, 40) : null,
        isCaseDiscussion: Boolean(isCaseDiscussion),
        caseId: caseId ? String(caseId) : null,
      },
    })
    return NextResponse.json({ ok: true, message: msg })
  } catch (e) {
    console.error('chat POST error', e)
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}

// PATCH /api/chat — flag a message as a teaching moment (pin) or add a correction
// Body: { messageId, action: 'pin' | 'unpin' | 'flag' | 'correct', correction?, userId }
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { messageId, action, correction, userId } = body || {}
    if (!messageId || !action) return NextResponse.json({ ok: false, error: 'messageId and action required' }, { status: 400 })

    const msg = await db.chatMessage.findUnique({ where: { id: messageId } })
    if (!msg) return NextResponse.json({ ok: false, error: 'Message not found' }, { status: 404 })

    const data: { isPinned?: boolean; isFlagged?: boolean; correction?: string } = {}
    if (action === 'pin') data.isPinned = true
    if (action === 'unpin') data.isPinned = false
    if (action === 'flag') data.isFlagged = true
    if (action === 'correct' && correction) {
      data.isFlagged = true
      data.correction = String(correction).slice(0, 500)
    }
    const updated = await db.chatMessage.update({ where: { id: messageId }, data })
    return NextResponse.json({ ok: true, message: updated })
  } catch (e) {
    console.error('chat PATCH error', e)
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
