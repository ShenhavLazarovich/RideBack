import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, User as SelectUser } from "@shared/schema";
import admin from "firebase-admin";

// Initialize Firebase Admin SDK if credentials are available
let firebaseAdminInitialized = false;

try {
  if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY || !process.env.VITE_FIREBASE_PROJECT_ID) {
    console.warn("Firebase Admin SDK initialization skipped: Missing credentials");
  } else {
    const firebaseAdminConfig = {
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Make sure to properly handle line breaks in the private key
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    };
    
    // Initialize the Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(firebaseAdminConfig)
    });
    console.log("Firebase Admin SDK initialized successfully");
    firebaseAdminInitialized = true;
  }
} catch (error) {
  console.error("Firebase Admin SDK initialization error:", error);
}

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "ride-back-session-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: false, // Set to false for development, true for production
      sameSite: 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "שם המשתמש כבר קיים במערכת" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt for username:", req.body.username);
    
    passport.authenticate("local", (err: any, user: User | false, info: any) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("Authentication failed: Invalid credentials");
        return res.status(401).json({ message: "שם משתמש או סיסמה לא נכונים" });
      }
      
      req.login(user, (err: any) => {
        if (err) {
          console.error("Session creation error:", err);
          return next(err);
        }
        
        console.log("Login successful for user:", user.username);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err: any) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  app.post("/api/change-password", async (req, res, next) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "עליך להתחבר כדי לשנות סיסמה" });
    
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Verify current password
      const user = await storage.getUser(req.user!.id);
      const isValid = await comparePasswords(currentPassword, user.password);
      
      if (!isValid) {
        return res.status(400).json({ message: "הסיסמה הנוכחית אינה נכונה" });
      }
      
      // Update password
      const hashedNewPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, hashedNewPassword);
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Handle Firebase authentication
  app.post("/api/auth/firebase", async (req, res, next) => {
    try {
      console.log("Firebase authentication attempt");
      
      if (!firebaseAdminInitialized) {
        console.error("Firebase Admin SDK not initialized");
        return res.status(500).json({ message: "Firebase authentication is not configured on the server" });
      }

      const { idToken } = req.body;
      if (!idToken) {
        console.warn("Missing ID token in request");
        return res.status(400).json({ message: "Missing ID token" });
      }

      console.log("Verifying Firebase ID token...");
      
      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const { uid, email, name, picture } = decodedToken;
      
      console.log(`Token verified for Firebase UID: ${uid}, email: ${email || 'not provided'}`);

      // Check if user exists by firebase_uid
      let user = await storage.getUserByFirebaseUid(uid);

      if (!user) {
        console.log(`Creating new user for Firebase UID: ${uid}`);
        // Create new user with Firebase info
        const username = email ? email.split('@')[0] : `user_${uid.substring(0, 8)}`;
        
        // Generate a random password for the user (they'll use Firebase auth, so this is just a placeholder)
        const randomPassword = randomBytes(16).toString('hex');
        const hashedPassword = await hashPassword(randomPassword);
        
        // Use firstName for displayName if available
        const firstName = name || username;
        
        user = await storage.createUser({
          username,
          password: hashedPassword,
          firebase_uid: uid,
          email: email || null,
          firstName,
          profilePicture: picture || null
        });
        
        console.log(`New user created with ID: ${user.id}, username: ${user.username}`);
      } else {
        console.log(`Existing user found with ID: ${user.id}, username: ${user.username}`);
      }

      // Log user in
      req.login(user, (err: any) => {
        if (err) {
          console.error("Session creation error:", err);
          return next(err);
        }
        
        console.log(`Firebase user logged in successfully: ${user.username}`);
        return res.status(200).json(user);
      });
    } catch (error: any) {
      console.error("Firebase authentication error:", error);
      res.status(401).json({ message: error.message || "Authentication failed" });
    }
  });
}
