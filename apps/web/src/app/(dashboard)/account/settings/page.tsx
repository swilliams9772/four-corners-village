import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold">Settings</h1>

      <Card className="mb-6 border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-sm text-slate-400">Signed in as</p>
          <p className="mb-6 font-medium">{session.user.email}</p>
          <form action={signOut}>
            <Button type="submit" variant="outline">Sign out</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-red-900/50 bg-red-950/20">
        <CardHeader>
          <CardTitle className="text-red-300">Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-slate-400">
            Account deletion is permanent. All subscriptions will be cancelled.
          </p>
          <Button variant="destructive" disabled>
            Delete account (contact support)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
