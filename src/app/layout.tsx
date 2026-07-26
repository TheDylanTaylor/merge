import type { Metadata } from "next";
import "./globals.css";

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
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
