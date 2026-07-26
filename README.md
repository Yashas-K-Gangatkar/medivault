# 🩺 MEDIVAULT

> A futuristic, open-source medical education platform for every doctor on Earth.
> No login. No paywalls. Forever free.

MEDIVAULT is a single Next.js web app where any doctor or medical student can:

- **Learn** — browse a futuristic digital library of openly licensed medical textbooks (Public Domain + CC BY 4.0 + CC BY-SA 4.0)
- **Go deep** — every topic has 4 layered depth levels (TL;DR → Overview → Full Explanation → 1500+ word Deep Dive)
- **Practice** — solve real clinical cases through a 6-phase diagnostic flow with scoring and teaching points
- **Progress** — earn ranks (Medical Student → Intern → Resident → Attending → Chief) with permanent XP
- **Teach** — join a global real-time medical chat with flag/pin/correct features for learning from mistakes

All without an account. You get a permanent anonymous ID + recovery code the moment you arrive.

---

## ✨ Features

- **No-login permanent identity** — localStorage UUID + 12-character recovery code, recoverable on any device
- **Openly licensed content only** — Gray's Anatomy 1918 (Public Domain), OpenStax A&P & Biology (CC BY 4.0), BCCampus Pharmacology (CC BY 4.0), Wikibooks (CC BY-SA 4.0), NCBI Bookshelf & MedlinePlus (Public Domain, US Gov)
- **4-layer topic depth** — TL;DR · 120-word overview · 500-word full explanation · 1500+ word deep dive with pathophysiology, drug dosing, red flags, evidence, references
- **6-phase case simulator** — Presentation → History → Exam → Orders → Differential → Debrief with scoring (100/60/30) and teaching points
- **Knowledge Atlas** — interactive SVG node graph showing how disciplines and clinical topics connect
- **Global medical chat** — real-time shared room with topic tags, case-discussion flags, and mistake-teaching tools (flag, pin, correct)
- **Futuristic design** — holographic dark theme, rotating 3D-feel body in hero, glassmorphism panels, scan-line sweeps, Web Audio synthesized UI sounds
- **Fully responsive** — desktop, tablet, mobile (390px verified)
- **Educational disclaimer** — clear "educational use only" notice; not a substitute for clinical judgment

---

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript 5
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **Database:** Prisma ORM + SQLite
- **Audio:** Web Audio API (synthesized — no asset files)
- **Fonts:** Orbitron (display), Inter (body), JetBrains Mono (data)
- **Images:** AI-generated futuristic medical imagery (committed to `/public/medivault/`)
- **License:** MIT (code) + CC BY-SA 4.0 (content)

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 18+ (or [Bun](https://bun.sh) 1.1+)
- A terminal, a browser

### Install & Run

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/medivault.git
cd medivault

# Install dependencies (use whichever you prefer)
npm install
# OR
bun install

# Set up the database
cp .env.example .env
npx prisma db push
npm run seed   # seeds 6 disciplines, 8 books, 6 topics, 10 clinical cases

# Start the dev server
npm run dev
# → http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) — your permanent ID appears in the top-right corner. Write down the recovery code in the Progress section.

---

## 📦 Deployment

MEDIVAULT works on any platform that supports Next.js. See **[DEPLOY.md](./DEPLOY.md)** for complete step-by-step instructions for:

- **Vercel** (recommended — free tier covers MEDIVAULT easily)
- **Netlify**
- **Self-hosting with Docker** (one command, no cloud dependency)
- **Self-hosting on a VPS** (Ubuntu/Debian + Nginx + Let's Encrypt)

You can use any domain you own — instructions for DNS configuration are in the guide.

---

## 📁 Project Structure

```
medivault/
├── prisma/
│   └── schema.prisma          # Database models: AnonUser, Discipline, Book, Topic, ClinicalCase, ChatMessage, UserProgress
├── public/
│   └── medivault/             # AI-generated futuristic medical imagery
├── scripts/
│   └── seed.ts                # Database seed — disciplines, books, topics, cases
├── src/
│   ├── app/
│   │   ├── api/               # API routes: /identity, /chat, /progress, /library, /cases, /stats
│   │   ├── globals.css        # Holographic theme, glass panels, animations
│   │   ├── layout.tsx         # Fonts + metadata
│   │   └── page.tsx           # Main page assembling all sections
│   ├── components/
│   │   ├── medivault/         # Hero, Library, CaseSimulator, KnowledgeAtlas, ProgressDashboard, GlobalChat, AboutMission, SiteHeader
│   │   ├── markdown.tsx       # Minimal markdown renderer for topic content
│   │   └── ui/                # shadcn/ui primitives
│   ├── hooks/
│   │   ├── use-identity.ts    # Permanent no-login identity
│   │   └── use-sounds.ts      # Web Audio synth
│   └── lib/
│       ├── db.ts              # Prisma client
│       └── utils.ts           # cn() helper
├── .env.example               # Copy to .env and adjust
├── DEPLOY.md                  # Full deployment guide
├── Dockerfile                 # Self-hosting Docker config
├── docker-compose.yml         # One-command Docker deploy
├── LICENSE                    # MIT (code) + CC BY-SA 4.0 (content)
└── README.md                  # This file
```

---

## 🤝 Contributing

Contributions welcome! See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for guidelines on:

- Adding new clinical cases
- Adding new topics and disciplines
- Improving the design system
- Translating content (Spanish, Hindi, Mandarin, Arabic, French — all welcome)
- Reporting issues

**Special call for clinicians:** if you have a teaching case you'd like to share, please open a PR. We're especially seeking cases from pediatrics, OB/GYN, emergency medicine, and global health.

---

## 📚 Open-Source Books Referenced

Every book in our library is openly licensed. We never host copyrighted content.

| Book | License | Source |
|------|---------|--------|
| Gray's Anatomy of the Human Body (1918 ed.) | Public Domain | [bartleby.com/107](https://www.bartleby.com/107/) |
| OpenStax Anatomy & Physiology 2e | CC BY 4.0 | [openstax.org](https://openstax.org/details/books/anatomy-and-physiology-2e) |
| OpenStax Biology 2e | CC BY 4.0 | [openstax.org](https://openstax.org/details/books/biology-2e) |
| BCCampus Pharmacology | CC BY 4.0 | [opentextbc.ca/pharmacology](https://opentextbc.ca/pharmacology/) |
| Wikibooks Human Physiology | CC BY-SA 4.0 | [en.wikibooks.org](https://en.wikibooks.org/wiki/Human_Physiology) |
| Wikibooks Emergency Medicine | CC BY-SA 4.0 | [en.wikibooks.org](https://en.wikibooks.org/wiki/Emergency_Medicine) |
| MedlinePlus Medical Encyclopedia | Public Domain (US Gov) | [medlineplus.gov](https://medlineplus.gov/encyclopedia.html) |
| NCBI Bookshelf (Surgeon General reports) | Public Domain (US Gov) | [ncbi.nlm.nih.gov/books](https://www.ncbi.nlm.nih.gov/books/) |

We are not affiliated with these organizations — we link to their openly licensed content with gratitude.

---

## ⚠️ Educational Use Only

MEDIVAULT is for educational purposes only. It is **not** a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers with questions about medical conditions. Never disregard professional medical advice because of something you read here. In an emergency, call your local emergency number.

---

## 📄 License

- **Code:** [MIT License](./LICENSE)
- **Content (topic explanations, clinical cases, teaching points):** [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

You are free to:
- ✅ Use MEDIVAULT for any purpose
- ✅ Fork, modify, and redistribute
- ✅ Host on your own domain (commercial or non-commercial)
- ✅ Add your own cases and content

You must:
- ⚠️ Attribute the original MEDIVAULT project
- ⚠️ Share derivative content under the same CC BY-SA 4.0 license
- ⚠️ Keep the educational disclaimer visible

---

## 🌍 Join the Mission

MEDIVAULT exists because medical knowledge should flow freely to anyone who wants to heal. If you'd like to help:

- ⭐ Star this repo
- 🔄 Fork and add cases from your specialty
- 🌐 Translate content into your language
- 📢 Share with medical students and colleagues
- 🐛 Report bugs and request features via Issues

**Made with 💙 for every clinician, everywhere.**
