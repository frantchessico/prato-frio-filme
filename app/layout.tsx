import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ErrorBoundary } from "@/components/error-boundary"
import { ProvidersWrapper } from "@/components/providers-wrapper"
import { Toaster } from "sonner"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Prato Frio - Filme Moçambicano",
    template: "%s | Prato Frio"
  },
  description: "Assista ao filme 'Prato Frio', uma produção moçambicana que captura histórias em movimento. Apoie o cinema nacional e desfrute de uma experiência cinematográfica única.",
  keywords: ["filme moçambicano", "cinema moçambique", "prato frio", "filme", "cinema nacional", "produção moçambicana"],
  authors: [{ name: "SavanaPoint" }],
  creator: "SavanaPoint",
  publisher: "SavanaPoint",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://pratofrio.com'),
  alternates: {
    canonical: '/',
    languages: {
      'pt-BR': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://pratofrio.com',
    title: 'Prato Frio - Filme Moçambicano',
    description: 'Assista ao filme "Prato Frio", uma produção moçambicana que captura histórias em movimento.',
    siteName: 'Prato Frio',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Prato Frio - Filme Moçambicano',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prato Frio - Filme Moçambicano',
    description: 'Assista ao filme "Prato Frio", uma produção moçambicana que captura histórias em movimento.',
    images: ['/twitter-image.jpg'],
    creator: '@savanapoint',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  other: {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <meta name="theme-color" content="#d4312c" />
        <meta name="color-scheme" content="light dark" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`font-sans antialiased ${GeistSans.variable} ${GeistMono.variable} ${playfair.variable}`}>
        <div id="root" className="min-h-screen flex flex-col">
          <ErrorBoundary>
            <ProvidersWrapper>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                {children}
              </Suspense>
            </ProvidersWrapper>
            <Analytics />
            <Toaster 
              position="top-right"
              expand={true}
              richColors={true}
              closeButton={true}
              toastOptions={{
                duration: 4000,
                className: 'toast',
              }}
            />
          </ErrorBoundary>
        </div>
        <div id="portal-root" />
      </body>
    </html>
  )
}
