import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DisplayHeading, Eyebrow } from "@/components/ui/typography";
import { getCurrentUser } from "@/lib/auth";
import { updateProfile } from "@/app/actions/profile";

export const metadata = { title: "Profile" };

export default async function AccountPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 lg:px-10">
      <header className="mb-10">
        <Eyebrow>Account</Eyebrow>
        <DisplayHeading level={1} size="h2">
          Your profile
        </DisplayHeading>
        <p className="mt-3 text-body text-ink-subtle">
          How you appear in the village. Birth details unlock astrological matching with practitioners.
        </p>
      </header>

      <Card variant="default">
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Public to other members; birth data stays private.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={session.profile.full_name ?? ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="display_name">Display name</Label>
              <Input
                id="display_name"
                name="display_name"
                defaultValue={session.profile.display_name ?? ""}
                placeholder="Optional — what others see"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                rows={4}
                defaultValue={session.profile.bio ?? ""}
                placeholder="Where are you in your practice?"
              />
            </div>
            <div className="hairline my-6" />
            <div>
              <p className="mb-1 text-label font-medium text-ink">Birth chart</p>
              <p className="mb-4 text-caption text-ink-muted">
                Optional. Powers astrological matching and personalized oracle readings.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="birth_date">Date</Label>
                  <Input
                    id="birth_date"
                    name="birth_date"
                    type="date"
                    defaultValue={session.profile.birth_date ?? ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="birth_time">Time</Label>
                  <Input
                    id="birth_time"
                    name="birth_time"
                    type="time"
                    defaultValue={session.profile.birth_time ?? ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="birth_location">Location</Label>
                  <Input
                    id="birth_location"
                    name="birth_location"
                    defaultValue={session.profile.birth_location ?? ""}
                    placeholder="City, country"
                  />
                </div>
              </div>
            </div>
            <Button type="submit" variant="brand" size="lg">
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
