import type { Metadata } from "next";
import { AppNavigation } from "@/components/AppNavigation";
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
        <AppNavigation />
        <main className="md:ml-64">{children}</main>
      </body>
    </html>
  );
}
