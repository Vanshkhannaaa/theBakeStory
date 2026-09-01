/** Serialize Firestore dates for client component props. */
export function serializeForClient<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
