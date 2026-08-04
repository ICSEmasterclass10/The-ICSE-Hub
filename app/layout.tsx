import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Cinzel } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})
const cinzel = Cinzel({
  variable: '--font-cinzel',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

// REPLACED ONLY THIS METADATA BLOCK FOR SEO & GOOGLE VERIFICATION
export const metadata: Metadata = {
  title: 'The ICSE Hub | ICSE Class 10 Board Exam Dashboard & Notes',
  description:
    'Access free ICSE Class 10 chapter-wise video lectures, high-performance physics mnemonics, structured board notes, and automated focus tools designed for the 2026-27 batch by ICSE MasterClass.',
  keywords: ['ICSE Class 10', 'ICSE Board Notes', 'ICSE Physics One Shot', 'ICSE MasterClass', 'ICSE Hub', 'Class 10 Board Prep', 'Free ICSE Notes'],
  generator: 'v0.app',
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  verification: {
    google: 'XoBnGavN1YlsIka6AgjgXplREYGYS-0qIOlX94m7MS0',
    pinterest: 'bbe7aa50ed21ae3a94d83f6a9c89fe09',
  },
  openGraph: {
    title: 'The ICSE Hub | Complete Class 10 Study Dashboard',
    description: 'Free chapter-wise lectures, premium board notes, and focus utilities tailored strictly for the ICSE Class 10 curriculum.',
    type: 'website',
    siteName: 'The ICSE Hub by ICSE MasterClass',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0b1d3a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`light ${geistSans.variable} ${geistMono.variable} ${cinzel.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
