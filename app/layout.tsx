import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { SearchProvider } from "@/lib/search-context"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ChopNow - Ghanaian Food Delivery",
  description: "Order delicious Ghanaian food from local vendors",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Suspense fallback={<div>Loading...</div>}>
            <SearchProvider>
              <Navbar />
              <main className="min-h-screen bg-background">{children}</main>
              <Toaster />
            </SearchProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}
