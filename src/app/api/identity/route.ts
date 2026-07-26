import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/identity — create or recover a permanent anonymous user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, recoveryCode, displayName } = body || {}

    if (action === 'recover' && recoveryCode) {
      const user = await db.anonUser.findUnique({ where: { recoveryCode: recoveryCode.trim().toUpperCase() } })
      if (!user) {
        return NextResponse.json({ ok: false, error: 'Invalid recovery code' }, { status: 404 })
      }
      await db.anonUser.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } })
      return NextResponse.json({ ok: true, user: serialize(user) })
    }

    if (action === 'create' || !action) {
      const user = await createUser(displayName)
      return NextResponse.json({ ok: true, user: serialize(user) })
    }

    return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 })
  } catch (e) {
    console.error('identity POST error', e)
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}

// PATCH /api/identity — update displayName or sync lastSeen
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, displayName } = body || {}
    if (!userId) return NextResponse.json({ ok: false, error: 'userId required' }, { status: 400 })

    const user = await db.anonUser.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })

    const data: { lastSeenAt: Date; displayName?: string } = { lastSeenAt: new Date() }
    if (displayName) data.displayName = displayName.slice(0, 40)
    const updated = await db.anonUser.update({ where: { id: userId }, data })
    return NextResponse.json({ ok: true, user: serialize(updated) })
  } catch (e) {
    console.error('identity PATCH error', e)
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}

async function createUser(displayName?: string) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const genPublicId = () => {
    let s = ''
    for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)]
    return `MV-${s}`
  }
  const genRecovery = () => {
    let s = ''
    for (let i = 0; i < 12; i++) s += chars[Math.floor(Math.random() * chars.length)]
    return s
  }

  for (let i = 0; i < 10; i++) {
    const publicId = genPublicId()
    const recoveryCode = genRecovery()
    const existing = await db.anonUser.findFirst({ where: { OR: [{ publicId }, { recoveryCode }] } })
    if (existing) continue

    return await db.anonUser.create({
      data: {
        publicId,
        recoveryCode,
        displayName: (displayName || 'Anonymous Healer').slice(0, 40),
        rank: 'MEDICAL_STUDENT',
        xp: 0,
        casesSolved: 0,
        booksRead: 0,
        topicsMastered: 0,
      },
    })
  }
  throw new Error('Could not allocate unique identity — try again')
}

function serialize(u: {
  id: string
  publicId: string
  recoveryCode: string
  displayName: string
  rank: string
  xp: number
  casesSolved: number
  booksRead: number
  topicsMastered: number
  createdAt: Date
}) {
  return {
    id: u.id,
    publicId: u.publicId,
    recoveryCode: u.recoveryCode,
    displayName: u.displayName,
    rank: u.rank,
    xp: u.xp,
    casesSolved: u.casesSolved,
    booksRead: u.booksRead,
    topicsMastered: u.topicsMastered,
    createdAt: u.createdAt,
  }
}
