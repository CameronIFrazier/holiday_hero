import auth from "@react-native-firebase/auth";
import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

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
  createdAt: FirebaseFirestoreTypes.Timestamp;
}

// ── Auth ───────────────────────────────────────────────────────────────────────

/**
 * Creates a new Firebase Auth user and saves their profile to Firestore.
 */
export async function signUp(
  email: string,
  password: string,
  profile: Omit<UserProfile, "uid" | "createdAt">
): Promise<void> {
  // 1. Create the auth account
  const { user } = await auth().createUserWithEmailAndPassword(email, password);

  // 2. Save the full profile to Firestore under /users/{uid}
  await firestore().collection("users").doc(user.uid).set({
    ...profile,
    uid: user.uid,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Signs in an existing user with email and password.
 */
export async function signIn(email: string, password: string): Promise<void> {
  await auth().signInWithEmailAndPassword(email, password);
}

/**
 * Signs out the current user.
 */
export async function signOut(): Promise<void> {
  await auth().signOut();
}

/**
 * Returns the currently signed-in user, or null.
 */
export function getCurrentUser() {
  return auth().currentUser;
}