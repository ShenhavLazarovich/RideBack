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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Add scopes if needed
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Set language to Hebrew
auth.languageCode = 'he';

// Functions for Google authentication
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    // Use popup for desktop and redirect for mobile
    if (window.innerWidth > 768) {
      return await signInWithPopup(auth, googleProvider);
    } else {
      return await signInWithRedirect(auth, googleProvider);
    }
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const handleRedirectResult = async (): Promise<UserCredential | null> => {
  try {
    return await getRedirectResult(auth);
  } catch (error) {
    console.error("Error handling redirect result:", error);
    throw error;
  }
};

// Authenticate with our server using Firebase token
export const authenticateWithServer = async (user: User) => {
  try {
    // Get the Firebase ID token
    const idToken = await user.getIdToken();
    
    // Send the token to our server
    const response = await apiRequest("POST", "/api/auth/firebase", { idToken });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Server authentication failed");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Server authentication error:", error);
    throw error;
  }
};

export { auth };