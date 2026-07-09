import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JLPT N5 Study",
  description: "Vocabulary, flashcards, quizzes, and progress for JLPT N5.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
            <a className="text-lg font-semibold text-slate-950" href="/">
              JLPT N5 Study
            </a>
            <div className="flex flex-wrap gap-2 text-sm font-medium">
              <a className="nav-link" href="/vocabulary">
                Vocabulary
              </a>
              <a className="nav-link" href="/flashcards">
                Flashcards
              </a>
              <a className="nav-link" href="/quiz">
                Quiz
              </a>
              <a className="nav-link" href="/progress">
                Progress
              </a>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
