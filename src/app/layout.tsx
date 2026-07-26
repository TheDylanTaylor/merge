import type { Metadata } from "next";
import "./globals.css";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "@/lib/hexclave";

export const metadata: Metadata = {
  title: "Merge — the pull request for reality",
  description:
    "An AI agent proposes a coordinated changeset across your company's tools. Review the diff, merge what's safe.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hexclave auth is mounted only when configured; keyless mode renders the
  // exact same tree as before (no provider, no behavior change).
  return (
    <html lang="en" suppressHydrationWarning>
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
