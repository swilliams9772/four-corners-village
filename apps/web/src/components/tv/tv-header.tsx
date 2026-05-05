"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bookmark, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandMark } from "@/components/brand/brand-mark";
import { cn } from "@/lib/utils";

export function TvHeader({ user, hasTv }: { user: { email: string } | null; hasTv: boolean }) {
  const router = useRouter();
  const [scrolled, setScrolled] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [q, setQ] = React.useState("");

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/tv/search?q=${encodeURIComponent(q.trim())}`);
    setSearchOpen(false);
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,backdrop-filter,border-color] duration-gentle ease-velvet",
        scrolled
          ? "border-b border-subtle bg-canvas/65 backdrop-blur-2xl backdrop-saturate-150"
          : "border-b border-transparent bg-gradient-to-b from-canvas/80 to-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-10">
          <Link href="/tv" className="flex items-center gap-2.5">
            <BrandMark variant="mark" size={26} />
            <span className="font-display text-h6 leading-none tracking-tight text-ink">
              Vintage TV
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {[
              { href: "/tv", label: "Home" },
              { href: "/tv/category/spiritual-documentaries", label: "Documentaries" },
              { href: "/tv/category/healers-mystics", label: "Healers" },
              { href: "/tv/category/village-originals", label: "Originals" },
              { href: "/tv/my-list", label: "My list" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-label text-ink-subtle transition-colors duration-quick ease-velvet hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {searchOpen ? (
            <form onSubmit={submitSearch} className="flex items-center gap-2">
              <Input
                autoFocus
                placeholder="Search titles..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="h-9 w-56 sm:w-72"
                onBlur={() => !q && setSearchOpen(false)}
              />
              <Button
                variant="ghost"
                size="icon-sm"
                type="button"
                onClick={() => setSearchOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </form>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="size-4" />
            </Button>
          )}
          <Button asChild variant="ghost" size="icon" aria-label="My list">
            <Link href="/tv/my-list">
              <Bookmark className="size-4" />
            </Link>
          </Button>
          {!hasTv && user && (
            <Button asChild variant="brand" size="sm" className="hidden sm:inline-flex">
              <Link href="/tv/subscribe">Subscribe — $5.55/mo</Link>
            </Button>
          )}
          {user ? (
            <Button asChild variant="ghost" size="icon" aria-label="Account">
              <Link href="/dashboard">
                <User className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild variant="brand" size="sm">
              <Link href="/login?redirect=/tv">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
