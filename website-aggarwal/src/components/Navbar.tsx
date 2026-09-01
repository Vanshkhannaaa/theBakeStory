"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

const WHATSAPP_URL = "https://wa.me/917707887151";

const leftLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Shop" },
  { href: "/about", label: "About Us" },
];

const mobileLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Shop" },
  { href: "/about", label: "About Us" },
];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 6.045L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function NavLink({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string;
}) {
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-11 items-center text-sm font-medium tracking-[0.16em] uppercase transition-colors sm:text-[0.95rem]",
        active ? "text-primary" : "text-text-muted hover:text-primary",
      )}
    >
      {label}
    </Link>
  );
}

function WhatsAppChat({ className }: { className?: string }) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex min-h-11 items-center gap-2.5 text-sm font-medium tracking-[0.12em] text-[#25D366] uppercase transition-opacity hover:opacity-80 sm:text-[0.95rem]",
        className,
      )}
    >
      <WhatsAppIcon className="h-6 w-6 shrink-0" />
      <span>Chat with Us</span>
    </a>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.style.setProperty("--header-height", "6rem");
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 z-50">
      <div
        className={cn(
          "border-b transition-[background,backdrop-filter,box-shadow,border-color] duration-300 ease-in-out",
          scrolled
            ? "border-white/40 bg-white/55 shadow-[0_8px_32px_rgba(63,42,34,0.08)] backdrop-blur-xl"
            : "border-white/50 bg-white/40 backdrop-blur-lg",
        )}
      >
        <nav className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4 py-1.5 sm:px-6 lg:px-8 lg:py-2">
          <div className="hidden items-center justify-start gap-8 lg:flex">
            {leftLinks.map((link) => (
              <NavLink key={link.href} {...link} pathname={pathname} />
            ))}
          </div>

          <div className="flex items-center justify-start lg:hidden">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center text-[#25D366]"
              aria-label="Chat with Us on WhatsApp"
            >
              <WhatsAppIcon className="h-6 w-6" />
            </a>
          </div>

          <Link href="/" className="justify-self-center">
            <BrandLogo
              className={cn(
                "transition-[height] duration-300 ease-in-out",
                scrolled ? "h-14 sm:h-16" : "h-[4.25rem] sm:h-[4.75rem] md:h-[5.25rem]",
              )}
              priority
            />
          </Link>

          <div className="hidden items-center justify-end lg:flex">
            <WhatsAppChat />
          </div>

          <div className="flex items-center justify-end lg:hidden">
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center text-primary"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </div>

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 top-[var(--header-height)] border-t border-white/40 bg-white/70 backdrop-blur-2xl transition-opacity duration-300 lg:hidden",
          open ? "visible opacity-100" : "invisible pointer-events-none opacity-0",
        )}
      >
        <div className="flex flex-col items-center gap-1 px-6 pt-12">
          {mobileLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex min-h-12 items-center text-base tracking-[0.16em] uppercase",
                pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                  ? "text-primary"
                  : "text-text-muted",
              )}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex min-h-12 items-center gap-2 text-sm font-medium tracking-[0.14em] text-[#25D366] uppercase"
          >
            <WhatsAppIcon className="h-6 w-6" />
            Chat with Us
          </a>
        </div>
      </div>
    </header>
  );
}
