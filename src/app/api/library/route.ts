import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/library — list all disciplines with their books
// GET /api/library?discipline=cardiology — single discipline with books
// GET /api/library?book=grays-anatomy-1918 — single book with topics
// GET /api/library?topic=coronary-artery-disease — single topic with layered depth
export async function GET(req: NextRequest) {
  try {
    const disciplineSlug = req.nextUrl.searchParams.get('discipline')
    const bookSlug = req.nextUrl.searchParams.get('book')
    const topicSlug = req.nextUrl.searchParams.get('topic')

    if (topicSlug) {
      const topic = await db.topic.findUnique({
        where: { slug: topicSlug },
        include: { discipline: true, book: true },
      })
      if (!topic) return NextResponse.json({ ok: false, error: 'Topic not found' }, { status: 404 })
      return NextResponse.json({
        ok: true,
        topic: {
          ...topic,
          tags: topic.tags ? JSON.parse(topic.tags) : [],
          relatedTopicSlugs: topic.relatedTopicSlugs ? JSON.parse(topic.relatedTopicSlugs) : [],
        },
      })
    }

    if (bookSlug) {
      const book = await db.book.findUnique({
        where: { slug: bookSlug },
        include: { discipline: true, topics: true },
      })
      if (!book) return NextResponse.json({ ok: false, error: 'Book not found' }, { status: 404 })
      return NextResponse.json({ ok: true, book })
    }

    if (disciplineSlug) {
      const discipline = await db.discipline.findUnique({
        where: { slug: disciplineSlug },
        include: { books: true, topics: true, cases: true },
      })
      if (!discipline) return NextResponse.json({ ok: false, error: 'Discipline not found' }, { status: 404 })
      return NextResponse.json({ ok: true, discipline })
    }

    // no params — list everything
    const disciplines = await db.discipline.findMany({
      include: { books: true, _count: { select: { topics: true, cases: true } } },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ ok: true, disciplines })
  } catch (e) {
    console.error('library GET error', e)
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 })
  }
}
