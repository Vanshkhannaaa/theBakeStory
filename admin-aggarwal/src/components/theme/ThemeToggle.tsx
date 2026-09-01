"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "sidebar" | "chip";
}

export function ThemeToggle({ className, variant = "icon" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const label = isDark ? "Dark" : "Light";

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={cn("admin-chip h-11 w-20", className)}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex items-center justify-center transition-all duration-200",
        variant === "icon" && "h-11 w-11 rounded-lg border border-ui-border bg-[var(--ui-surface)] text-ui-muted hover:bg-[var(--ui-surface-hover)] hover:text-ui-text",
        variant === "sidebar" && "admin-chip h-11 w-full gap-2.5 px-4 text-sm font-medium hover:bg-[var(--ui-surface-hover)]",
        variant === "chip" && "admin-chip min-h-[44px] gap-2 px-3 py-2 hover:bg-[var(--ui-surface-hover)]",
        className,
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Moon size={15} /> : <Sun size={15} />}
      {(variant === "sidebar" || variant === "chip") && <span>{label}</span>}
    </button>
  );
}
