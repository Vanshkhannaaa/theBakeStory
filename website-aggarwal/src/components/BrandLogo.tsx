import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  priority?: boolean;
}

export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/logo.svg"
      alt="The Bake Story by Aggarwal's"
      className={cn("h-auto w-auto object-contain", className)}
      {...(priority ? { fetchPriority: "high" as const } : {})}
    />
  );
}
