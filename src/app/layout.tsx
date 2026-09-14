import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const sora = Sora({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-display',
})

// Absolute base for OG/Twitter image URLs. Prefer the explicit SITE_URL (your
// custom domain); fall back to Vercel's production URL so previews never point
// at localhost in production; localhost only in local dev.
const siteUrl =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined) ??
  'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'ETICO. Ethical investing on the NGX. Join the waitlist.',
  description:
    'ETICO is an ethical way to invest in stocks on the Nigerian Exchange. Join the waitlist for early access at launch.',
  icons: { icon: '/etico-icon.png' },
  openGraph: {
    type: 'website',
    title: 'ETICO. Ethical investing on the NGX',
    description: 'Join the waitlist for early access at launch.',
    images: [{ url: '/og.jpg', width: 1200, height: 630, type: 'image/jpeg', alt: 'ETICO — Join the Waitlist' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ETICO. Ethical investing on the NGX',
    description: 'Join the waitlist for early access at launch.',
    images: ['/og.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
