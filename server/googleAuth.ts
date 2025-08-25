import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import { pool } from "./db";

declare global {
  namespace Express {
    interface User extends Omit<import('../shared/schema').User, 'password'> {}
  }
}

export function setupAuth(app: Express) {
  if (!process.env.SESSION_SECRET || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Missing required environment variables for authentication.");
  }

  const PgStore = connectPgSimple(session);
  const store = new PgStore({
    pool: pool,
    tableName: "sessions",
  });

  // This tells our app to trust the 'https' protocol when it's deployed behind a proxy like Google Cloud Run.
  app.set('trust proxy', 1);

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: store,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Dynamically determine the callback URL based on the environment
  const callbackURL = process.env.NODE_ENV === 'production'
    ? 'https://analogyai-app-362544124568.us-central1.run.app/api/auth/google/callback'
    : 'http://localhost:5000/api/auth/google/callback';

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackURL, // <-- Use the dynamic URL
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await storage.upsertUser({
            id: profile.id,
            email: profile.emails?.[0].value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            profileImageUrl: profile.photos?.[0].value,
          });
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};