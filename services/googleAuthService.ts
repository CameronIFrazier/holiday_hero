import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

// ── Configure Google Sign-In (call this once at app startup) ───────────────────

export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: "804186028933-ukqhoukrkel13bsnjfevufthn8vvv0e8.apps.googleusercontent.com",
  });
}

// ── Sign in with Google ────────────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<void> {
  // Check Play Services are available
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  // Open the Google sign-in modal
  const signInResult = await GoogleSignin.signIn();

  // Get the ID token
  const idToken = signInResult.data?.idToken;
  if (!idToken) throw new Error("No ID token returned from Google.");

  // Create a Firebase credential from the Google token
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  // Sign in to Firebase with the credential
  const { user, additionalUserInfo } = await auth().signInWithCredential(googleCredential);

  // If this is a new user, create their Firestore profile
  if (additionalUserInfo?.isNewUser) {
    const displayName = user.displayName ?? "";
    const [firstName, ...rest] = displayName.split(" ");
    await firestore().collection("users").doc(user.uid).set({
      uid:       user.uid,
      firstName: firstName ?? "",
      lastName:  rest.join(" ") ?? "",
      username:  user.email?.split("@")[0] ?? "",
      email:     user.email ?? "",
      phone:     user.phoneNumber ?? "",
      address:   { street: "", city: "", state: "", zip: "" },
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  }
}

// ── Sign out ───────────────────────────────────────────────────────────────────

export async function signOutGoogle(): Promise<void> {
  await GoogleSignin.signOut();
  await auth().signOut();
}

// ── Error helpers ──────────────────────────────────────────────────────────────

export function getGoogleSignInError(err: any): string {
  console.log("Google Sign-In Error:", err.code, err.message);
  if (err.code === statusCodes.SIGN_IN_CANCELLED) return "Sign-in cancelled.";
  if (err.code === statusCodes.IN_PROGRESS) return "Sign-in already in progress.";
  if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) return "Google Play Services not available.";
  return "Google sign-in failed. Please try again.";
}