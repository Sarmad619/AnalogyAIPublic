import { apiRequest } from "./queryClient";

export interface AnalogyResponse {
  id: string | null;
  topic: string;
  analogy: string;
  example: string;
  createdAt: string;
}

export interface GenerateAnalogyRequest {
  topic: string;
  context?: string;
  personalization: {
    interests: string[];
    knowledgeLevel: "beginner" | "intermediate" | "advanced";
  };
}

export interface RegenerateAnalogyRequest {
  previousAnalogyId: string;
  feedback: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  personalizationInterests: string[];
  defaultKnowledgeLevel: "beginner" | "intermediate" | "advanced";
  analogyStyle: "conversational" | "technical" | "creative";
  saveHistory: boolean;
}

export interface HistoryResponse {
  analogies: {
    id: string;
    topic: string;
    analogy: string;
    example: string;
    createdAt: string;
    isFavorite: boolean;
  }[];
  hasMore: boolean;
}

export const api = {
  async generateAnalogy(data: GenerateAnalogyRequest): Promise<AnalogyResponse> {
    const response = await apiRequest("POST", "/api/analogy", data);
    return response.json();
  },

  async regenerateAnalogy(data: RegenerateAnalogyRequest): Promise<AnalogyResponse> {
    const response = await apiRequest("POST", "/api/analogy/regenerate", data);
    return response.json();
  },

  async getHistory(limit = 20, offset = 0): Promise<HistoryResponse> {
    const response = await apiRequest("GET", `/api/history?limit=${limit}&offset=${offset}`);
    return response.json();
  },

  async getProfile(): Promise<UserProfile> {
    const response = await apiRequest("GET", "/api/profile");
    return response.json();
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await apiRequest("PUT", "/api/profile", data);
    return response.json();
  },

  async toggleFavorite(analogyId: string, isFavorite: boolean): Promise<{ success: boolean; isFavorite: boolean }> {
    const response = await apiRequest("PUT", `/api/analogy/${analogyId}/favorite`, { isFavorite });
    return response.json();
  },

  async submitFeedback(analogyId: string, helpful: boolean): Promise<{ message: string; success: boolean }> {
    const response = await apiRequest("POST", `/api/analogy/${analogyId}/feedback`, { helpful });
    return response.json();
  },
};
