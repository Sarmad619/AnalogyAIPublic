import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  generateAnalogySchema, 
  regenerateAnalogySchema, 
  updateProfileSchema,
  type GenerateAnalogyRequest 
} from "@shared/schema";
import { generateAnalogy, regenerateAnalogy } from "./services/openai";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Generate analogy endpoint
  app.post("/api/analogy", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Validate request body
      const validatedData = generateAnalogySchema.parse(req.body);
      
      // Generate analogy using OpenAI
      const aiResponse = await generateAnalogy(validatedData);
      
      // Save analogy to storage if user has history enabled
      let savedAnalogy = null;
      if (user.saveHistory) {
        savedAnalogy = await storage.createAnalogy({
          userId: userId,
          topic: validatedData.topic,
          userInputContext: validatedData.context || null,
          personalizationInterests: validatedData.personalization.interests,
          knowledgeLevel: validatedData.personalization.knowledgeLevel,
          generatedAnalogy: aiResponse.analogy,
          generatedExample: aiResponse.example,
          modelUsed: "gpt-4o",
        });
      }

      res.json({
        id: savedAnalogy?.id || null,
        topic: validatedData.topic,
        analogy: aiResponse.analogy,
        example: aiResponse.example,
        createdAt: savedAnalogy?.createdAt || new Date(),
      });

    } catch (error) {
      console.error("Error generating analogy:", error);
      
      if (error instanceof Error && error.message.includes("Failed to generate analogy")) {
        return res.status(500).json({ 
          message: "AI service error. Please check your OpenAI API key and try again.",
          details: error.message
        });
      }
      
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Invalid request data" 
      });
    }
  });

  // Analogy feedback endpoint (for "Helpful" button)
  app.post("/api/analogy/:id/feedback", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const analogyId = req.params.id;
      const { helpful } = req.body;
      
      // Verify the analogy belongs to the user
      const analogy = await storage.getAnalogy(analogyId);
      if (!analogy || analogy.userId !== userId) {
        return res.status(404).json({ message: "Analogy not found" });
      }

      // For now, just return a success message
      // In the future, we could store this feedback for analytics
      res.json({ 
        message: helpful ? "Thanks for your feedback! We're glad this analogy was helpful." : "Thanks for your feedback! We'll work on improving our analogies.",
        success: true 
      });

    } catch (error) {
      console.error("Error recording feedback:", error);
      res.status(500).json({ message: "Failed to record feedback" });
    }
  });

  // Regenerate analogy endpoint
  app.post("/api/analogy/regenerate", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = regenerateAnalogySchema.parse(req.body);
      
      // Get original analogy
      const originalAnalogy = await storage.getAnalogy(validatedData.previousAnalogyId);
      if (!originalAnalogy || originalAnalogy.userId !== userId) {
        return res.status(404).json({ message: "Analogy not found" });
      }

      // Reconstruct original request
      const originalRequest: GenerateAnalogyRequest = {
        topic: originalAnalogy.topic,
        context: originalAnalogy.userInputContext || undefined,
        personalization: {
          interests: originalAnalogy.personalizationInterests || [],
          knowledgeLevel: originalAnalogy.knowledgeLevel as "beginner" | "intermediate" | "advanced",
        },
      };

      // Generate new analogy
      const aiResponse = await regenerateAnalogy(validatedData, originalRequest);
      
      // Save new analogy
      const savedAnalogy = await storage.createAnalogy({
        userId: userId,
        topic: originalAnalogy.topic,
        userInputContext: originalAnalogy.userInputContext,
        personalizationInterests: originalAnalogy.personalizationInterests,
        knowledgeLevel: originalAnalogy.knowledgeLevel,
        generatedAnalogy: aiResponse.analogy,
        generatedExample: aiResponse.example,
        modelUsed: "gpt-4o",
      });

      res.json({
        id: savedAnalogy.id,
        topic: savedAnalogy.topic,
        analogy: aiResponse.analogy,
        example: aiResponse.example,
        createdAt: savedAnalogy.createdAt,
      });

    } catch (error) {
      console.error("Error regenerating analogy:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Invalid request data" 
      });
    }
  });

  // Get user history
  app.get("/api/history", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const analogies = await storage.getUserAnalogies(userId, limit, offset);
      
      res.json({
        analogies: analogies.map(a => ({
          id: a.id,
          topic: a.topic,
          analogy: a.generatedAnalogy,
          example: a.generatedExample,
          createdAt: a.createdAt,
          isFavorite: a.isFavorite,
        })),
        hasMore: analogies.length === limit,
      });

    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  // Get user profile
  app.get("/api/profile", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        personalizationInterests: user.personalizationInterests,
        defaultKnowledgeLevel: user.defaultKnowledgeLevel,
        analogyStyle: user.analogyStyle,
        saveHistory: user.saveHistory,
      });

    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Update user profile
  app.put("/api/profile", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = updateProfileSchema.parse(req.body);
      
      const updatedUser = await storage.updateUser(userId, validatedData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        profileImageUrl: updatedUser.profileImageUrl,
        personalizationInterests: updatedUser.personalizationInterests,
        defaultKnowledgeLevel: updatedUser.defaultKnowledgeLevel,
        analogyStyle: updatedUser.analogyStyle,
        saveHistory: updatedUser.saveHistory,
      });

    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Invalid request data" 
      });
    }
  });

  // Toggle favorite analogy
  app.put("/api/analogy/:id/favorite", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const analogyId = req.params.id;
      const { isFavorite } = req.body;
      
      const analogy = await storage.getAnalogy(analogyId);
      if (!analogy || analogy.userId !== userId) {
        return res.status(404).json({ message: "Analogy not found" });
      }

      const updatedAnalogy = await storage.updateAnalogy(analogyId, { isFavorite });
      
      if (!updatedAnalogy) {
        return res.status(500).json({ message: "Failed to update analogy" });
      }

      res.json({ success: true, isFavorite: updatedAnalogy.isFavorite });

    } catch (error) {
      console.error("Error toggling favorite:", error);
      res.status(500).json({ message: "Failed to toggle favorite" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
