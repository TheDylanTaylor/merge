import SystemIcon, { systemLabel } from "@/components/SystemIcon";
import type { System } from "@/types/changeset";
import Reveal from "./Reveal";

const SYSTEMS: System[] = ["linear", "gmail", "slack", "stripe", "crm", "permissions"];

export default function LogoStrip() {
  return (
    <section className="relative border-y border-border bg-bg-subtle">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6 lg:px-8">
        <Reveal>
          <p className="eyebrow text-center">Connects to</p>
          <p className="mx-auto mt-3 max-w-[560px] text-center text-[14.5px] text-muted">
            Merge proposes and executes across the systems your company actually
            runs on.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-5 sm:gap-x-12">
            {SYSTEMS.map((s) => (
              <div
                key={s}
                className="flex items-center gap-2.5 opacity-60 transition-opacity duration-200 hover:opacity-100"
              >
                <SystemIcon system={s} size={26} />
                <span className="text-[14px] font-medium text-text-2">
                  {systemLabel(s)}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
