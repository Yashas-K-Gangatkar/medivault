import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/cases — list all cases (summary view)
// GET /api/cases?slug=...  — single case with full content
// GET /api/cases?specialty=Cardiology — filter by specialty
// GET /api/cases?difficulty=EASY — filter by difficulty
export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug')
    const specialty = req.nextUrl.searchParams.get('specialty')
    const difficulty = req.nextUrl.searchParams.get('difficulty')

    if (slug) {
      const c = await db.clinicalCase.findUnique({ where: { slug }, include: { discipline: true } })
      if (!c) return NextResponse.json({ ok: false, error: 'Case not found' }, { status: 404 })
      return NextResponse.json({
        ok: true,
        case: {
          ...c,
          orders: JSON.parse(c.orders),
          differentials: JSON.parse(c.differentials),
        },
      })
    }

    const where: { specialty?: string; difficulty?: string } = {}
    if (specialty) where.specialty = specialty
    if (difficulty) where.difficulty = difficulty

    const cases = await db.clinicalCase.findMany({
      where,
      orderBy: { difficulty: 'asc' },
      select: {
        slug: true,
        title: true,
        chiefComplaint: true,
        specialty: true,
        difficulty: true,
        organSystem: true,
        briefImage: true,
        xpReward: true,
        presentation: true,
      },
    })
    return NextResponse.json({ ok: true, cases })
  } catch (e) {
    console.error('cases GET error', e)
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
