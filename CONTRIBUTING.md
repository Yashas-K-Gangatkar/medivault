# 🤝 Contributing to MEDIVAULT

First off — **thank you** for considering a contribution. MEDIVAULT exists because medical knowledge should flow freely to anyone who wants to heal. Every contribution, big or small, helps.

## 📋 Code of Conduct

Be kind. Be specific. Be respectful of different backgrounds, training levels, and languages. We're all here to learn and teach.

---

## 🐛 Reporting Bugs

Open an issue at `https://github.com/YOUR_USERNAME/medivault/issues` and include:

1. **What you expected to happen**
2. **What actually happened**
3. **Steps to reproduce** (be specific)
4. **Your environment:** browser + OS, deployment method (Vercel / Docker / local)
5. **Screenshots or console output** if applicable

---

## ✨ Suggesting Features

We'd love to hear from you, especially if you're a clinician. Features we'd particularly welcome:

- 🩺 **New clinical cases** — especially pediatrics, OB/GYN, emergency medicine, dermatology, radiology
- 📚 **New topics and disciplines** — psychiatry, oncology, infectious disease, rheumatology
- 🌐 **Translations** — Spanish, Hindi, Mandarin, Arabic, French, Portuguese, Swahili
- 🎨 **Design improvements** — accessibility, contrast, mobile UX
- 🧠 **New case simulator features** — multi-step lab ordering, imaging viewer, ECG annotation
- 🔊 **Audio** — foley sounds, ambient loops, accessibility cues
- 📊 **Analytics** — voluntary, anonymous, opt-in only

Open a GitHub Discussion first for big features — let's align before you build.

---

## 🛠 Development Setup

```bash
git clone https://github.com/YOUR_USERNAME/medivault.git
cd medivault
npm install
cp .env.example .env
npx prisma db push
npm run seed
npm run dev
```

Open `http://localhost:3000`.

### Project Structure

- `prisma/schema.prisma` — database models
- `scripts/seed.ts` — content seeding (this is where you add cases/topics)
- `src/app/api/` — API routes
- `src/app/page.tsx` — main page
- `src/components/medivault/` — section components
- `src/components/ui/` — shadcn/ui primitives (don't edit unless necessary)
- `public/medivault/` — generated images

---

## ➕ Adding a Clinical Case

Open `scripts/seed.ts` and add a new entry to the `cases` array. Each case has:

```typescript
{
  slug: 'case-unique-slug',           // URL-safe, unique
  title: 'Short, descriptive title',
  chiefComplaint: 'One-line summary',
  specialty: 'Cardiology',            // matches an existing discipline name
  difficulty: 'EASY' | 'MEDIUM' | 'HARD',
  organSystem: 'Cardiovascular',
  briefImage: '/medivault/your-image.png',  // optional
  presentation: 'Patient presentation...',
  history: 'History details...',
  exam: 'Physical exam findings...',
  orders: JSON.stringify([
    { name: 'Test name', turnaround: 'Time', result: 'Value', interpretation: 'What it means' }
  ]),
  differentials: JSON.stringify([
    { diagnosis: 'Name', isCorrect: true,  explanation: 'Why this is the answer' },
    { diagnosis: 'Name', isCorrect: false, explanation: 'Why this is wrong' }
  ]),
  correctDiagnosis: 'Final diagnosis name',
  diagnosisExplanation: 'Why this is the diagnosis',
  teachingPoints: 'Numbered list of key learning points',
  redFlags: 'What to never miss',
  xpReward: 100,                      // 80 (easy), 100-130 (medium), 150-200 (hard)
  disciplineSlug: 'cardiology',       // matches a Discipline slug
}
```

**Content guidelines:**

- Use realistic but anonymized patient details (no real names, dates, or identifying info)
- Base teaching points on standard references (Robbins, Harrison's — paraphrased, never copied)
- Avoid copyrighted verbatim text — always rewrite in your own words
- Include 4-5 differential diagnoses with clear explanations
- Make the teaching points actionable and specific (not generic advice)
- Test your case locally before submitting

---

## ➕ Adding a Topic

Open `scripts/seed.ts` and add to the `topics` array:

```typescript
{
  slug: 'unique-slug',
  title: 'Topic Title',
  disciplineSlug: 'cardiology',
  bookSlug: 'medlineplus-encyclopedia',  // reference an openly licensed book
  tldr: 'One-line summary.',
  overview: '~120-word paragraph giving the high-level picture.',
  fullExplanation: 'Markdown-formatted ~500-word explanation with ## headings, - bullets, | tables |',
  deepDive: 'Markdown-formatted 1500+ word deep dive with pathophysiology, drugs (with doses), red flags, evidence, and an "Open Source Reading" section linking to openly licensed sources.',
  heroImage: '/medivault/your-image.png',
  tags: JSON.stringify(['tag1', 'tag2']),
  relatedTopicSlugs: JSON.stringify(['other-topic-slug']),
}
```

**Content guidelines:**

- All clinical content must be paraphrased from open references — never copy from copyrighted textbooks
- Include drug doses in the deep dive (e.g., "aspirin 300 mg chewed")
- Cite evidence with trial names (e.g., "SPRINT trial, NEJM 2015")
- End the deep dive with an "Open Source Reading" section linking to PD / CC BY / CC BY-SA sources

---

## 🎨 Design System

The design system lives in `src/app/globals.css`. Key concepts:

- **Colors:** `--color-bg` (deep navy), `--color-cyan` (#00e8ff), `--color-bio` (#6cff9c bioluminescent green), `--color-amber` (warnings), `--color-rose` (errors)
- **Glass panels:** `.glass` (semi-transparent) and `.glass-strong` (more opaque, with glow border)
- **Animations:** `.holo-rotate` (rotating hero), `.pulse-bio` (vital signs), `.scan-card` (scan-line on hover), `.fade-in` (entry)
- **Fonts:** Orbitron (display), Inter (body), JetBrains Mono (data) — loaded via `next/font/google`
- **Custom scrollbar:** cyan-to-teal gradient

When adding components:
- Reuse `.glass`, `.glow-border`, `.scan-card` utility classes — don't reinvent
- Honor `prefers-reduced-motion` (the CSS already handles this)
- Test at 390px width (mobile) — use Tailwind responsive prefixes
- Run `npm run lint` before committing

---

## 🔊 Audio

All UI sounds are synthesized at runtime via Web Audio API in `src/hooks/use-sounds.ts`. No asset files. Three functions: `beep(freq, duration)`, `chime()`, `scan()`. They auto-unlock on first user interaction.

To add new sounds, follow the same pattern — synthesize from oscillators and noise buffers. Don't add audio files (keeps the bundle small).

---

## 📝 Commit Messages

Use clear, descriptive messages:

- `add: case — pediatric asthma exacerbation`
- `fix: chat polling race condition on rapid sends`
- `feat: topic — heart failure with reduced EF`
- `style: refine glass panel contrast on dark mode`
- `docs: clarify Vercel SQLite caveat in DEPLOY.md`

Reference issues: `fix: #42 case debrief score not persisting`

---

## 🔄 Pull Request Process

1. **Fork** the repo and create a branch: `git checkout -b feature/my-new-case`
2. **Make your changes** — keep commits focused and small
3. **Test locally:** `npm run lint`, then exercise your feature in the browser
4. **Update the seed** if you added cases/topics
5. **Open a PR** with a clear description:
   - What you added/changed
   - Why (especially for clinical content — cite sources)
   - Screenshots if UI changed
   - Any known limitations

A maintainer will review within 1-3 days. We may suggest changes — please be receptive.

---

## 📜 Licensing Your Contribution

By submitting a PR, you agree your contribution will be licensed under:
- **MIT** for code
- **CC BY-SA 4.0** for medical content (topic explanations, cases, teaching points)

If you don't agree, please don't submit. We need to keep the content freely shareable.

---

## 🌍 Translations

Want to translate MEDIVAULT into your language? Here's the plan:

1. Open a discussion first so we can coordinate (avoid duplicate efforts)
2. We'll add a `LOCALE` column to the Topic and ClinicalCase tables
3. You translate the `tldr`, `overview`, `fullExplanation`, `deepDive` fields
4. We add a language switcher to the header

**Priority languages:** Spanish, Hindi, Mandarin, Arabic, French, Portuguese, Swahili.

---

## 💬 Questions?

- Open a GitHub Discussion for general questions
- Open a GitHub Issue for bugs or specific feature requests
- Use the in-app Global Chat to talk to other contributors

Thank you for helping make medical knowledge open to every doctor on Earth. 🌍
