// Simple hook that returns unauthenticated state since we removed auth
export function useAuth() {
  return {
    user: null,
    isLoading: false,
    isAuthenticated: false,
  };
}