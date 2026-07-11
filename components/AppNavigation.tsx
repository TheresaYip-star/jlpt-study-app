"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navigation = [
  { href: "/vocabulary", label: "Vocabulary", icon: BookIcon },
  { href: "/flashcards", label: "Flashcards", icon: CardsIcon },
  { href: "/quiz", label: "Quiz", icon: QuizIcon },
  { href: "/progress", label: "Progress", icon: ProgressIcon },
];

export function AppNavigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => setIsOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <Brand />
        <button
          type="button"
          className="grid size-10 place-items-center rounded-lg text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen(true)}
        >
          <MenuIcon />
        </button>
      </header>

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-20 items-center border-b border-slate-100 px-6">
          <Brand />
        </div>
        <NavLinks pathname={pathname} />
        <div className="mt-auto border-t border-slate-100 px-6 py-5 text-xs leading-5 text-slate-500">
          <span className="font-semibold text-slate-700">JLPT N5</span>
          <br />Build your Japanese foundation
        </div>
      </aside>

      <div
        className={`fixed inset-0 z-40 bg-slate-950/40 transition-opacity duration-200 md:hidden ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
      />
      <aside
        id="mobile-navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(20rem,85vw)] flex-col bg-white shadow-2xl transition-transform duration-200 ease-out md:hidden ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-hidden={!isOpen}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
          <Brand />
          <button
            type="button"
            className="grid size-10 place-items-center rounded-lg text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            aria-label="Close navigation menu"
            onClick={() => setIsOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>
        <NavLinks pathname={pathname} />
      </aside>
    </>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3 text-slate-950 no-underline">
      <span className="grid size-10 place-items-center rounded-xl bg-blue-600 text-lg font-black text-white">日</span>
      <span>
        <span className="block text-base font-bold leading-tight">JLPT Study</span>
        <span className="block text-xs font-medium text-slate-500">N5 learning path</span>
      </span>
    </Link>
  );
}

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <nav className="flex-1 px-3 py-6" aria-label="Primary navigation">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Study</p>
      <ul className="space-y-1">
        {navigation.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon />
                {label}
                {isActive && <span className="ml-auto size-1.5 rounded-full bg-blue-600" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MenuIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" /></svg>;
}

function CloseIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" /></svg>;
}

function BookIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16ZM20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" /></svg>;
}

function CardsIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="3" width="14" height="17" rx="2" /><path strokeLinecap="round" d="M9 7h6M9 11h4M3 7v12a2 2 0 0 0 2 2h10" /></svg>;
}

function QuizIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M7 3h10a2 2 0 0 1 2 2v16H5V5a2 2 0 0 1 2-2Z" /><path strokeLinecap="round" d="M9 8h6M9 12h6M9 16h3" /></svg>;
}

function ProgressIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M4 20V10h4v10H4Zm6 0V4h4v16h-4Zm6 0v-7h4v7h-4Z" /></svg>;
}
