import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/lib/hexclave";

export const metadata: Metadata = {
  metadataBase: new URL("https://merge-littman.vercel.app"),
  title: {
    default: "Merge — the pull request for reality",
    template: "%s — Merge",
  },
  description:
    "An AI agent proposes a coordinated changeset across your company's tools. Review the diff, reject the landmines, merge what's safe — and revert anything, instantly.",
  openGraph: {
    title: "Merge — the pull request for reality",
    description:
      "Agents propose. Humans merge. Review a git-style diff across Linear, Gmail, Slack, Stripe and more — approve hunk by hunk, execute for real, revert instantly.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hexclave auth is mounted only when configured; keyless mode renders the
  // exact same tree as before (no provider, no behavior change).
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body>
        {stackServerApp ? (
          <StackProvider app={stackServerApp}>
            <StackTheme>{children}</StackTheme>
          </StackProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
