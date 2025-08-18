import OpenAI from "openai";
import type { GenerateAnalogyRequest, RegenerateAnalogyRequest } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface AnalogyResponse {
  analogy: string;
  example: string;
}

export async function generateAnalogy(request: GenerateAnalogyRequest): Promise<AnalogyResponse> {
  const { topic, context, personalization } = request;
  const { interests, knowledgeLevel } = personalization;

  const interestsText = interests.length > 0 
    ? `The user is interested in: ${interests.join(", ")}. Use these interests to create relatable analogies.`
    : "Create a general analogy that most people can understand.";

  const contextText = context 
    ? `Additional context: ${context}`
    : "";

  const prompt = `You are an expert educator who creates personalized analogies to explain complex concepts. Your goal is to make difficult topics intuitive and memorable.

TOPIC TO EXPLAIN: ${topic}
${contextText}
KNOWLEDGE LEVEL: ${knowledgeLevel}
PERSONALIZATION: ${interestsText}

Create a clear, engaging analogy that:
1. Uses familiar concepts the user can relate to
2. Accurately represents the core principles of the topic
3. Is appropriate for their knowledge level
4. Incorporates their interests when possible

Provide your response in JSON format with:
- "analogy": A clear, engaging analogy explanation
- "example": A concrete, real-world example that demonstrates the concept

Ensure the analogy is accurate, helpful, and memorable.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert educator who creates personalized analogies. Always respond with valid JSON containing 'analogy' and 'example' fields."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.analogy || !result.example) {
      throw new Error("Invalid response format from OpenAI");
    }

    return {
      analogy: result.analogy,
      example: result.example,
    };
  } catch (error) {
    console.error("Error generating analogy:", error);
    throw new Error(`Failed to generate analogy: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function regenerateAnalogy(
  request: RegenerateAnalogyRequest, 
  originalRequest: GenerateAnalogyRequest
): Promise<AnalogyResponse> {
  const { feedback } = request;
  const { topic, context, personalization } = originalRequest;
  const { interests, knowledgeLevel } = personalization;

  const interestsText = interests.length > 0 
    ? `The user is interested in: ${interests.join(", ")}. Use these interests to create relatable analogies.`
    : "Create a general analogy that most people can understand.";

  const contextText = context 
    ? `Additional context: ${context}`
    : "";

  let feedbackInstruction = "";
  switch (feedback) {
    case "too-simple":
      feedbackInstruction = "The previous analogy was too simple. Make this one more sophisticated and detailed.";
      break;
    case "too-complex":
      feedbackInstruction = "The previous analogy was too complex. Make this one simpler and more accessible.";
      break;
    case "different-angle":
      feedbackInstruction = "The user wants a different perspective. Use a completely different analogy approach.";
      break;
    default:
      feedbackInstruction = "Create a new analogy with a fresh perspective.";
  }

  const prompt = `You are an expert educator who creates personalized analogies to explain complex concepts. 

TOPIC TO EXPLAIN: ${topic}
${contextText}
KNOWLEDGE LEVEL: ${knowledgeLevel}
PERSONALIZATION: ${interestsText}
FEEDBACK: ${feedbackInstruction}

Create a NEW analogy that:
1. Addresses the feedback provided
2. Uses different examples than before
3. Maintains accuracy while being engaging
4. Is appropriate for their knowledge level

Provide your response in JSON format with:
- "analogy": A clear, engaging analogy explanation
- "example": A concrete, real-world example that demonstrates the concept

Make sure this analogy is distinctly different from any previous attempts.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert educator who creates personalized analogies. Always respond with valid JSON containing 'analogy' and 'example' fields."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.9,
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.analogy || !result.example) {
      throw new Error("Invalid response format from OpenAI");
    }

    return {
      analogy: result.analogy,
      example: result.example,
    };
  } catch (error) {
    console.error("Error regenerating analogy:", error);
    throw new Error(`Failed to regenerate analogy: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
