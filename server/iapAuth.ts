import type { RequestHandler } from "express";
import { storage } from "./storage";

// Augment the Express Request type to include the user object IAP will provide
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
    }
    interface Request {
      user?: User;
    }
  }
}

// This middleware checks for IAP headers and creates a user session.
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // These headers are securely set by IAP after a user authenticates.
  const userIdHeader = req.header('x-goog-authenticated-user-id');
  const userEmailHeader = req.header('x-goog-authenticated-user-email');

  if (!userIdHeader || !userEmailHeader) {
    // If running locally without IAP, we can fall back to our mock user.
    if (process.env.NODE_ENV === 'development') {
      const mockUserId = "local-dev-user";
      const user = await storage.getUser(mockUserId);
      if (user) {
        // We use a simplified user object for consistency
        req.user = { id: user.id, email: user.email || '' };
      }
      return next();
    }
    // In production, if headers are missing, the user is not authorized.
    return res.status(401).send('Unauthorized: Missing IAP headers.');
  }

  // The format is "accounts.google.com:12345..."
  const userId = userIdHeader.split(':').pop() as string;
  const userEmail = userEmailHeader.split(':').pop() as string;

  // Create a simplified user object for the request
  req.user = { id: userId, email: userEmail };

  // Ensure the user exists in our database.
  try {
    const user = await storage.getUser(userId);
    if (!user) {
      await storage.upsertUser({
        id: userId,
        email: userEmail,
        firstName: userEmail.split('@')[0], // A sensible default
      });
    }
    next();
  } catch (error) {
    console.error("Failed to upsert IAP user:", error);
    next(error);
  }
};

// In this setup, we don't need a complex setup function.
export async function setupAuth(app: import("express").Express) {
  console.log("Using IAP authentication strategy.");
}