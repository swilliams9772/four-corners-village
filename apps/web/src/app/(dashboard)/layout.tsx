import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  const supabase = await createClient();
  let isPractitioner = false;
  if (supabase) {
    const { data } = await supabase
      .from("practitioners")
      .select("id, status")
      .eq("user_id", session.user.id)
      .maybeSingle();
    isPractitioner = !!data && data.status === "approved";
  }

  return (
    <DashboardShell
      user={{
        email: session.user.email,
        full_name: session.profile.full_name,
        avatar_url: session.profile.avatar_url,
      }}
      isPractitioner={isPractitioner}
      isAdmin={session.isAdmin}
    >
      {children}
    </DashboardShell>
  );
}
