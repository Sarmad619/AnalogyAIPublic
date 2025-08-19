import type { RequestHandler } from "express";
import { storage } from "./storage";

// Augment the Express Request type for our simplified user object
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

// This is our mock user for local development
const mockUser = {
  id: "local-dev-user",
  email: "dev@analogy.ai",
};

// This middleware function attaches the mock user to every incoming request
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  req.user = mockUser;

  // Ensure the mock user exists in the database
  try {
    const user = await storage.getUser(mockUser.id);
    if (!user) {
      await storage.upsertUser({
        id: mockUser.id,
        email: mockUser.email,
        firstName: "Local",
        lastName: "Developer",
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
  console.log("Using mock authentication for local development.");
}