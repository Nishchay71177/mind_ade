// No authentication utilities needed since we removed auth
export function isUnauthorizedError(error: Error): boolean {
  return false; // Never unauthorized in anonymous mode
}