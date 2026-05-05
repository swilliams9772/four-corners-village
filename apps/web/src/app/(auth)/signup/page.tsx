import Link from "next/link";
import { SignupForm } from "./signup-form";
import { DisplayHeading, Eyebrow } from "@/components/ui/typography";

export const metadata = { title: "Create your account" };

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  return (
    <div>
      <div className="mb-8">
        <Eyebrow>Begin here</Eyebrow>
        <DisplayHeading level={1} size="h2" className="mb-3">
          Plant your flag in the village.
        </DisplayHeading>
        <p className="text-body text-ink-subtle">
          Create your account. We&apos;ll send a confirmation link to verify your email.
        </p>
      </div>
      <SignupForm searchParamsPromise={searchParams} />
      <p className="mt-8 text-label text-ink-muted">
        Already a member?{" "}
        <Link href="/login" className="text-ink-accent hover:underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
