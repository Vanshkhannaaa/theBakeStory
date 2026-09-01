"use client";

import Link from "next/link";
import { ChevronUp, MapPin, Phone } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const PHONE_DISPLAY = "+91 77078 87151";
const PHONE_TEL = "+917707887151";
const EMAIL = "aggarwalsweets@gmail.com";
const HOURS = "Open: 10AM - 9:00PM";
const ADDRESS = "Jalandhar Cantt, Jalandhar, Punjab 144005";
const INSTAGRAM_URL = "https://www.instagram.com/aggarwalsweetsandbakers/";
const INSTAGRAM_HANDLE = "@aggarwalsweetsandbakers";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Shop" },
  { href: "/about", label: "About Us" },
];

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FooterPattern() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[url('/images/footer-pattern.png')] bg-repeat [background-size:28rem] opacity-[0.04] mix-blend-screen"
    />
  );
}

const linkClass =
  "inline-flex min-h-11 items-center text-[0.95rem] text-[#e8ddd2] underline-offset-4 transition-colors duration-200 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-light";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10">
      <div className="relative overflow-hidden bg-primary text-[#f7f2ec]">
        <FooterPattern />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_minmax(0,1.35fr)] md:items-center md:gap-x-14 md:gap-y-0 lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-x-20 lg:px-8 lg:py-16">
          <div className="flex flex-col items-center gap-4">
            <Link href="/" className="block shrink-0" aria-label="The Bake Story home">
              <BrandLogo className="h-32 brightness-0 invert sm:h-36 md:h-40 lg:h-44" />
            </Link>
            <div className="space-y-1 text-center text-[0.9rem] leading-relaxed text-[#d4c4b6]">
              <a
                href={`mailto:${EMAIL}`}
                className="block transition-colors duration-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-light"
              >
                {EMAIL}
              </a>
              <p>{HOURS}</p>
            </div>
          </div>

          <nav aria-label="Footer navigation" className="text-center md:text-left">
            <ul className="flex flex-col items-center gap-0.5 md:items-start">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="text-center md:text-left">
            <ul className="flex flex-col items-center gap-1 md:items-start">
              <li>
                <a href={`tel:${PHONE_TEL}`} className={`${linkClass} gap-3`}>
                  <Phone size={17} strokeWidth={1.75} className="shrink-0 text-gold-light" aria-hidden />
                  <span>{PHONE_DISPLAY}</span>
                </a>
              </li>
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} gap-3`}
                >
                  <InstagramIcon className="h-[17px] w-[17px] shrink-0 text-gold-light" />
                  <span>{INSTAGRAM_HANDLE}</span>
                </a>
              </li>
              <li className="mt-3 flex max-w-sm items-start gap-3 text-[0.95rem] leading-relaxed text-[#d4c4b6] md:max-w-none">
                <MapPin size={17} strokeWidth={1.75} className="mt-1 shrink-0 text-gold-light" aria-hidden />
                <span>{ADDRESS}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden border-t border-white/5 bg-[#2a1b16]">
        <FooterPattern />
        <div className="relative mx-auto flex max-w-7xl items-center justify-center px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-xs tracking-[0.08em] text-[#b8a89a]">
            © {year} The Bake Story by Aggarwal&apos;s
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/40 text-white transition-colors duration-200 hover:border-white/20 hover:bg-black/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light sm:right-6"
            aria-label="Back to top"
          >
            <ChevronUp size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
}
