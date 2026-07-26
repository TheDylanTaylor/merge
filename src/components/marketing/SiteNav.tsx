"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";

const LINKS = [
  { href: "#primitives", label: "How it works" },
  { href: "#systems", label: "Systems" },
  { href: "#fundable", label: "Why it matters" },
  { href: "/for-agents", label: "For agents" },
];

export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "color-mix(in srgb, var(--bg) 72%, transparent)"
          : "transparent",
        backdropFilter: scrolled ? "blur(14px) saturate(1.2)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px) saturate(1.2)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo href="/" />
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-[13.5px] text-muted transition-colors hover:text-text"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ButtonLink href="/app" variant="ghost" size="sm" className="hidden md:inline-flex">
            Open app
          </ButtonLink>
          <ButtonLink href="/app" variant="secondary" size="sm" className="hidden sm:inline-flex">
            Review a changeset
            <ArrowRight size={14} />
          </ButtonLink>
          <Link
            href="#fundable"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3.5 text-[13px] font-semibold text-white transition-transform active:scale-[0.98]"
            style={{ background: "#f97316", boxShadow: "0 0 24px -6px rgba(249,115,22,0.75)" }}
          >
            Fund it
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </header>
  );
}
