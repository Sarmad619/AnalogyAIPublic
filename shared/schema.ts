import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, boolean, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (compatible with Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  personalizationInterests: text("personalization_interests").array().default([]),
  defaultKnowledgeLevel: text("default_knowledge_level").notNull().default("intermediate"),
  analogyStyle: text("analogy_style").notNull().default("conversational"),
  saveHistory: boolean("save_history").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const analogies = pgTable("analogies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  topic: text("topic").notNull(),
  userInputContext: text("user_input_context"),
  personalizationInterests: text("personalization_interests").array().default([]),
  knowledgeLevel: text("knowledge_level").notNull(),
  generatedAnalogy: text("generated_analogy").notNull(),
  generatedExample: text("generated_example").notNull(),
  modelUsed: text("model_used").notNull().default("gpt-4o"),
  createdAt: timestamp("created_at").defaultNow(),
  isFavorite: boolean("is_favorite").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertAnalogySchema = createInsertSchema(analogies).omit({
  id: true,
  createdAt: true,
});

export const generateAnalogySchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  context: z.string().optional(),
  personalization: z.object({
    interests: z.array(z.string()).default([]),
    knowledgeLevel: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  }),
});

export const regenerateAnalogySchema = z.object({
  previousAnalogyId: z.string(),
  feedback: z.string(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().optional(),
  personalizationInterests: z.array(z.string()).optional(),
  defaultKnowledgeLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  analogyStyle: z.enum(["conversational", "technical", "creative"]).optional(),
  saveHistory: z.boolean().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertAnalogy = z.infer<typeof insertAnalogySchema>;
export type Analogy = typeof analogies.$inferSelect;
export type GenerateAnalogyRequest = z.infer<typeof generateAnalogySchema>;
export type RegenerateAnalogyRequest = z.infer<typeof regenerateAnalogySchema>;
export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;
