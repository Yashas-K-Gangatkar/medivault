import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/stats — public stats for the landing page
export async function GET() {
  try {
    const [disciplines, books, topics, cases, users, messages] = await Promise.all([
      db.discipline.count(),
      db.book.count(),
      db.topic.count(),
      db.clinicalCase.count(),
      db.anonUser.count(),
      db.chatMessage.count(),
    ])

    // total XP earned across all users = a proxy for "cases solved globally"
    const usersAgg = await db.anonUser.aggregate({ _sum: { casesSolved: true, xp: true } })

    return NextResponse.json({
      ok: true,
      stats: {
        disciplines,
        books,
        topics,
        cases,
        users,
        messages,
        totalCasesSolved: usersAgg._sum.casesSolved || 0,
        totalXp: usersAgg._sum.xp || 0,
      },
    })
  } catch (e) {
    console.error('stats GET error', e)
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
