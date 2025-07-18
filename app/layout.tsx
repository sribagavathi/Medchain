import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Image from "next/image"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MedChain Mavericks",
  description: "Healthcare Supply Integrity Platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Logo in top right corner for all pages */}
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg border border-[#007CC3]/20 hover:shadow-xl transition-all duration-300 hover:scale-110">
            <Image
              src="/logo.png"
              alt="MedChain Logo"
              width={40}
              height={40}
              className="rounded-md hover:scale-110 transition-transform duration-300"
            />
          </div>
        </div>
        {children}
      </body>
    </html>
  )
}
