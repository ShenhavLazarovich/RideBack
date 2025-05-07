import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";

// Check if Firebase configuration is available
const hasFirebaseConfig = 
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_PROJECT_ID && 
  import.meta.env.VITE_FIREBASE_APP_ID;

// Mock implementations when Firebase is not configured
const mockSignInWithGoogle = async () => {
  return {
    success: false,
    error: "Firebase is not configured. Please add the required API keys to enable Google sign-in."
  };
};

const mockSignOut = async () => {
  return { 
    success: false, 
    error: "Firebase is not configured" 
  };
};

const mockGetCurrentUser = () => null;

// Only initialize Firebase if configuration is available
let auth: any;
let app: any;
let googleProvider: any;

if (hasFirebaseConfig) {
  try {
    // Firebase configuration
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
  }
}

// Sign in with Google - use real implementation if Firebase is configured, mock otherwise
export async function signInWithGoogle() {
  if (!hasFirebaseConfig || !auth) {
    return mockSignInWithGoogle();
  }
  
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

// Sign out - use real implementation if Firebase is configured, mock otherwise
export async function signOut() {
  if (!hasFirebaseConfig || !auth) {
    return mockSignOut();
  }
  
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Get current auth state - use real implementation if Firebase is configured, mock otherwise
export function getCurrentUser() {
  if (!hasFirebaseConfig || !auth) {
    return mockGetCurrentUser();
  }
  
  return auth.currentUser;
}

export { auth };