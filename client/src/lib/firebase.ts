import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";

// Firebase configuration - use empty values for now
// These will be replaced with actual values from environment variables when available
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo"}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Sign in with Google
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return {
      success: true,
      user: result.user,
      credential: GoogleAuthProvider.credentialFromResult(result),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Sign out
export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get current auth state
export function getCurrentUser() {
  return auth.currentUser;
}

export { auth };