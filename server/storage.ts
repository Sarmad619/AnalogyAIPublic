import { 
  type User, 
  type InsertUser, 
  type Analogy, 
  type InsertAnalogy,
  type UpdateProfileRequest 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
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
      displayName: "Demo User",
      createdAt: new Date(),
      personalizationInterests: ["cooking", "photography", "basketball"],
      defaultKnowledgeLevel: "intermediate",
      analogyStyle: "conversational",
      saveHistory: true,
    };
    this.users.set(demoUser.id, demoUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
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

export const storage = new MemStorage();
