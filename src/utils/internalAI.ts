import { supabase } from "@/integrations/supabase/client";

export type AIInteractionType = 
  | 'summarization'
  | 'reformatting'
  | 'personalization'
  | 'translation'
  | 'insights';

export interface InternalAIRequest {
  prompt: string;
  interactionType: AIInteractionType;
  context?: any;
  systemPrompt?: string;
}

export interface InternalAIResponse {
  response: string;
  interactionType: AIInteractionType;
  tokensUsed: number;
  success: boolean;
  error?: string;
}

/**
 * Helper function to call internal AI for lightweight tasks
 * Uses AIML GPT-5 API for quick AI operations within the app
 */
export async function callInternalAI({
  prompt,
  interactionType,
  context,
  systemPrompt
}: InternalAIRequest): Promise<InternalAIResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('internal-ai', {
      body: {
        prompt,
        interactionType,
        context,
        systemPrompt
      }
    });

    if (error) {
      console.error('Internal AI error:', error);
      throw new Error(error.message || 'Failed to get AI response');
    }

    if (!data.success) {
      throw new Error(data.error || 'AI request failed');
    }

    return {
      response: data.response,
      interactionType: data.interactionType,
      tokensUsed: data.tokensUsed,
      success: true
    };
  } catch (error) {
    console.error('callInternalAI error:', error);
    return {
      response: '',
      interactionType,
      tokensUsed: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Convenience functions for specific AI interaction types

export async function summarizeContent(content: string, context?: any): Promise<string> {
  const result = await callInternalAI({
    prompt: `Please provide a concise summary of the following content: ${content}`,
    interactionType: 'summarization',
    context
  });
  
  return result.success ? result.response : 'Summary unavailable';
}

export async function reformatContent(
  content: string, 
  targetFormat: string,
  context?: any
): Promise<string> {
  const result = await callInternalAI({
    prompt: `Please reformat the following content into ${targetFormat}: ${content}`,
    interactionType: 'reformatting',
    context
  });
  
  return result.success ? result.response : content;
}

export async function personalizeContent(
  content: string,
  level: 'beginner' | 'intermediate' | 'advanced',
  tone: string = 'professional',
  context?: any
): Promise<string> {
  const result = await callInternalAI({
    prompt: `Please personalize this content for a ${level} level audience with a ${tone} tone: ${content}`,
    interactionType: 'personalization',
    context
  });
  
  return result.success ? result.response : content;
}

export async function translateContent(
  content: string,
  targetLanguage: string,
  context?: any
): Promise<string> {
  const result = await callInternalAI({
    prompt: `Please translate the following content to ${targetLanguage}: ${content}`,
    interactionType: 'translation',
    context
  });
  
  return result.success ? result.response : content;
}

export async function generateInsights(
  data: any,
  focusArea?: string,
  context?: any
): Promise<string> {
  const prompt = focusArea 
    ? `Please generate insights focused on ${focusArea} from this data: ${JSON.stringify(data)}`
    : `Please generate key insights and recommendations from this data: ${JSON.stringify(data)}`;
    
  const result = await callInternalAI({
    prompt,
    interactionType: 'insights',
    context
  });
  
  return result.success ? result.response : 'No insights available';
}