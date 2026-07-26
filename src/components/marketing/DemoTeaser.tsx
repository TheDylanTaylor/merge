import Link from "next/link";
import { SCENARIOS } from "@/types/changeset";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import Reveal from "./Reveal";

export default function DemoTeaser() {
  return (
    <section id="demo" className="relative scroll-mt-24">
      <div className="mx-auto max-w-content px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-8 md:p-12">
            <div className="relative grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-center">
              <div>
                <p className="eyebrow">See it live</p>
                <h2 className="mt-4 text-h1 font-semibold text-text">
                  Review a real changeset.
                </h2>
                <p className="mt-4 max-w-[420px] text-[16px] leading-relaxed text-muted">
                  Pick a scenario and Merge drafts the changeset for you — diff,
                  landmines, and a working Merge button. Real execution when keys
                  are set, honest mocks when they aren&apos;t.
                </p>
                <div className="mt-7">
                  <ButtonLink href="/app" size="lg">
                    Open the demo
                    <ArrowRight size={16} />
                  </ButtonLink>
                </div>
              </div>

              <div className="space-y-3">
                {SCENARIOS.map((s) => (
                  <Link
                    key={s.id}
                    href="/app"
                    className="group block rounded-lg border border-border bg-bg-subtle p-4 transition-all duration-200 hover:border-border-strong hover:bg-surface-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[14.5px] font-medium text-text">{s.label}</span>
                      <span className="shrink-0 text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-accent">
                        <ArrowRight size={15} />
                      </span>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{s.blurb}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
