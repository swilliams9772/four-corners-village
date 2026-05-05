"use client";

import Link from "next/link";
import * as React from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BrandMark } from "@/components/brand/brand-mark";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/#vision", label: "Vision" },
  { href: "/pricing", label: "Tiers" },
  { href: "/practitioners", label: "Practitioners" },
  { href: "/tv", label: "Vintage TV" },
];

export function SiteHeader({ user }: { user: { email: string } | null }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background,backdrop-filter,border-color,box-shadow] duration-gentle ease-velvet",
        scrolled
          ? "border-b border-subtle bg-canvas/60 backdrop-blur-2xl backdrop-saturate-150 shadow-whisper"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link
          href="/"
          className="-m-2 rounded-md p-2 outline-none transition-opacity duration-quick hover:opacity-80 focus-visible:ring-2 focus-visible:ring-border-focus"
          aria-label="Four Corners — home"
        >
          <BrandMark size={28} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-label text-ink-subtle transition-colors duration-quick ease-velvet hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {user ? (
            <Button asChild variant="brand" size="sm">
              <Link href="/dashboard">Open village</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild variant="brand" size="sm">
                <Link href="/signup">Join waitlist</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="-m-2 rounded-md p-2 text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="absolute inset-x-0 top-16 origin-top animate-fade-in-up border-b border-subtle bg-canvas/95 backdrop-blur-2xl md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 text-body text-ink-subtle transition-colors hover:bg-glass hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 grid gap-3">
              <ThemeToggle className="self-start" />
              {user ? (
                <Button asChild variant="brand" size="lg">
                  <Link href="/dashboard">Open village</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost" size="lg">
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button asChild variant="brand" size="lg">
                    <Link href="/signup">Join waitlist</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
