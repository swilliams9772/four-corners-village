import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Check, ExternalLink, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow, DisplayHeading } from "@/components/ui/typography";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { updatePractitionerSpace } from "@/app/actions/practitioner";
import { connectZoom, disconnectZoom } from "@/app/actions/zoom";
import { env } from "@/lib/env";
import type { Practitioner } from "@/lib/supabase/types";

export const metadata = { title: "My Space" };

type ZoomFlash = "connected" | "state_mismatch" | "error" | "missing" | undefined;

export default async function PractitionerSpaceEditor({
  searchParams,
}: {
  searchParams: Promise<{ zoom?: string }>;
}) {
  const sp = await searchParams;
  const flash = sp.zoom as ZoomFlash;

  const session = await getCurrentUser();
  if (!session) redirect("/login");

  const supabase = await createClient();
  if (!supabase) redirect("/dashboard");
  const { data } = await supabase
    .from("practitioners")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle();
  const p = data as Practitioner | null;
  if (!p) redirect("/practitioners/apply");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Practitioner space</Eyebrow>
          <DisplayHeading level={1} size="h2" className="mt-3">
            My space
          </DisplayHeading>
          <p className="mt-2 font-mono text-caption text-ink-muted">
            /v/{p.slug}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/v/${p.slug}`}>
            View public <ExternalLink className="size-3.5" />
          </Link>
        </Button>
      </div>

      <Card variant="default" className="mb-6">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updatePractitionerSpace} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display name</Label>
              <Input id="display_name" name="display_name" defaultValue={p.display_name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                name="tagline"
                maxLength={140}
                defaultValue={p.tagline ?? ""}
                placeholder="A short, evocative line"
              />
              <p className="text-caption text-ink-muted">Up to 140 characters.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" rows={7} defaultValue={p.bio ?? ""} />
            </div>
            <Button type="submit" variant="brand">
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {p.tier === "sanctuary" && env.zoom.configured && (
        <Card variant="default">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="size-5 text-fire" /> Zoom integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-caption text-ink-subtle">
              Connect your Zoom account so 1:1 sessions and group circles can auto-create meetings
              with waiting rooms enabled.
            </p>

            {flash === "connected" && (
              <div className="flex items-center gap-2 rounded-xl border border-earth/30 bg-earth-soft p-3 text-caption text-earth">
                <Check className="size-4" /> Zoom connected.
              </div>
            )}
            {flash === "state_mismatch" && (
              <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger-soft p-3 text-caption text-danger">
                <AlertCircle className="size-4" /> Security check failed. Try connecting again.
              </div>
            )}
            {flash === "error" && (
              <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger-soft p-3 text-caption text-danger">
                <AlertCircle className="size-4" /> Could not finish connecting Zoom.
              </div>
            )}
            {flash === "missing" && (
              <div className="flex items-center gap-2 rounded-xl border border-fire/30 bg-fire-soft p-3 text-caption text-fire">
                <AlertCircle className="size-4" /> No authorization code received from Zoom.
              </div>
            )}

            {p.zoom_connected_at ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-earth/30 bg-earth-soft p-3">
                <div>
                  <p className="text-label font-medium text-ink">Connected</p>
                  <p className="text-caption text-ink-muted">
                    Linked {new Date(p.zoom_connected_at).toLocaleDateString()}
                  </p>
                </div>
                <form action={disconnectZoom}>
                  <Button type="submit" variant="outline" size="sm">
                    Disconnect
                  </Button>
                </form>
              </div>
            ) : (
              <form action={connectZoom}>
                <Button type="submit" variant="brand">
                  Connect Zoom <ExternalLink className="size-4" />
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {p.tier !== "sanctuary" && (
        <Card variant="sunken">
          <CardContent className="p-6 text-caption text-ink-subtle">
            Zoom integration is part of the{" "}
            <span className="text-ink">Sanctuary</span> tier ($399/mo).{" "}
            <Link href="/pricing" className="text-air underline-offset-2 hover:underline">
              View tiers →
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
