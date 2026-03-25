/**
 * firebaseCompat.ts
 *
 * Abstraction layer for Firebase Auth and Firestore across web/iOS/Android.
 * On web   → uses the modular `firebase` JS SDK (initialized eagerly below)
 * On native → uses `@react-native-firebase`
 */

import { Platform } from "react-native";

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  isAnonymous: boolean;
}

export type AuthStateCallback = (user: AuthUser | null) => void;
export type Unsubscribe = () => void;

// ─── Eagerly initialize web Firebase ─────────────────────────────────────────
// Must happen synchronously at module load time so auth is ready immediately.

let webAuth: any = null;
let webDb: any = null;

if (Platform.OS === "web") {
  const { initializeApp, getApps, getApp } = require("firebase/app");
  const { getAuth } = require("firebase/auth");
  const { getFirestore } = require("firebase/firestore");

  const firebaseConfig = {
    apiKey: "AIzaSyA5YvtdkUQlrkWlXpl6EH05sa4IfQZNjLk",
    authDomain: "holiday-hero-13bd7.firebaseapp.com",
    projectId: "holiday-hero-13bd7",
    storageBucket: "holiday-hero-13bd7.firebasestorage.app",
    messagingSenderId: "804186028933",
    appId: "1:804186028933:web:3864032d9fbb081985a2ec",
    measurementId: "G-3RGNMYFJTK",
  };

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  webAuth = getAuth(app);
  webDb = getFirestore(app);
}

// ─── Auth: onAuthStateChanged ─────────────────────────────────────────────────

export function onAuthStateChanged(callback: AuthStateCallback): Unsubscribe {
  if (Platform.OS === "web") {
    const { onAuthStateChanged: webListener } = require("firebase/auth");
    return webListener(webAuth, (firebaseUser: any) => {
      callback(firebaseUser ? mapUser(firebaseUser) : null);
    });
  }

  const { getAuth, onAuthStateChanged: nativeListener } = require("@react-native-firebase/auth");
return nativeListener(getAuth(), (firebaseUser: any) => {
  callback(firebaseUser ? mapUser(firebaseUser) : null);
});
}

// ─── Auth: createUserWithEmailAndPassword ─────────────────────────────────────

export async function createUserWithEmailAndPassword(
  email: string,
  password: string
): Promise<AuthUser> {
  if (Platform.OS === "web") {
    const { createUserWithEmailAndPassword: webCreate } = require("firebase/auth");
    const { user } = await webCreate(webAuth, email, password);
    return mapUser(user);
  }

  const nativeAuth = require("@react-native-firebase/auth").default;
  const { user } = await nativeAuth().createUserWithEmailAndPassword(email, password);
  return mapUser(user);
}

// ─── Auth: signInWithEmailAndPassword ─────────────────────────────────────────

export async function signInWithEmailAndPassword(
  email: string,
  password: string
): Promise<AuthUser> {
  if (Platform.OS === "web") {
    const { signInWithEmailAndPassword: webSignIn } = require("firebase/auth");
    const { user } = await webSignIn(webAuth, email, password);
    return mapUser(user);
  }

  const nativeAuth = require("@react-native-firebase/auth").default;
  const { user } = await nativeAuth().signInWithEmailAndPassword(email, password);
  return mapUser(user);
}

// ─── Auth: signOut ────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  if (Platform.OS === "web") {
    const { signOut: webSignOut } = require("firebase/auth");
    return webSignOut(webAuth);
  }

  const nativeAuth = require("@react-native-firebase/auth").default;
  return nativeAuth().signOut();
}

// ─── Auth: getCurrentUser ─────────────────────────────────────────────────────

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (Platform.OS === "web") {
    return webAuth?.currentUser ? mapUser(webAuth.currentUser) : null;
  }

  const nativeAuth = require("@react-native-firebase/auth").default;
  const u = nativeAuth().currentUser;
  return u ? mapUser(u) : null;
}

// ─── Auth: signInWithGoogle ───────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<{
  user: AuthUser;
  isNewUser: boolean;
}> {
  if (Platform.OS === "web") {
    const {
      GoogleAuthProvider,
      signInWithPopup,
      getAdditionalUserInfo,
    } = require("firebase/auth");

    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(webAuth, provider);
    const additionalInfo = getAdditionalUserInfo(result);

    return {
      user: mapUser(result.user),
      isNewUser: additionalInfo?.isNewUser ?? false,
    };
  }

  const { GoogleSignin } = require("@react-native-google-signin/google-signin");
  const nativeAuth = require("@react-native-firebase/auth").default;

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const signInResult = await GoogleSignin.signIn();
  const idToken = signInResult.data?.idToken;
  if (!idToken) throw new Error("No ID token returned from Google.");

  const googleCredential = nativeAuth.GoogleAuthProvider.credential(idToken);
  const { user, additionalUserInfo } = await nativeAuth().signInWithCredential(googleCredential);

  return {
    user: mapUser(user),
    isNewUser: additionalUserInfo?.isNewUser ?? false,
  };
}

// ─── Firestore: setDoc ────────────────────────────────────────────────────────

export const SERVER_TIMESTAMP = "__SERVER_TIMESTAMP__" as const;

export async function firestoreSetDoc(
  collectionName: string,
  docId: string,
  data: Record<string, any>
): Promise<void> {
  if (Platform.OS === "web") {
    const { doc, setDoc, serverTimestamp } = require("firebase/firestore");
    const resolved = resolveTimestamps(data, serverTimestamp());
    return setDoc(doc(webDb, collectionName, docId), resolved);
  }

  const firestore = require("@react-native-firebase/firestore").default;
  const resolved = resolveTimestamps(data, firestore.FieldValue.serverTimestamp());
  return firestore().collection(collectionName).doc(docId).set(resolved);
}

// ─── Firestore: addDoc ────────────────────────────────────────────────────────
// Adds a document with an auto-generated ID and returns that ID.

export async function firestoreAddDoc(
  collectionName: string,
  data: Record<string, any>
): Promise<string> {
  if (Platform.OS === "web") {
    const { collection, addDoc } = require("firebase/firestore");
    const docRef = await addDoc(collection(webDb, collectionName), data);
    return docRef.id;
  }

  const firestore = require("@react-native-firebase/firestore").default;
  const docRef = await firestore().collection(collectionName).add(data);
  return docRef.id;
}

// ─── Firestore: getDocs ───────────────────────────────────────────────────────
// Returns all documents in a collection as plain objects.

export async function firestoreGetDocs(
  collectionName: string
): Promise<Array<{ id: string } & Record<string, any>>> {
  if (Platform.OS === "web") {
    const { collection, getDocs } = require("firebase/firestore");
    const snap = await getDocs(collection(webDb, collectionName));
    return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  const firestore = require("@react-native-firebase/firestore").default;
  const snap = await firestore().collection(collectionName).get();
  return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

// ─── Firestore: getDocsByField ────────────────────────────────────────────────
// Returns documents where `field == value`.

export async function firestoreGetDocsByField(
  collectionName: string,
  field: string,
  value: any
): Promise<Array<{ id: string } & Record<string, any>>> {
  if (Platform.OS === "web") {
    const { collection, getDocs, query, where } = require("firebase/firestore");
    const q = query(collection(webDb, collectionName), where(field, "==", value));
    const snap = await getDocs(q);
    return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  const firestore = require("@react-native-firebase/firestore").default;
  const snap = await firestore()
    .collection(collectionName)
    .where(field, "==", value)
    .get();
  return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveTimestamps(
  data: Record<string, any>,
  sentinel: any
): Record<string, any> {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [
      k,
      v === SERVER_TIMESTAMP ? sentinel : v,
    ])
  );
}

function mapUser(u: any): AuthUser {
  return {
    uid: u.uid,
    email: u.email ?? null,
    displayName: u.displayName ?? null,
    phoneNumber: u.phoneNumber ?? null,
    isAnonymous: u.isAnonymous ?? false,
  };
}