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

  const prompt = `You are an expert educator who creates personalized analogies to explain complex concepts. Your goal is to make difficult topics intuitive and memorable with excellent formatting for learning.

TOPIC TO EXPLAIN: ${topic}
${contextText}
KNOWLEDGE LEVEL: ${knowledgeLevel}
PERSONALIZATION: ${interestsText}

CRITICAL FORMATTING REQUIREMENTS:
- Use ### for subheadings to organize sections
- Use **bold** for important concepts, key terms, and crucial points
- Break content into multiple short paragraphs for better readability
- Structure content with clear sections for easy scanning
- Highlight key terminology with **bold** formatting
- Make it visually scannable for optimal learning

Create a clear, engaging analogy that:
1. Uses familiar concepts the user can relate to
2. Accurately represents the core principles of the topic
3. Is appropriate for their knowledge level
4. Incorporates their interests when possible
5. Uses proper formatting with headers, subheadings, and bold text

Provide your response in JSON format with:
- "analogy": A well-formatted analogy with ### subheadings, **bold** key terms, and multiple paragraphs
- "example": A concrete, real-world example with ### subheadings, **bold** key terms, and multiple paragraphs

Example format:
"analogy": "### Main Concept\n\nThink of [concept] as **key analogy**.\n\n### How It Works\n\nThe **important process** works like this: first paragraph.\n\nSecond paragraph with **highlighted terms**.\n\n### Key Points\n\n**Point 1**: Explanation.\n\n**Point 2**: Another explanation."

Ensure the analogy is accurate, helpful, memorable, and properly formatted.`;

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
      max_tokens: 1500,
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
    case "too_simple":
    case "too-simple":
      feedbackInstruction = "The previous analogy was too simple. Make this one more sophisticated and detailed with advanced concepts and terminology.";
      break;
    case "too_advanced":
    case "too-complex":
      feedbackInstruction = "The previous analogy was too advanced. Make this one simpler and more accessible for beginners.";
      break;
    case "different_style":
    case "different-angle":
      feedbackInstruction = "The user wants a different perspective. Use a completely different analogy approach and style.";
      break;
    default:
      feedbackInstruction = "Create a new analogy with a fresh perspective.";
  }

  const prompt = `You are an expert educator who creates personalized analogies to explain complex concepts. Your goal is to make difficult topics intuitive and memorable with excellent formatting for learning.

TOPIC TO EXPLAIN: ${topic}
${contextText}
KNOWLEDGE LEVEL: ${knowledgeLevel}
PERSONALIZATION: ${interestsText}
FEEDBACK: ${feedbackInstruction}

CRITICAL FORMATTING REQUIREMENTS:
- Use ### for subheadings to organize sections
- Use **bold** for important concepts, key terms, and crucial points
- Break content into multiple short paragraphs for better readability
- Structure content with clear sections for easy scanning
- Highlight key terminology with **bold** formatting
- Make it visually scannable for optimal learning

Create a NEW analogy that:
1. Addresses the feedback provided
2. Uses different examples than before
3. Maintains accuracy while being engaging
4. Is appropriate for their knowledge level
5. Uses proper formatting with headers, subheadings, and bold text

Provide your response in JSON format with:
- "analogy": A well-formatted analogy with ### subheadings, **bold** key terms, and multiple paragraphs
- "example": A concrete, real-world example with ### subheadings, **bold** key terms, and multiple paragraphs

Example format:
"analogy": "### Main Concept\n\nThink of [concept] as **key analogy**.\n\n### How It Works\n\nThe **important process** works like this: first paragraph.\n\nSecond paragraph with **highlighted terms**.\n\n### Key Points\n\n**Point 1**: Explanation.\n\n**Point 2**: Another explanation."

Make sure this analogy is distinctly different from any previous attempts and properly formatted.`;

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
      max_tokens: 1500,
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
