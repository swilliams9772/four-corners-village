import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eyebrow, DisplayHeading, Lede } from "@/components/ui/typography";
import { Reveal } from "@/components/ui/reveal";
import { AmbientAurora } from "@/components/ui/ambient-aurora";
import { getCurrentUser } from "@/lib/auth";
import { applyAsPractitioner } from "@/app/actions/practitioner";

export const metadata = {
  title: "Apply as a Practitioner",
  description: "Tell us about your practice. Approved applicants get a sovereign space in the village.",
};

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const session = await getCurrentUser();
  if (!session) redirect("/login?redirect=/practitioners/apply");

  const { tier } = await searchParams;

  return (
    <>
      <section className="relative isolate overflow-hidden pt-32 pb-12">
        <AmbientAurora variant="dusk" intensity={0.5} blur="xl" />
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
          <Reveal>
            <Eyebrow>Practitioner application</Eyebrow>
          </Reveal>
          <Reveal delay={120}>
            <DisplayHeading level={1} size="display" className="mb-5">
              Lease your space in the village.
            </DisplayHeading>
          </Reveal>
          <Reveal delay={240}>
            <Lede className="mx-auto text-center">
              Tell us about your practice. Approved applicants receive tier setup, Stripe Connect
              onboarding, and a public sub-space at <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-label">fourcorners.village/v/your-name</code>.
            </Lede>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 lg:px-10">
        <Reveal>
          <Card variant="altar">
            <CardHeader>
              <CardTitle>Application</CardTitle>
              <CardDescription>
                We review every applicant by hand. Expect a thoughtful response within 1–3 days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={applyAsPractitioner} className="space-y-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display name</Label>
                    <Input
                      id="display_name"
                      name="display_name"
                      required
                      defaultValue={session.profile.full_name ?? ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (your URL)</Label>
                    <Input
                      id="slug"
                      name="slug"
                      required
                      placeholder="amara-storm"
                      pattern="[a-z0-9-]+"
                    />
                    <p className="text-caption text-ink-muted">
                      Lowercase letters, numbers, and dashes.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    name="tagline"
                    maxLength={140}
                    placeholder="Vedic astrologer & breathwork facilitator"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    rows={6}
                    placeholder="Share your training, lineage, and approach..."
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Primary direction</Label>
                    <Select name="primary_direction" defaultValue="east">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="east">East — Air & beginnings</SelectItem>
                        <SelectItem value="south">South — Fire & action</SelectItem>
                        <SelectItem value="west">West — Water & reflection</SelectItem>
                        <SelectItem value="north">North — Earth & wisdom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tier</Label>
                    <Select name="tier" defaultValue={tier ?? "initiate"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="initiate">Initiate ($49/mo)</SelectItem>
                        <SelectItem value="guide">Guide ($149/mo)</SelectItem>
                        <SelectItem value="sanctuary">Sanctuary ($399/mo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modalities">Modalities (comma-separated)</Label>
                  <Input
                    id="modalities"
                    name="modalities"
                    placeholder="Yoga, Breathwork, Tarot"
                  />
                </div>

                <Button type="submit" variant="brand" size="lg" className="w-full">
                  Submit application
                </Button>
                <p className="text-center text-caption text-ink-muted">
                  Approval typically takes 1–3 business days. We'll email you at{" "}
                  <span className="text-ink-subtle">{session.user.email}</span>.
                </p>
              </form>
            </CardContent>
          </Card>
        </Reveal>
      </section>
    </>
  );
}
