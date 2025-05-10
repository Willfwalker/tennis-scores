import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tennis Score Tracker",
  description: "Track and update tennis match scores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col min-h-screen">
          <header style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }} className="shadow-md">
            <div className="container mx-auto p-4">
              <nav className="flex justify-between items-center">
                <Link href="/" className="text-xl font-bold">Tennis Score Tracker</Link>
                <div className="space-x-4">
                  <Button asChild style={{ backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>
                    <Link href="/matches/new">New Match</Link>
                  </Button>
                </div>
              </nav>
            </div>
          </header>

          <main className="flex-grow container mx-auto p-4 py-8">
            {children}
          </main>

          <footer style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }} className="border-t">
            <div className="container mx-auto p-4 text-center">
              <p>© {new Date().getFullYear()} Tennis Score Tracker</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
