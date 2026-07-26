"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/ui/Logo";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";

type NavItem = { href: string; label: string; icon: ReactNode };
type NavGroup = { label: string; items: NavItem[] };

function Icon({ d, fill = false }: { d: string; fill?: boolean }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={fill ? "currentColor" : "none"}
      />
    </svg>
  );
}

const GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      {
        href: "/app",
        label: "Overview",
        icon: <Icon d="M4 13h6V4H4v9ZM14 20h6V4h-6v16ZM4 20h6v-4H4v4Z" />,
      },
      {
        href: "/app/integrations",
        label: "Integrations",
        icon: <Icon d="M9 3v4M15 3v4M6 7h12l-1 6a5 5 0 0 1-10 0L6 7ZM12 18v3" />,
      },
    ],
  },
  {
    label: "Governance",
    items: [
      {
        href: "/app/activity",
        label: "Activity",
        icon: <Icon d="M3 12h4l2 6 4-14 2 8h6" />,
      },
      {
        href: "/app/settings",
        label: "Settings",
        icon: <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 2.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H7a1.6 1.6 0 0 0 1-1.5V1a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V7a1.6 1.6 0 0 0 1.5 1H23a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />,
      },
    ],
  },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className="relative flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13.5px] transition-colors"
      style={{
        color: active ? "var(--text)" : "var(--muted)",
        background: active ? "var(--surface-2)" : "transparent",
      }}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full"
          style={{ background: "var(--accent)" }}
          aria-hidden
        />
      )}
      <span style={{ color: active ? "var(--accent)" : "var(--faint)" }}>
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/app" ? pathname === "/app" : pathname.startsWith(href);

  const currentLabel =
    GROUPS.flatMap((g) => g.items).find((i) => isActive(i.href))?.label ??
    "Overview";

  const sidebar = (
    <>
      <div className="flex h-14 items-center px-4">
        <Logo href="/app" />
      </div>
      <div className="px-3 pb-3">
        <ButtonLink href="/app#compose" size="sm" className="w-full">
          New changeset
          <ArrowRight size={14} />
        </ButtonLink>
      </div>
      <nav className="flex-1 space-y-6 px-3 py-2">
        {GROUPS.map((g) => (
          <div key={g.label}>
            <p className="eyebrow mb-1.5 px-2.5 !text-[10px]">{g.label}</p>
            <div className="space-y-0.5">
              {g.items.map((item) => (
                <NavLink key={item.href} item={item} active={isActive(item.href)} />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] text-muted transition-colors hover:bg-surface-2 hover:text-text"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to site
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-bg">
      {/* fixed sidebar (md+) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-border bg-bg-subtle md:flex">
        {sidebar}
      </aside>

      {/* mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[240px] flex-col border-r border-border bg-bg-subtle">
            {sidebar}
          </aside>
        </div>
      )}

      {/* main column */}
      <div className="md:pl-[240px]">
        {/* top bar */}
        <header className="glass sticky top-0 z-20 flex h-[52px] items-center gap-3 border-b border-border px-4 py-2.5 sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-text md:hidden"
            aria-label="Open navigation"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <div className="flex items-center gap-2 font-mono text-[12px] text-muted">
            <span className="hidden sm:inline">Merge</span>
            <span className="hidden text-faint sm:inline">/</span>
            <span className="text-text">{currentLabel}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ButtonLink href="/app#compose" variant="secondary" size="sm">
              New changeset
            </ButtonLink>
          </div>
        </header>

        <main className="mx-auto max-w-content px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
