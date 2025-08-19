import type { Express, Request, Response } from "express";
import { createServer, Server } from "http";
import { storage } from "./storage";
import {
  generateAnalogySchema,
  regenerateAnalogySchema,
  updateProfileSchema,
  type GenerateAnalogyRequest
} from "@shared/schema";
import { generateAnalogy, regenerateAnalogy } from "./services/openai";
import { setupAuth, isAuthenticated } from "./iapAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);

  app.get('/api/auth/user', isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/analogy", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const validatedData = generateAnalogySchema.parse(req.body);
      const aiResponse = await generateAnalogy(validatedData);

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

  app.post("/api/analogy/:id/feedback", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const analogyId = req.params.id;
      const { helpful } = req.body;

      const analogy = await storage.getAnalogy(analogyId);
      if (!analogy || analogy.userId !== userId) {
        return res.status(404).json({ message: "Analogy not found" });
      }

      res.json({
        message: helpful ? "Thanks for your feedback! We're glad this analogy was helpful." : "Thanks for your feedback! We'll work on improving our analogies.",
        success: true
      });

    } catch (error) {
      console.error("Error recording feedback:", error);
      res.status(500).json({ message: "Failed to record feedback" });
    }
  });

  app.post("/api/analogy/regenerate", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const validatedData = regenerateAnalogySchema.parse(req.body);

      const originalAnalogy = await storage.getAnalogy(validatedData.previousAnalogyId);
      if (!originalAnalogy || originalAnalogy.userId !== userId) {
        return res.status(404).json({ message: "Analogy not found" });
      }

      const originalRequest: GenerateAnalogyRequest = {
        topic: originalAnalogy.topic,
        context: originalAnalogy.userInputContext || undefined,
        personalization: {
          interests: originalAnalogy.personalizationInterests || [],
          knowledgeLevel: originalAnalogy.knowledgeLevel as "beginner" | "intermediate" | "advanced",
        },
      };

      const aiResponse = await regenerateAnalogy(validatedData, originalRequest);

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

  app.get("/api/history", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
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

  app.get("/api/profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);

    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put("/api/profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const validatedData = updateProfileSchema.parse(req.body);

      const updatedUser = await storage.updateUser(userId, validatedData);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);

    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(400).json({
        message: error instanceof Error ? error.message : "Invalid request data"
      });
    }
  });

  app.put("/api/analogy/:id/favorite", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const analogyId = req.params.id;
      const { isFavorite } = req.body;

      const analogy = await storage.getAnalogy(analogyId);
      if (!analogy || analogy.userId !== userId) {
        return res.status(404).json({ message: "Analogy not found" });
      }

      const updatedAnalogy = await storage.updateAnalogy(analogyId, { isFavorite });

      // This is the corrected line
      if (!updatedAnalogy) {
        return res.status(500).json({ message: "Failed to update analogy" });
      }

      res.json({ success: true, isFavorite: updatedAnalogy.isFavorite });

    } catch (error) {
      console.error("Error toggling favorite:", error);
      res.status(500).json({ message: "Failed to toggle favorite" });
    }
  });

  app.delete("/api/analogy/:id", isAuthenticated, async (req: Request, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const success = await storage.deleteAnalogy(userId, id);

      if (!success) {
        return res.status(404).json({ message: "Analogy not found or not authorized to delete" });
      }

      res.json({ message: "Analogy deleted successfully" });
    } catch (error) {
      console.error("Error deleting analogy:", error);
      res.status(500).json({ message: "Failed to delete analogy" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}