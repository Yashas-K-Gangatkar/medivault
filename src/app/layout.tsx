import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Orbitron } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'MEDIVAULT — Open Medical Education for Every Doctor on Earth',
  description:
    'A futuristic, open-source medical education platform. Browse openly licensed textbooks, dive deep into clinical topics, solve real clinical cases, and join a global chat for medical learning. No login. No paywalls. Forever free.',
  keywords: ['medical education', 'open source', 'medical textbooks', 'clinical cases', 'medical library', 'MedlinePlus', 'OpenStax', 'Grays Anatomy', 'free medical education'],
  authors: [{ name: 'MEDIVAULT Open Initiative' }],
  openGraph: {
    title: 'MEDIVAULT — Open Medical Education for Every Doctor on Earth',
    description: 'A futuristic, open-source medical education platform. No login. No paywalls. Forever free.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${orbitron.variable}`}>
      <body className="bg-bg text-fg min-h-screen antialiased">{children}</body>
    </html>
  )
}
