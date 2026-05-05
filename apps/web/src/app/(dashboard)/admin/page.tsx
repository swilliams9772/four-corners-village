import Link from "next/link";
import { Tv, Users, FileText, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow, DisplayHeading } from "@/components/ui/typography";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin Console" };

export default async function AdminHome() {
  const supabase = await createClient();
  let counts = { videos: 0, practitioners: 0, members: 0, tvSubs: 0 };

  if (supabase) {
    const [v, p, m, t] = await Promise.all([
      supabase.from("videos").select("*", { count: "exact", head: true }),
      supabase.from("practitioners").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("product", "tv")
        .in("status", ["active", "trialing"]),
    ]);
    counts = {
      videos: v.count ?? 0,
      practitioners: p.count ?? 0,
      members: m.count ?? 0,
      tvSubs: t.count ?? 0,
    };
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Eyebrow>Admin</Eyebrow>
      <DisplayHeading level={1} size="h2" className="mt-3 mb-9">
        Console
      </DisplayHeading>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Members" value={counts.members} />
        <StatCard label="Practitioners" value={counts.practitioners} />
        <StatCard label="TV subscribers" value={counts.tvSubs} />
        <StatCard label="Videos" value={counts.videos} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <AdminCard
          href="/admin/tv"
          icon={<Tv className="size-5" />}
          accent="lunar"
          title="Vintage TV library"
          description="Upload, organize, and publish documentaries."
        />
        <AdminCard
          href="/admin/practitioners"
          icon={<Users className="size-5" />}
          accent="earth"
          title="Practitioners"
          description="Review applications and manage tier assignments."
        />
        <AdminCard
          href="/admin/waitlist"
          icon={<FileText className="size-5" />}
          accent="air"
          title="Waitlist"
          description="Email captures from the landing page."
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card variant="default">
      <CardContent className="p-6">
        <p className="text-caption uppercase tracking-widest text-ink-muted">{label}</p>
        <p className="mt-2 font-display text-h2 leading-none tabular-nums text-ink">
          {value.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

function AdminCard({
  href,
  icon,
  accent,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  accent: "lunar" | "earth" | "air";
  title: string;
  description: string;
}) {
  const accentClass = {
    lunar: "bg-lunar-soft text-lunar ring-lunar/30",
    earth: "bg-earth-soft text-earth ring-earth/30",
    air: "bg-air-soft text-air ring-air/30",
  }[accent];
  return (
    <Link href={href} className="group/card">
      <Card variant="default" className="h-full transition-colors group-hover/card:border-strong">
        <CardHeader>
          <div className="flex items-center justify-between">
            <span
              className={`flex size-11 items-center justify-center rounded-2xl ring-1 ${accentClass}`}
            >
              {icon}
            </span>
            <ArrowUpRight className="size-4 text-ink-muted transition-transform group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5" />
          </div>
          <CardTitle className="mt-4 text-h5">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-caption text-ink-subtle">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
