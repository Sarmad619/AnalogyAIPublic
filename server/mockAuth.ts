import type { RequestHandler, Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Augment the Express Request type to include 'user'
declare global {
  namespace Express {
    interface User {
      claims: {
        sub: string;
        email?: string;
        first_name?: string;
        last_name?: string;
        profile_image_url?: string;
      };
    }
    interface Request {
      user?: User;
    }
  }
}

// This is our mock user for local development
const mockUser = {
  claims: {
    sub: "local-dev-user",
    email: "dev@analogy.ai",
    first_name: "Local",
    last_name: "Developer",
    profile_image_url: ""
  }
};

// This middleware function attaches the mock user to every incoming request
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  req.user = mockUser;

  // Ensure the mock user exists in the database
  try {
    const user = await storage.getUser(mockUser.claims.sub);
    if (!user) {
      await storage.upsertUser({
        id: mockUser.claims.sub,
        email: mockUser.claims.email,
        firstName: mockUser.claims.first_name,
        lastName: mockUser.claims.last_name,
        profileImageUrl: mockUser.claims.profile_image_url,
      });
    }
    next();
  } catch (error) {
    console.error("Failed to upsert mock user:", error);
    next(error);
  }
};

// We don't need a complex setup for the main auth function in local dev
export async function setupAuth(app: import("express").Express) {
  // No session or passport setup needed for mock auth
  console.log("Using mock authentication for local development.");
}