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

// This is our public "guest" user for the live, deployed site
const publicUser = {
  id: "public-guest-user",
  email: "guest@analogy.ai",
};

// This middleware function attaches the public user to every incoming request
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  req.user = publicUser;

  // Ensure the guest user exists in the database
  try {
    const user = await storage.getUser(publicUser.id);
    if (!user) {
      await storage.upsertUser({
        id: publicUser.id,
        email: publicUser.email,
        firstName: "Public",
        lastName: "User",
      });
    }
    next();
  } catch (error) {
    console.error("Failed to upsert public user:", error);
    next(error);
  }
};

// We don't need a complex setup function for this strategy
export async function setupAuth(app: import("express").Express) {
  console.log("Using public guest user authentication strategy.");
}