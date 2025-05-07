import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, User, UserCredential } from "firebase/auth";
import { apiRequest } from "./queryClient";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Log Firebase configuration for debugging (don't log API keys in production)
console.log("Firebase config (without API key):", {
  ...firebaseConfig,
  apiKey: "HIDDEN_FOR_SECURITY"
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Add scopes if needed
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Set custom parameters for better compatibility
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Set language to Hebrew
auth.languageCode = 'he';

// Functions for Google authentication
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    // Always use popup for now to simplify debugging
    console.log("Starting Google sign in with popup...");
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const handleRedirectResult = async (): Promise<UserCredential | null> => {
  try {
    const result = await getRedirectResult(auth);
    
    // getRedirectResult() returns null if there is no redirect result
    if (!result) {
      return null;
    }
    
    return result;
  } catch (error) {
    console.error("Error handling redirect result:", error);
    throw error;
  }
};

// Authenticate with our server using Firebase token
export const authenticateWithServer = async (user: User) => {
  try {
    console.log("Authenticating Firebase user with server:", user.email);
    
    // Get the Firebase ID token
    const idToken = await user.getIdToken();
    console.log("Got Firebase ID token, length:", idToken.length);
    
    // Send the token to our server
    console.log("Sending token to /api/auth/firebase endpoint...");
    const response = await apiRequest("POST", "/api/auth/firebase", { idToken });
    
    if (!response.ok) {
      console.error("Server authentication failed with status:", response.status);
      const errorData = await response.json();
      throw new Error(errorData.message || "Server authentication failed");
    }
    
    console.log("Server authentication successful");
    const userData = await response.json();
    console.log("User data from server:", userData);
    return userData;
  } catch (error) {
    console.error("Server authentication error:", error);
    throw error;
  }
};

export { auth };