import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import Reveal from "./Reveal";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-border">
      <div className="relative mx-auto max-w-content px-4 py-28 text-center sm:px-6 md:py-32 lg:px-8">
        <Reveal className="mx-auto max-w-[720px]">
          <h2 className="text-display font-semibold text-text">
            Give your agents a merge button.
          </h2>
          <p className="mx-auto mt-5 max-w-[540px] text-lead text-muted">
            Real side effects. Real undo. Reviewed by a human who can still say
            no.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/app" size="lg" className="w-full sm:w-auto">
              Open the console
              <ArrowRight size={16} />
            </ButtonLink>
            <ButtonLink href="/for-agents" variant="secondary" size="lg" className="w-full sm:w-auto">
              Read the docs
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
