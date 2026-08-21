import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ResQMesh — AI-Powered Emergency Response Decision Support System',
  description: 'AI-assisted, Geospatial & Decision Support dispatch platform designed to coordinate emergency responses.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#0b0f19] text-slate-100`}>
        {/* Navigation Bar */}
        <header className="border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur sticky top-0 z-50">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 font-extrabold text-white siren-ping">
                  Ω
                </span>
                ResQMesh
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 siren-ping" />
                Live Node Feed
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 bg-[#070b13] py-4 text-center text-xs text-slate-500">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            ResQMesh Emergency Command Center © 2026. Secure Government Instance.
          </div>
        </footer>
      </body>
    </html>
  )
}
