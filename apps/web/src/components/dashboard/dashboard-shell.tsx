"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Tv,
  CreditCard,
  User as UserIcon,
  LogOut,
  Settings,
  BookOpen,
  Compass,
  Flame,
  Sparkle,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BrandMark } from "@/components/brand/brand-mark";
import { signOut } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };
type NavGroup = { label: string; tone: "neutral" | "earth" | "lunar"; items: NavItem[] };

const memberNav: NavGroup = {
  label: "Member",
  tone: "neutral",
  items: [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/tv", label: "Vintage TV", icon: Tv },
    { href: "/practitioners", label: "Find a practitioner", icon: Compass },
    { href: "/altars", label: "Digital Altars", icon: Flame },
    { href: "/oracle", label: "Oracle", icon: Sparkle },
    { href: "/courses", label: "My courses", icon: BookOpen },
  ],
};

const accountNav: NavGroup = {
  label: "Account",
  tone: "neutral",
  items: [
    { href: "/account", label: "Profile", icon: UserIcon },
    { href: "/account/billing", label: "Billing", icon: CreditCard },
    { href: "/account/settings", label: "Settings", icon: Settings },
  ],
};

const practitionerNav: NavGroup = {
  label: "Practitioner",
  tone: "earth",
  items: [
    { href: "/practitioner/space", label: "My space", icon: UserIcon },
    { href: "/practitioner/finances", label: "Finances", icon: CreditCard },
    { href: "/practitioner/courses", label: "Courses", icon: BookOpen },
  ],
};

const adminNav: NavGroup = {
  label: "Admin",
  tone: "lunar",
  items: [
    { href: "/admin", label: "Console", icon: Shield },
    { href: "/admin/tv", label: "TV library", icon: Tv },
    { href: "/admin/practitioners", label: "Practitioners", icon: UserIcon },
    { href: "/admin/waitlist", label: "Waitlist", icon: Sparkle },
  ],
};

const COLLAPSE_STORAGE = "fc-sidebar-collapsed";

export function DashboardShell({
  children,
  user,
  isPractitioner,
  isAdmin,
}: {
  children: React.ReactNode;
  user: { email: string; full_name: string | null; avatar_url: string | null };
  isPractitioner: boolean;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(COLLAPSE_STORAGE);
      if (stored === "1") setCollapsed(true);
    } catch {}
  }, []);

  const toggleCollapse = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(COLLAPSE_STORAGE, next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const initials =
    (user.full_name ?? user.email)
      .split(" ")
      .map((s) => s[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const groups: NavGroup[] = [
    memberNav,
    accountNav,
    ...(isPractitioner ? [practitionerNav] : []),
    ...(isAdmin ? [adminNav] : []),
  ];

  return (
    <div className="flex min-h-svh bg-canvas">
      {/* ============ Desktop sidebar ============ */}
      <aside
        className={cn(
          "sticky top-0 hidden h-svh shrink-0 border-r border-subtle bg-elevated lg:flex",
          "transition-[width] duration-normal ease-velvet",
          collapsed ? "w-[76px]" : "w-72",
        )}
      >
        <div className="flex h-full w-full flex-col">
          <div
            className={cn(
              "flex h-16 items-center border-b border-subtle px-4",
              collapsed ? "justify-center" : "justify-between",
            )}
          >
            {collapsed ? (
              <Link href="/" aria-label="4 Corners Village — home">
                <BrandMark variant="mark" size={28} />
              </Link>
            ) : (
              <Link href="/" className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-border-focus">
                <BrandMark size={26} />
              </Link>
            )}
            {!collapsed && (
              <button
                type="button"
                onClick={toggleCollapse}
                className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-glass hover:text-ink"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="size-4" />
              </button>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-5">
            {groups.map((group) => (
              <SideGroup key={group.label} group={group} pathname={pathname} collapsed={collapsed} />
            ))}
          </nav>

          {collapsed && (
            <div className="flex justify-center border-t border-subtle p-2">
              <button
                type="button"
                onClick={toggleCollapse}
                className="rounded-md p-2 text-ink-muted transition-colors hover:bg-glass hover:text-ink"
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="size-4" />
              </button>
            </div>
          )}

          <div
            className={cn(
              "border-t border-subtle p-3",
              collapsed && "flex justify-center px-2",
            )}
          >
            {collapsed ? (
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="icon-sm" aria-label="Sign out">
                  <LogOut className="size-4" />
                </Button>
              </form>
            ) : (
              <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-glass">
                <Avatar className="size-9 ring-1 ring-border-default">
                  <AvatarFallback className="bg-gradient-to-br from-air to-fire text-xs font-medium text-ink-inverse">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-label font-medium text-ink">
                    {user.full_name ?? "Seeker"}
                  </p>
                  <p className="truncate text-caption text-ink-muted">{user.email}</p>
                </div>
                <form action={signOut}>
                  <Button type="submit" variant="ghost" size="icon-sm" aria-label="Sign out">
                    <LogOut className="size-4" />
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ============ Mobile top bar + drawer ============ */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-subtle bg-canvas/80 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2 text-ink-muted hover:bg-glass hover:text-ink"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <BrandMark size={22} />
        <ThemeToggle />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-overlay backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-subtle bg-elevated">
            <div className="flex h-14 items-center justify-between border-b border-subtle px-4">
              <BrandMark size={24} />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-md p-2 text-ink-muted"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="overflow-y-auto px-3 py-5" style={{ height: "calc(100% - 56px)" }}>
              {groups.map((group) => (
                <SideGroup
                  key={group.label}
                  group={group}
                  pathname={pathname}
                  collapsed={false}
                />
              ))}
              <div className="my-5 hairline" />
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="md" className="w-full justify-start">
                  <LogOut className="size-4" />
                  Sign out
                </Button>
              </form>
            </nav>
          </aside>
        </div>
      )}

      {/* ============ Main content ============ */}
      <main className="min-w-0 flex-1">
        <div className="hidden h-16 items-center justify-end gap-3 border-b border-subtle bg-canvas/80 px-6 backdrop-blur lg:flex">
          <ThemeToggle />
        </div>
        <div className="overflow-x-hidden">{children}</div>
      </main>
    </div>
  );
}

function SideGroup({
  group,
  pathname,
  collapsed,
}: {
  group: NavGroup;
  pathname: string;
  collapsed: boolean;
}) {
  const toneClass = {
    neutral: "text-ink-muted",
    earth: "text-earth",
    lunar: "text-lunar",
  }[group.tone];

  return (
    <div className="mb-6">
      {!collapsed && (
        <p
          className={cn(
            "mb-2 px-3 text-caption font-medium uppercase tracking-widest",
            toneClass,
          )}
        >
          {group.label}
        </p>
      )}
      <div className="space-y-0.5">
        {group.items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group/item relative flex items-center gap-3 rounded-lg px-3 py-2 text-label",
                "transition-colors duration-quick ease-velvet",
                active
                  ? "bg-glass text-ink"
                  : "text-ink-subtle hover:bg-glass hover:text-ink",
                collapsed && "justify-center px-2",
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full",
                    group.tone === "earth"
                      ? "bg-earth"
                      : group.tone === "lunar"
                        ? "bg-lunar"
                        : "bg-brand",
                  )}
                />
              )}
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
