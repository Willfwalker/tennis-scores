import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
          <header className="bg-green-700 text-white shadow-md">
            <div className="container mx-auto p-4">
              <nav className="flex justify-between items-center">
                <a href="/" className="text-xl font-bold">Tennis Score Tracker</a>
                <div className="space-x-4">
                  <a href="/matches/new" className="hover:underline">New Match</a>
                </div>
              </nav>
            </div>
          </header>

          <main className="flex-grow container mx-auto p-4">
            {children}
          </main>

          <footer className="bg-gray-100 border-t">
            <div className="container mx-auto p-4 text-center text-gray-600">
              <p>© {new Date().getFullYear()} Tennis Score Tracker</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
