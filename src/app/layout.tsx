import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TeleoLogoWithText } from "@/components/teleo-logo"
import { NavBar } from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TELEO Services - GovCon Tracker",
  description: "TELEO Services Government Contract Management System - Track contracts, vendors, and opportunities",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/teleo-icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/teleo-icon.svg" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <NavBar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t bg-gray-50 mt-auto">
            <div className="container mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  © {new Date().getFullYear()} TELEO Services. All rights reserved.
                </div>
                <div className="text-sm text-gray-500">
                  Powered by TELEO Services Contract Management Platform
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}