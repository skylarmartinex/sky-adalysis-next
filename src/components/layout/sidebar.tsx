"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Lightbulb,
  FileText,
  Key,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const icons = {
  LayoutDashboard,
  Megaphone,
  Lightbulb,
  FileText,
  Key,
  Settings2,
} as const;

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: "LayoutDashboard" as const },
  { label: "Campaigns", href: "/campaigns", icon: "Megaphone" as const },
  { label: "Keywords", href: "/keywords", icon: "Key" as const },
  { label: "Opportunities", href: "/opportunities", icon: "Lightbulb" as const },
  { label: "Reporting", href: "/reporting", icon: "FileText" as const },
];

const BOTTOM_ITEMS = [
  { label: "Sheets Setup", href: "/setup", icon: "Settings2" as const },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const NavLink = ({ item }: { item: { label: string; href: string; icon: keyof typeof icons } }) => {
    const Icon = icons[item.icon];
    const active = isActive(item.href);

    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
          active
            ? "bg-sidebar-accent text-sidebar-primary"
            : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
        {item.label}
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[220px] flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          A
        </div>
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          Adalysis
        </span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-0.5 px-3 pt-2">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="space-y-0.5 border-t border-border px-3 py-3">
        {BOTTOM_ITEMS.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
        <div className="px-3 pt-2 text-[11px] font-medium text-muted-foreground">
          Search Ads Intelligence
        </div>
      </div>
    </aside>
  );
}
