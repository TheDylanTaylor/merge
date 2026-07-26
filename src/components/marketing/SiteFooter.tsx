import Link from "next/link";
import Logo from "@/components/ui/Logo";

const COLS: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "/app" },
      { label: "Activity log", href: "/app/activity" },
      { label: "Integrations", href: "/app/integrations" },
      { label: "For agents", href: "/for-agents" },
    ],
  },
  {
    title: "Systems",
    links: [
      { label: "Linear", href: "https://linear.app", external: true },
      { label: "Slack", href: "https://slack.com", external: true },
      { label: "Resend", href: "https://resend.com", external: true },
      { label: "Stripe", href: "https://stripe.com", external: true },
    ],
  },
  {
    title: "Built with",
    links: [
      { label: "Claude (Anthropic)", href: "https://anthropic.com", external: true },
      { label: "Hexclave", href: "https://hexclave.com", external: true },
      { label: "Next.js", href: "https://nextjs.org", external: true },
      { label: "Vercel", href: "https://vercel.com", external: true },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="relative border-t border-border">
      <div className="mx-auto max-w-content px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo href="/" />
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-muted">
              The pull request for reality. Agents propose a coordinated
              changeset across your tools; you review the diff and merge what&apos;s
              safe.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow mb-3">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map((l) =>
                  l.external ? (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13.5px] text-muted transition-colors hover:text-text"
                      >
                        {l.label}
                      </a>
                    </li>
                  ) : (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-[13.5px] text-muted transition-colors hover:text-text"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[12px] text-faint">
            © {new Date().getFullYear()} Merge · Agents propose, humans merge.
          </p>
          <p className="font-mono text-[12px] text-faint">
            YC S2026 · Software for Agents
          </p>
        </div>
      </div>
    </footer>
  );
}
