import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getCurrentUser } from "@/lib/auth";

export default async function PractitionerSpaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();
  return (
    <>
      <SiteHeader user={session ? { email: session.user.email } : null} />
      <main className="min-h-screen">{children}</main>
      <SiteFooter />
    </>
  );
}
