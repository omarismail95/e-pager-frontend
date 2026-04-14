import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/providers/query-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { getStaffToken } from '@epager/auth/server'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'E-Pager Staff',
  description: 'E-Pager restaurant staff dashboard',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const token = await getStaffToken()
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="h-full bg-background text-foreground">
        <QueryProvider>
          <AuthProvider initialToken={token}>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
