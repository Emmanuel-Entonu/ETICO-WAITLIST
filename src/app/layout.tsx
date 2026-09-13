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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
  title: 'ETICO. Ethical investing on the NGX. Join the waitlist.',
  description:
    'ETICO is an ethical way to invest in stocks on the Nigerian Exchange. Join the waitlist for early access at launch.',
  icons: { icon: '/etico-icon.png' },
  openGraph: {
    title: 'ETICO. Ethical investing on the NGX',
    description: 'Join the waitlist for early access at launch.',
    images: ['/hero-trading.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
