import { hasServiceAccount } from "./credentials";

export async function withFirestoreRead<T>(
  adminRead: () => Promise<T>,
  publicRead: () => Promise<T>,
  fallback: T,
): Promise<T> {
  if (hasServiceAccount()) {
    try {
      return await adminRead();
    } catch (error) {
      console.warn(
        "[firestore] Admin read failed, falling back to public API:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  try {
    return await publicRead();
  } catch (error) {
    console.warn(
      "[firestore] Public read failed, using defaults:",
      error instanceof Error ? error.message : error,
    );
    return fallback;
  }
}
