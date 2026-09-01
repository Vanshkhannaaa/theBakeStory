interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  light?: boolean;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  light = false,
}: SectionHeaderProps) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow && (
        <p className={`section-eyebrow mb-3 ${light ? "text-gold-light" : ""}`}>
          — {eyebrow}
        </p>
      )}
      <h2
        className={`section-title ${light ? "text-white" : ""} ${
          align === "center" ? "mx-auto" : ""
        }`}
      >
        {title}
      </h2>
      {align === "center" && <div className="divider" />}
      {subtitle && (
        <p
          className={`mt-4 max-w-2xl text-base ${
            align === "center" ? "mx-auto" : ""
          } ${light ? "text-white/75" : "text-text-muted"}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
