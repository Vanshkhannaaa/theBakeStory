export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return `rgba(0, 0, 0, ${alpha})`;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function badgePreviewStyle(color: string) {
  return {
    color,
    borderColor: hexToRgba(color, 0.35),
    backgroundColor: hexToRgba(color, 0.12),
  };
}
