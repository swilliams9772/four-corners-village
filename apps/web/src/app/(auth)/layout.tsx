import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { AmbientAurora } from "@/components/ui/ambient-aurora";
import { LunarOrbLive } from "@/components/ui/lunar-orb-live";
import { Mandala, FlowerOfLife } from "@/components/brand/sacred-geometry";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
      {/* ============ Form panel ============ */}
      <div className="relative flex flex-col px-6 py-8 lg:px-14 lg:py-12">
        <Link
          href="/"
          className="mb-12 inline-flex w-fit items-center -m-2 p-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          <BrandMark size={28} />
        </Link>

        <div className="flex flex-1 items-center">
          <div className="w-full max-w-md mx-auto lg:mx-0">{children}</div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 text-caption text-ink-muted">
          <p>© {new Date().getFullYear()} 4 Corners Village</p>
          <div className="flex gap-5">
            <Link href="/legal/terms" className="hover:text-ink-subtle">
              Terms
            </Link>
            <Link href="/legal/privacy" className="hover:text-ink-subtle">
              Privacy
            </Link>
          </div>
        </div>
      </div>

      {/* ============ Atmosphere panel ============ */}
      <aside className="relative isolate hidden overflow-hidden bg-elevated lg:flex lg:flex-col">
        <AmbientAurora variant="cosmic" intensity={1.1} blur="xl" />
        <Mandala
          size={760}
          className="pointer-events-none absolute -right-40 -top-40 text-ink-muted"
          opacity={0.1}
        />
        <FlowerOfLife
          size={400}
          className="pointer-events-none absolute -left-20 bottom-12 text-lunar"
          opacity={0.18}
        />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-12 text-center">
          <LunarOrbLive size={150} />
          <p className="mt-10 max-w-sm font-display text-h3 leading-tight text-balance text-ink">
            Walk in. The four directions are waiting.
          </p>
          <p className="mt-4 max-w-sm text-body text-ink-subtle text-pretty">
            A digital village for spiritual practitioners and the seekers who serve them.
          </p>
        </div>
      </aside>
    </div>
  );
}
