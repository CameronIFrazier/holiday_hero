import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useEffect, useState } from "react";

interface UseAuthReturn {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
}

/**
 * Listens to Firebase auth state changes.
 * Use this in your root layout to decide whether to show the feed or sign-up page.
 *
 * Example:
 *   const { user, loading } = useAuth();
 *   if (loading) return <SplashScreen />;
 *   if (!user) return <SignUpPage />;
 *   return <Feed />;
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser]       = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = auth().onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe; // clean up listener on unmount
  }, []);

  return { user, loading };
}