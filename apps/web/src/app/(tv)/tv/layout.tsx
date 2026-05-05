import { TvHeader } from "@/components/tv/tv-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getCurrentUser, hasActiveTvSubscription } from "@/lib/auth";

export default async function TvLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();
  const hasTv = session ? await hasActiveTvSubscription(session.user.id) : false;
  return (
    <div className="min-h-screen bg-canvas">
      <TvHeader user={session ? { email: session.user.email } : null} hasTv={hasTv} />
      <div className="pt-16">{children}</div>
      <SiteFooter />
    </div>
  );
}
