import {
  createUserWithEmailAndPassword,
  firestoreSetDoc,
  SERVER_TIMESTAMP,
  signInWithEmailAndPassword as compatSignIn,
  signOut as compatSignOut,
  getCurrentUser,
} from "./firebaseCompat";
// ── Types ──────────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

// ── Auth ───────────────────────────────────────────────────────────────────────

/**
 * Creates a new Firebase Auth user and saves their profile to Firestore.
 * Works on web, iOS, and Android.
 */
export async function signUp(
  email: string,
  password: string,
  profile: Omit<UserProfile, "uid">
): Promise<void> {
  // 1. Create the auth account
  const user = await createUserWithEmailAndPassword(email, password);

  // 2. Save the full profile to Firestore under /users/{uid}
  await firestoreSetDoc("users", user.uid, {
    ...profile,
    uid: user.uid,
    createdAt: SERVER_TIMESTAMP,
  });
}

/**
 * Signs in an existing user with email and password.
 * Works on web, iOS, and Android.
 */
export async function signIn(email: string, password: string): Promise<void> {
  await compatSignIn(email, password);
}

/**
 * Signs out the current user.
 * Works on web, iOS, and Android.
 */
export async function signOut(): Promise<void> {
  await compatSignOut();
}

/**
 * Returns the currently signed-in user, or null.
 * Works on web, iOS, and Android.
 */
export { getCurrentUser };