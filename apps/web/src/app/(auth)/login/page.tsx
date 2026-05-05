import Link from "next/link";
import { LoginForm } from "./login-form";
import { DisplayHeading, Eyebrow } from "@/components/ui/typography";

export const metadata = { title: "Sign in" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  return (
    <div>
      <div className="mb-8">
        <Eyebrow>Welcome back</Eyebrow>
        <DisplayHeading level={1} size="h2" className="mb-3">
          Step back into the village.
        </DisplayHeading>
        <p className="text-body text-ink-subtle">
          Enter your details, or continue with your favorite provider.
        </p>
      </div>
      <LoginForm searchParamsPromise={searchParams} />
      <p className="mt-8 text-label text-ink-muted">
        New here?{" "}
        <Link href="/signup" className="text-ink-accent hover:underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </div>
  );
}
