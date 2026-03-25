import { Platform } from "react-native";
import {
  signInWithGoogle as compatSignInWithGoogle,
  signOut,
  firestoreSetDoc,
  SERVER_TIMESTAMP,
} from "./firebaseCompat";

// ── Configure Google Sign-In (native only — web uses a popup) ─────────────────

export function configureGoogleSignIn() {
  if (Platform.OS === "web") return;

  const { GoogleSignin } = require("@react-native-google-signin/google-signin");
  GoogleSignin.configure({
    webClientId:
      "804186028933-ukqhoukrkel13bsnjfevufthn8vvv0e8.apps.googleusercontent.com",
  offlineAccess: true,
  scopes: ["profile", "email"],
  });
}

// ── Sign in with Google ────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<void> {
  const { user, isNewUser } = await compatSignInWithGoogle();

  if (isNewUser) {
    const displayName = user.displayName ?? "";
    const [firstName, ...rest] = displayName.split(" ");

    await firestoreSetDoc("users", user.uid, {
      uid: user.uid,
      firstName: firstName ?? "",
      lastName: rest.join(" ") ?? "",
      username: user.email?.split("@")[0] ?? "",
      email: user.email ?? "",
      phone: user.phoneNumber ?? "",
      address: { street: "", city: "", state: "", zip: "" },
      createdAt: SERVER_TIMESTAMP,
    });
  }
}

// ── Sign out ───────────────────────────────────────────────────────────────────

export async function signOutGoogle(): Promise<void> {
  if (Platform.OS !== "web") {
    const { GoogleSignin } = require("@react-native-google-signin/google-signin");
    await GoogleSignin.signOut();
  }
  await signOut();
}

// ── Error helpers ──────────────────────────────────────────────────────────────

export function getGoogleSignInError(err: any): string {
  if (Platform.OS === "web") {
    const code: string = err?.code ?? "";
    if (code === "auth/popup-closed-by-user") return "Sign-in cancelled.";
    if (code === "auth/popup-blocked") return "Pop-up was blocked by the browser.";
    if (code === "auth/cancelled-popup-request") return "Sign-in cancelled.";
    return "Google sign-in failed. Please try again.";
  }

  const { statusCodes } = require("@react-native-google-signin/google-signin");
  if (err.code === statusCodes.SIGN_IN_CANCELLED) return "Sign-in cancelled.";
  if (err.code === statusCodes.IN_PROGRESS) return "Sign-in already in progress.";
  if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE)
    return "Google Play Services not available.";
  return "Google sign-in failed. Please try again.";
}