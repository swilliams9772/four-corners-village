"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email";
import { WelcomeEmail } from "@/lib/email/templates/welcome";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  redirectTo: z.string().optional(),
});

const signupSchema = credentialsSchema.extend({
  fullName: z.string().min(1).optional(),
});

export async function signInWithPassword(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo") ?? "/dashboard",
  });
  if (!parsed.success) return { error: "Please enter a valid email and password (8+ chars)." };

  const supabase = await createClient();
  if (!supabase) return { error: "Authentication not configured. Set Supabase env vars." };

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(parsed.data.redirectTo ?? "/dashboard");
}

export async function signUp(formData: FormData) {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName") ?? undefined,
    redirectTo: formData.get("redirectTo") ?? "/dashboard",
  });
  if (!parsed.success) return { error: "Please enter a valid email and password (8+ chars)." };

  const supabase = await createClient();
  if (!supabase) return { error: "Authentication not configured." };

  // Soft-launch gate. When NEXT_PUBLIC_WAITLIST_ONLY=1, only emails on the
  // waitlist (or admins) can complete signup. Removes silently when flag flips.
  if (env.launch.waitlistOnly) {
    const lower = parsed.data.email.toLowerCase();
    const isAdmin = env.admins.includes(lower);
    if (!isAdmin) {
      const { data: invite } = await supabase
        .from("waitlist")
        .select("id")
        .eq("email", lower)
        .maybeSingle();
      if (!invite) {
        return {
          error:
            "We're in soft launch — sign up at fourcorners.village for an invite, and we'll be in touch.",
        };
      }
    }
  }

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${env.app.url}/auth/callback`,
    },
  });
  if (error) return { error: error.message };

  // Best-effort welcome email. Supabase already sends its own confirmation; this
  // is the warmer brand-voice greeting. Never fail signup on email errors.
  try {
    await sendEmail({
      to: parsed.data.email,
      subject: "Welcome to Four Corners Village",
      body: WelcomeEmail({ recipientName: parsed.data.fullName ?? null }),
    });
  } catch (err) {
    console.error("[auth] welcome email failed", err);
  }

  return { ok: true };
}

export async function signInWithProvider(provider: "google" | "apple", redirectTo = "/dashboard") {
  const supabase = await createClient();
  if (!supabase) return { error: "Authentication not configured." };

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${env.app.url}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
    },
  });
  if (error) return { error: error.message };
  if (data.url) redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
