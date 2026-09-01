"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderOpen,
  PanelsTopLeft,
  Tag,
  UtensilsCrossed,
  Video,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/banners", label: "Banners", icon: PanelsTopLeft },
  { href: "/videos", label: "Videos", icon: Video },
  { href: "/categories", label: "Categories", icon: FolderOpen },
  { href: "/products", label: "Products", icon: UtensilsCrossed },
  { href: "/badges", label: "Badges", icon: Tag },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link href={item.href} className={cn("admin-nav-link", active && "admin-nav-link-active")}>
      <item.icon size={17} strokeWidth={active ? 2.25 : 1.75} />
      {item.label}
    </Link>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside
      className="admin-sidebar fixed inset-y-0 left-0 z-40 hidden w-[15.5rem] flex-col border-r lg:flex"
      style={{
        background: "var(--ui-sidebar)",
        borderColor: "var(--ui-sidebar-border)",
      }}
    >
      <div className="flex items-center justify-center px-6 py-6">
        <Link href="/banners" className="block shrink-0" aria-label="RESTRO Admin home">
          <img src="/images/logo.svg" alt="RESTRO by Aggarwals" className="admin-sidebar-logo" />
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-5">
        <p className="admin-nav-section-label">Console</p>
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </nav>
    </aside>
  );
}
