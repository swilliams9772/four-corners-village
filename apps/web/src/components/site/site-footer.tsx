import Link from "next/link";
import { BrandMark } from "@/components/brand/brand-mark";
import { SacredDivider } from "@/components/brand/sacred-geometry";

const columns = [
  {
    heading: "Village",
    links: [
      { href: "/#vision", label: "Vision" },
      { href: "/pricing", label: "Tiers" },
      { href: "/practitioners", label: "Directory" },
      { href: "/practitioners/apply", label: "Become a practitioner" },
    ],
  },
  {
    heading: "Vintage TV",
    links: [
      { href: "/tv", label: "Browse the library" },
      { href: "/tv/subscribe", label: "Subscribe" },
      { href: "/tv/category/documentaries", label: "Documentaries" },
      { href: "/tv/category/ceremonies", label: "Ceremonies" },
    ],
  },
  {
    heading: "Sacred Tools",
    links: [
      { href: "/oracle", label: "Oracle" },
      { href: "/altars", label: "Altars" },
      { href: "/courses", label: "Courses" },
      { href: "/account", label: "Your dashboard" },
    ],
  },
  {
    heading: "Connect",
    links: [
      { href: "mailto:hello@4cornersvillage.com", label: "hello@" },
      { href: "/legal/terms", label: "Terms" },
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/legal/dmca", label: "DMCA" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-20 border-t border-subtle bg-canvas">
      <SacredDivider className="-mt-10" />
      <div className="mx-auto max-w-7xl px-6 lg:px-10 pb-14">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="space-y-4">
            <BrandMark size={32} />
            <p className="max-w-sm text-body text-ink-subtle text-pretty">
              A digital village for spiritual practitioners. Sovereign sub-spaces, sacred technology,
              and a curated streaming home for documentary lineages.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-5 text-caption font-medium uppercase tracking-widest text-ink-muted">
                {col.heading}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-label text-ink-subtle transition-colors duration-quick ease-velvet hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="hairline my-10" />
        <div className="flex flex-col items-start justify-between gap-3 text-caption text-ink-muted md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} 4 Corners Village · Crafted with care across the four
            directions.
          </p>
          <p className="smallcaps">Made for the seekers</p>
        </div>
      </div>
    </footer>
  );
}
