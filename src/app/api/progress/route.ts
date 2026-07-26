import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const RANK_THRESHOLDS = [
  { rank: 'MEDICAL_STUDENT', minXp: 0 },
  { rank: 'INTERN', minXp: 500 },
  { rank: 'RESIDENT', minXp: 1500 },
  { rank: 'ATTENDING', minXp: 4000 },
  { rank: 'CHIEF', minXp: 10000 },
]

function rankForXp(xp: number) {
  let r = 'MEDICAL_STUDENT'
  for (const t of RANK_THRESHOLDS) {
    if (xp >= t.minXp) r = t.rank
  }
  return r
}

// POST /api/progress — record progress on a topic, case, or book
// Body: { userId, itemType, itemId, status, score?, weakAreas? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, itemType, itemId, status, score, weakAreas } = body || {}
    if (!userId || !itemType || !itemId) {
      return NextResponse.json({ ok: false, error: 'userId, itemType, itemId required' }, { status: 400 })
    }
    if (!['TOPIC', 'CASE', 'BOOK'].includes(itemType)) {
      return NextResponse.json({ ok: false, error: 'Invalid itemType' }, { status: 400 })
    }
    if (!['STARTED', 'COMPLETED', 'MASTERED'].includes(status)) {
      return NextResponse.json({ ok: false, error: 'Invalid status' }, { status: 400 })
    }

    const user = await db.anonUser.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })

    // upsert progress record
    const existing = await db.userProgress.findUnique({
      where: { userId_itemType_itemId: { userId, itemType, itemId } },
    })

    const wasCompleted = existing?.status === 'COMPLETED' || existing?.status === 'MASTERED'
    const isCompleted = status === 'COMPLETED' || status === 'MASTERED'

    const progress = await db.userProgress.upsert({
      where: { userId_itemType_itemId: { userId, itemType, itemId } },
      update: { status, score: score ?? existing?.score, weakAreas: weakAreas ? JSON.stringify(weakAreas) : existing?.weakAreas, updatedAt: new Date() },
      create: { userId, itemType, itemId, status, score, weakAreas: weakAreas ? JSON.stringify(weakAreas) : null },
    })

    // If transitioning to completed for the first time, award XP
    let xpDelta = 0
    if (isCompleted && !wasCompleted) {
      if (itemType === 'CASE') {
        // award case XP from the case's xpReward
        const c = await db.clinicalCase.findUnique({ where: { slug: itemId } })
        xpDelta = c?.xpReward || 100
        await db.anonUser.update({
          where: { id: userId },
          data: {
            casesSolved: { increment: 1 },
            xp: { increment: xpDelta },
          },
        })
      } else if (itemType === 'TOPIC') {
        xpDelta = 50
        await db.anonUser.update({
          where: { id: userId },
          data: {
            topicsMastered: { increment: 1 },
            xp: { increment: xpDelta },
          },
        })
      } else if (itemType === 'BOOK') {
        xpDelta = 75
        await db.anonUser.update({
          where: { id: userId },
          data: {
            booksRead: { increment: 1 },
            xp: { increment: xpDelta },
          },
        })
      }
    }

    const updated = await db.anonUser.findUnique({ where: { id: userId } })
    if (!updated) return NextResponse.json({ ok: false, error: 'User lost' }, { status: 500 })

    // rank up?
    const newRank = rankForXp(updated.xp)
    if (newRank !== updated.rank) {
      await db.anonUser.update({ where: { id: userId }, data: { rank: newRank } })
      updated.rank = newRank
    }

    return NextResponse.json({
      ok: true,
      progress,
      xpDelta,
      user: {
        id: updated.id,
        publicId: updated.publicId,
        rank: updated.rank,
        xp: updated.xp,
        casesSolved: updated.casesSolved,
        booksRead: updated.booksRead,
        topicsMastered: updated.topicsMastered,
      },
      rankedUp: newRank !== user.rank,
    })
  } catch (e) {
    console.error('progress POST error', e)
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}

// GET /api/progress?userId=...  — list all progress records for the user
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) return NextResponse.json({ ok: false, error: 'userId required' }, { status: 400 })

    const progress = await db.userProgress.findMany({ where: { userId } })
    const user = await db.anonUser.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 })

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        publicId: user.publicId,
        displayName: user.displayName,
        rank: user.rank,
        xp: user.xp,
        casesSolved: user.casesSolved,
        booksRead: user.booksRead,
        topicsMastered: user.topicsMastered,
      },
      progress: progress.map(p => ({
        ...p,
        weakAreas: p.weakAreas ? JSON.parse(p.weakAreas) : null,
      })),
    })
  } catch (e) {
    console.error('progress GET error', e)
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
