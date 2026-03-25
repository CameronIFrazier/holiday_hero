import { useEffect, useState } from "react";
import { onAuthStateChanged, type AuthUser } from "../services/firebaseCompat";
interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
}

/**
 * Listens to Firebase auth state changes.
 * Works on web, iOS, and Android via the firebaseCompat abstraction layer.
 *
 * Example:
 *   const { user, loading } = useAuth();
 *   if (loading) return <SplashScreen />;
 *   if (!user) return <SignUpPage />;
 *   return <Feed />;
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return unsubscribe; // clean up listener on unmount
  }, []);

  return { user, loading };
}