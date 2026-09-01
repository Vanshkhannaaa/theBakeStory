export function toDate(value: unknown): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }
  return new Date();
}

export function toDateOrNull(value: unknown): Date | null {
  if (!value) return null;
  return toDate(value);
}

export function nowTimestamps() {
  const now = new Date();
  return { createdAt: now, updatedAt: now };
}

export function updateTimestamp() {
  return { updatedAt: new Date() };
}
