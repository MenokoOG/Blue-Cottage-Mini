import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AuthButton from "@/components/AuthButton";

export const metadata: Metadata = {
  title: {
    default: "Blue Cottage Mini: A Tour of ITF Taekwon-Do",
    template: "%s | Blue Cottage Mini",
  },
  description:
    "A tour of the 24 ITF Taekwon-Do patterns, led by a Master Instructor and a swarm of belt and pattern agents. Every fact cited, every video credited.",
  applicationName: "Blue Cottage Mini",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12263a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh">
        <AuthProvider>
          <header className="sticky top-0 z-10 border-b-2 border-cottage bg-ink">
            <nav
              aria-label="Main"
              className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-x-4 gap-y-2.5 px-4 py-3.5"
            >
              <Link
                href="/"
                className="whitespace-nowrap font-display text-[16px] font-bold uppercase leading-tight tracking-[0.12em] text-paper sm:text-[17px] sm:tracking-[0.14em]"
              >
                Blue Cottage <span className="text-cottage">Mini</span>
              </Link>
              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
                <Link href="/agents" className="bc-nav-link">
                  Agents
                </Link>
                <Link href="/progress" className="bc-nav-link">
                  Progress
                </Link>
                <Link href="/coach" className="bc-nav-link">
                  Coach
                </Link>
                <AuthButton />
              </div>
            </nav>
          </header>
          <main className="pb-16">{children}</main>
          <footer className="border-t border-muted/30 bg-paper-shade px-4 py-8">
            <div className="mx-auto flex max-w-2xl flex-col gap-3 font-mono text-[11px] leading-relaxed tracking-[0.06em] text-muted-deep">
              <p>
                Blue Cottage Mini: A Tour of ITF Taekwon-Do. Built under the direction of Master
                Lawrence Jefferson, 7th Degree, International Master Instructor.
              </p>
              <p className="flex flex-wrap gap-x-4 gap-y-1">
                <Link href="/about" className="bc-link text-ink">
                  About
                </Link>
                <Link href="/sources" className="bc-link text-ink">
                  Sources and licences
                </Link>
              </p>
              <p>Study help, not a substitute for instruction in the dojang.</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
