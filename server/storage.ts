import { 
  type User, 
  type InsertUser, 
  type Analogy, 
  type InsertAnalogy,
  type UpdateProfileRequest,
  type UpsertUser,
  users,
  analogies,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, or } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations (compatible with Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: UpdateProfileRequest): Promise<User | undefined>;

  // Analogy operations
  getAnalogy(id: string): Promise<Analogy | undefined>;
  createAnalogy(analogy: InsertAnalogy): Promise<Analogy>;
  getUserAnalogies(userId: string, limit?: number, offset?: number): Promise<Analogy[]>;
  updateAnalogy(id: string, updates: Partial<Analogy>): Promise<Analogy | undefined>;
  deleteAnalogy(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: UpdateProfileRequest): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Analogy operations
  async getAnalogy(id: string): Promise<Analogy | undefined> {
    const [analogy] = await db.select().from(analogies).where(eq(analogies.id, id));
    return analogy;
  }

  async createAnalogy(insertAnalogy: InsertAnalogy): Promise<Analogy> {
    const [analogy] = await db.insert(analogies).values(insertAnalogy).returning();
    return analogy;
  }

  async getUserAnalogies(userId: string, limit = 50, offset = 0): Promise<Analogy[]> {
    return await db
      .select()
      .from(analogies)
      .where(eq(analogies.userId, userId))
      .orderBy(desc(analogies.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async updateAnalogy(id: string, updates: Partial<Analogy>): Promise<Analogy | undefined> {
    const [analogy] = await db
      .update(analogies)
      .set(updates)
      .where(eq(analogies.id, id))
      .returning();
    return analogy;
  }

  async deleteAnalogy(id: string): Promise<boolean> {
    const result = await db.delete(analogies).where(eq(analogies.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private analogies: Map<string, Analogy>;

  constructor() {
    this.users = new Map();
    this.analogies = new Map();
    
    // Create a demo user for MVP
    const demoUser: User = {
      id: "demo-user",
      email: "demo@analogyai.com",
      firstName: "Demo",
      lastName: "User",
      profileImageUrl: null,
      personalizationInterests: ["cooking", "photography", "basketball"],
      defaultKnowledgeLevel: "intermediate",
      analogyStyle: "conversational",
      saveHistory: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(demoUser.id, demoUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    if (existingUser) {
      const updatedUser = { ...existingUser, ...userData, updatedAt: new Date() };
      this.users.set(userData.id!, updatedUser);
      return updatedUser;
    }
    
    const user: User = {
      id: userData.id || randomUUID(),
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      personalizationInterests: userData.personalizationInterests || [],
      defaultKnowledgeLevel: userData.defaultKnowledgeLevel || "intermediate",
      analogyStyle: userData.analogyStyle || "conversational",
      saveHistory: userData.saveHistory ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      id, 
      email: insertUser.email || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      profileImageUrl: insertUser.profileImageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      personalizationInterests: insertUser.personalizationInterests || [],
      defaultKnowledgeLevel: insertUser.defaultKnowledgeLevel || "intermediate",
      analogyStyle: insertUser.analogyStyle || "conversational",
      saveHistory: insertUser.saveHistory ?? true,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: UpdateProfileRequest): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAnalogy(id: string): Promise<Analogy | undefined> {
    return this.analogies.get(id);
  }

  async createAnalogy(insertAnalogy: InsertAnalogy): Promise<Analogy> {
    const id = randomUUID();
    const analogy: Analogy = {
      ...insertAnalogy,
      id,
      createdAt: new Date(),
      isFavorite: false,
      personalizationInterests: insertAnalogy.personalizationInterests || [],
      userInputContext: insertAnalogy.userInputContext || null,
      modelUsed: insertAnalogy.modelUsed || "gpt-4o",
    };
    this.analogies.set(id, analogy);
    return analogy;
  }

  async getUserAnalogies(userId: string, limit = 50, offset = 0): Promise<Analogy[]> {
    const userAnalogies = Array.from(this.analogies.values())
      .filter(analogy => analogy.userId === userId)
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      })
      .slice(offset, offset + limit);
    
    return userAnalogies;
  }

  async updateAnalogy(id: string, updates: Partial<Analogy>): Promise<Analogy | undefined> {
    const analogy = this.analogies.get(id);
    if (!analogy) return undefined;
    
    const updatedAnalogy = { ...analogy, ...updates };
    this.analogies.set(id, updatedAnalogy);
    return updatedAnalogy;
  }

  async deleteAnalogy(id: string): Promise<boolean> {
    return this.analogies.delete(id);
  }
}

export const storage = new DatabaseStorage();
